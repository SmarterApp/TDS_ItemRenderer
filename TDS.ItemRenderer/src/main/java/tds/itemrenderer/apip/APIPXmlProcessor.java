/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip;

import java.util.ArrayList;
import java.util.List;

import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import tds.itemrenderer.data.AccProperties;
import tds.itemrenderer.data.ITSDocumentXml;
import tds.itemrenderer.data.ITSTypes.ITSContentType;
import tds.itemrenderer.data.ITSTypes.ITSContextType;
import tds.itemrenderer.data.apip.APIPAccessElement;
import tds.itemrenderer.data.apip.APIPXml;
import tds.itemrenderer.processing.IProcessorTask;
import tds.itemrenderer.processing.XmlUtils;

/**
 * @author jmambo
 *
 */
public class APIPXmlProcessor implements IProcessorTask<Document>
{
  private final APIPMode      _apipMode;
  private final APIPRuleGroup _apipRuleGroup;
  private final AccProperties _accProperties;

  public APIPXmlProcessor (APIPMode apipMode, APIPRuleGroup apipRuleGroup, AccProperties accProperties) {
    _apipMode = apipMode;
    _apipRuleGroup = apipRuleGroup;
    _accProperties = accProperties;
  }

  public int getContentSupported () {
    return ITSContentType.Html.getValue ();
  }

  public Document process (ITSDocumentXml itsDocument, ITSContentType contentType, ITSContextType contextType, String language, Document contextXml) {
    // get APIP xml
    APIPXml apipXml = itsDocument.getContent (language).getApip ();
    if (apipXml == null || apipXml.getAccessElements () == null) {
      return contextXml;
    }

    // create rules engine
    APIPRulesEngine rulesEngine = new APIPRulesEngine (_apipMode, _apipRuleGroup, contextType);

    // NOTE: We need to get all the elements up front with ToList() or we will
    // get a NULL error when in BRF mode and use ReplaceWith().
    List<ApipElement> apipElements = getAPIPElements (contextXml, apipXml);

    // process each APIP placeholder element found in the HTML
    for (ApipElement apipElement : apipElements) {
      APIPAccessElement apipAccessElement = apipElement.getApipAccessElement ();
      Element apipNode = apipElement.getElement ();
  
      // get APIP text for the rules
      String text = rulesEngine.evaluate(apipNode.getNodeName(), apipAccessElement, _accProperties);

      if (text != null) {
        if (_apipMode == APIPMode.TTS) {
          addTTSToNode (apipNode, text);
        } else if (_apipMode == APIPMode.Braille || _apipMode == APIPMode.BRF) {
          addBrailleToNode (apipNode, text);
        }
      }

    }

    return contextXml;

  }


  /**
   * Get a list of all the APIP placeholders in the HTML
   * 
   * @param contextXml
   * @param apipXml
   * @return
   */
  private List<ApipElement> getAPIPElements (Document contextXml, APIPXml apipXml) {

    NodeList nodeList = XmlUtils.getNodeListByPath (contextXml, "//span|//table|//img");

    // find all span/table/img elements with an ID
    List<ApipElement> apipElements = new ArrayList<> ();
    if (nodeList != null) {
      for (int i=0; i< nodeList.getLength(); i++) {
        Element element = (Element) nodeList.item(i);
        String idAttrib = element.getAttribute ("id");
        if (idAttrib != null) {
          APIPAccessElement accessElement = apipXml.getRelatedElementInfo (idAttrib);
          if (accessElement != null) {
            apipElements.add (new ApipElement (element, accessElement));
          }
        }

      }
    }
    return apipElements;
  }

  private void addTTSToNode (Element node, String text)  {
    if (node.getNodeName ().equals ("img")) {
      node.setAttribute ("alt", text);
    } else if (node.getNodeName ().equals ("table")) {
      node.setAttribute ("summary", text);
    } else {
      addSSMLToNode (node, text);
    }
  }

  private void addSSMLToNode (Element node, String tts)  {
    addClassName (node, "TTS speakAs");
    node.setAttribute ("ssml", "sub");
    node.setAttribute ("ssml_alias", tts);
  }

  private void addBrailleToNode (Element node, String text)  {
    // Image
    if (node.getNodeName ().equals ("img")) {

      // if in BRF mode replace images with spans
      if (_apipMode == APIPMode.BRF) {
        // create a span to hold the braille text
        node = replaceNodeWithSpan (node);
      } else {
        node.setAttribute ("alt", text);
      }
    }

    // Table
    if (node.getNodeName ().equals ("table")) {
      // if in BRF mode add a span before the table with the summary in it
      if (_apipMode == APIPMode.BRF) {
        // get ID attrib of table and remove it
        String attribId = node.getAttribute ("id");

        node.removeAttribute ("id");

        // create new span and put it before table
        Element span = XmlUtils.createElement (node, "span");
        span.setAttribute ("id", attribId);
        //  node.before (span);
        XmlUtils.insertBefore (span, node);
        node = span; // swap our node ref with new span
      } else {
        node.setAttribute ("summary", text);
      }
    }

    // Span (this needs to be last in case <img> or <table> get replaced with
    // <span>)
    if (node.getNodeName ().equals ("span")) {

      // HACK: If the text contains ntr tag we need to add this as xml or it
      // gets escaped as text
      if (text.contains ("<ntr>") && text.contains ("</ntr>")) {
        // remove ntr tag from text so it doesn't get escaped
        text = text.replace ("<ntr>", "");
        text = text.replace ("</ntr>", "");

        // create ntr node and add APIP text
        Element ntrNode = XmlUtils.createElement (node, "ntr");
        ntrNode.setTextContent (text);

        // add ntr node
        node.appendChild (ntrNode);
      }
      else {
        node.setTextContent (text);
      }
    }

    // AddClassName(node, "braille");
  }

  private Element replaceNodeWithSpan (Element currentNode) {
    // create replacement node
    String id = (String) currentNode.getAttribute ("id");
    Element replacementNode = XmlUtils.createElement (currentNode, "span");
    replacementNode.setAttribute ("id", id);

    // replace existing node
     XmlUtils.replaceWith (currentNode, replacementNode);
    return replacementNode;
  }

  /**
   * Add a class class name to an element. If one already exists then it will
   *  
   * @param element
   * @param className
   */
  private void addClassName (Element element, String className) {
    String classAttrib = element.getAttribute ("class");

    if (classAttrib != null && classAttrib.trim ().length () > 0) {
      element.setAttribute ("class", classAttrib.trim () + " " + className);
    } else {
      element.setAttribute ("class", className);
    }
  }

}

class ApipElement
{
  Element           _element;
  APIPAccessElement _apipAccessElement;

  ApipElement (Element element, APIPAccessElement apipAccessElement) {
    _element = element;
    _apipAccessElement = apipAccessElement;
  }

  public Element getElement () {
    return _element;
  }

  public void setElement (Element element) {
    _element = element;
  }

  public APIPAccessElement getApipAccessElement () {
    return _apipAccessElement;
  }

  public void setApipAccessElement (APIPAccessElement apipAccessElement) {
    _apipAccessElement = apipAccessElement;
  }

}
