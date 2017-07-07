/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip;

import java.io.File;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Attr;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import tds.itemrenderer.apip.brftransformationrules.Attributes.Attribute;
import tds.itemrenderer.apip.brftransformationrules.KeepChildrenValues;
import tds.itemrenderer.apip.brftransformationrules.TransformationRules;
import tds.itemrenderer.apip.brftransformationrules.TransformationRules.Tag;
import tds.itemrenderer.apip.brftransformationrules.TransformationRules.Tag.Transformations.Transform;
import tds.itemrenderer.data.ITSDocumentXml;
import tds.itemrenderer.data.ITSTypes.ITSContentType;
import tds.itemrenderer.data.ITSTypes.ITSContextType;
import tds.itemrenderer.data.ITSTypes.ITSEntityType;
import tds.itemrenderer.processing.IProcessorTask;
import tds.itemrenderer.processing.XmlUtils;
import AIR.Common.Utilities.TDSStringUtils;

/**
 * @author jmambo
 *
 */
public class BRFProcessor implements IProcessorTask<Document>
{

  private static final Logger                     _logger                  = LoggerFactory.getLogger (BRFProcessor.class);

  private static Map<String, TransformationRules> _brfRulesHash            = new HashMap<> ();

  private static String                           _brfRulesFileNamePattern = null;

  private static final JAXBContext                _jaxbContext             = getJaxbContext ();

  private final static Object                     _lock                    = new Object ();

  private TransformationRules                     _brfRules                = null;



  /**
   * Gets JAXB context
   * 
   * @return JAXBContext
   */
  private static JAXBContext getJaxbContext () {
    try {
      return JAXBContext.newInstance (TransformationRules.class);
    } catch (JAXBException e) {
      _logger.error (e.getMessage (), e);
    }
    return null;
  }

  public static void SetBRFRulesFileNamePattern (String pattern) {
    _brfRulesFileNamePattern = pattern;
  }

  private void initBRFRules (String client) {
    if (_brfRulesHash.containsKey (client))
    {
      _brfRules = _brfRulesHash.get (client);
      return;
    }
    synchronized (_lock) {

      if (!_brfRulesHash.containsKey (client)) {

        try {
          Unmarshaller jaxbUnmarshaller = _jaxbContext.createUnmarshaller ();
          _brfRules = (TransformationRules) jaxbUnmarshaller.unmarshal (new File (TDSStringUtils.format (_brfRulesFileNamePattern, client)));
          _brfRulesHash.put (client, _brfRules);
        } catch (Exception exp) {
          throw new RuntimeException ("There was a problem loading the braille transformation rules file : " + exp.getMessage (), exp);
        }
      }
    }
    _brfRules = _brfRulesHash.get (client);
  }

  public BRFProcessor (String ttxBusinessRule)  {
    String client = "Default";
    if (ttxBusinessRule != null)
    {
      ttxBusinessRule = ttxBusinessRule.toLowerCase ();
      if (ttxBusinessRule.contains ("_hi"))
        client = "Hawaii";
      else if (ttxBusinessRule.contains ("_or"))
        client = "Oregon";
      else if (ttxBusinessRule.contains ("_de"))
        client = "Delaware";
      else if (ttxBusinessRule.contains ("_mn"))
        client = "Minnesota";
    }
    initBRFRules (client);
  }

  public int getContentSupported () {
    return ITSContentType.Html.getValue ();
  }

  public Document process (ITSDocumentXml itsDocument, ITSContentType contentType, ITSContextType contextType, String language, Document xml) {
    try {
      if (itsDocument.getType () == ITSEntityType.Passage) {
        contextType = ITSContextType.Passage;
      }

      NodeList listOfElements = XmlUtils.getAllElements (xml);
      if (listOfElements != null) {
          processList (listOfElements, contextType);
    
          // get the list again - nodes may have been deleted etc and that is why we
          // need to
          // get the list again.
          listOfElements = XmlUtils.getAllElements (xml);
          if (listOfElements != null) {
            for (int i =0; i < listOfElements.getLength (); i++) {
              Element element = (Element) listOfElements.item (i);
              processNode (element, contextType);
            }
          }
      }
    } catch (Exception exp) {
      
      Node node = xml.createCDATASection (exp.getMessage() + " \n "  );
      xml.appendChild (node);
      _logger.error (exp.getMessage (), exp);
    }
    return xml;
  }

  private void processNode (Element xml, ITSContextType contextType) {
    NodeList listOfElements = XmlUtils.getAllElements (xml);
    if (listOfElements != null) {
      processList (listOfElements, contextType);
      // recurse.
      listOfElements = XmlUtils.getAllElements (xml);
      if (listOfElements != null) {
        for (int i = 0; i < listOfElements.getLength (); i++) {
          Element element  = (Element) listOfElements.item (i);
            processNode (element, contextType);
        }
      }
    }
  }

  private void processList (NodeList nodeList, ITSContextType contextType) {
    // initialize the list of tag processors for this recursion depth.
    // we will add data to it only during the course of iterating through the
    // list
    // of elements.
    Map<String, TagDataProcessor> tagProcessors = new HashMap<String, TagDataProcessor> ();
    if (nodeList != null) {
      for (int i = 0; i < nodeList.getLength (); i++) {
        Element element = (Element) nodeList.item (i);
        String name = element.getNodeName ().toLowerCase ();
        if (!tagProcessors.containsKey (name)) {
          // hmm...we have not seen this tag before during the course of
          // processing this
          // list. we would need to create a new processor.
          tagProcessors.put (name, new TagDataProcessor (_brfRules, element.getNodeName ()));
        }
        TagDataProcessor processor = tagProcessors.get (name);
        processor.process (element, contextType);
      }
    }
  }

}

class TagDataProcessor
{
  // the number of times we have seen tagName during the course of processing.
  private int                 occurrence      = 0;

  private String              tagName         = null;

  // pointer to the set of rules according to which transformations need to be
  // carried out.
  private TransformationRules processingRules = null;

  public TagDataProcessor (TransformationRules brfRules, String tagName) {
    this.tagName = tagName;
    this.processingRules = brfRules;
  }

  private Element generateTextNode (Node node, String value) {

    Element element = XmlUtils.createElement (node, tagName);
    element.setTextContent (value);
    return element;
  }

  private Element generateXTextForNotImplementedKeepChildrenValues (Node node, KeepChildrenValues value) {
    // we currently do not have implementation for all, specifiedonlyandtext,
    // specifiedonly.
    return generateTextNode (node, value.toString () + " not implemented. Only textOnly and none are available.");
  }

  private void checkForCompatibilityOfChildRules (Element node, Transform ruleToApply) {
    KeepChildrenValues keepChildrenValues = ruleToApply.getKeepchildren ();

    // TODO: jmambo check why C# ruleToApply.KeepchildrenSpecified is used
    // without being set first
    boolean ruleToApplyKeepchildrenSpecified = true;
    if (ruleToApplyKeepchildrenSpecified) {// TODO:
      // we currently do not have implementation for all, specifiedonlyandtext,
      // specifiedonly.
      if (keepChildrenValues.value ().equals (keepChildrenValues.ALL) || keepChildrenValues.value ().equals (KeepChildrenValues.SPECIFIEDONLYANDTEXT)
          || keepChildrenValues.value ().equals (KeepChildrenValues.SPECIFIEDONLY)) {
        node.appendChild ( generateXTextForNotImplementedKeepChildrenValues (node, ruleToApply.getKeepchildren ()));
      }

      if (ruleToApply.getNewTag () != null) {
        // if a new tag is specified the only allowed KeepChildrenValue is
        // KeepChildrenValues.all
        if (ruleToApply.getKeepchildren () != KeepChildrenValues.ALL)
        {
          node.appendChild (generateTextNode (node, "When NewTag is present the only allowed value is KeepChildrenValues.all"));
        }
      }
    }

  }

  public void process (Element node, ITSContextType contextType)  {

    // first lets increment the occurence count
    this.occurrence++;
    List<Transform> listOfRules = getMatches (node, contextType);
    // first we will try to find if there is a rule for this occurence.
    Transform ruleToApply = null;
    for (Transform rule : listOfRules) {
      if (rule.getOccurrence () != null) {
        if (rule.getOccurrence ().intValue () == this.occurrence) {
          // ok. there is a rule for this specific occurence.
          // lets just use it.
          ruleToApply = rule;
          break;
        }
      } else {
        if (ruleToApply == null) {
          // we do not want to override a specific rule if one has already been
          // set.
          // note: if there are more than one rules which apply to the general
          // case,
          // the last one will be applied.
          ruleToApply = rule;
        }
      }
    }
    if (ruleToApply != null) {

      boolean removeNode = false;

      // check if there are any wrong values for Keepchildren and
      // ruleToApply.NewTag.
      checkForCompatibilityOfChildRules (node, ruleToApply);

      // ok...so we do now have a rule that we need to apply.
      if (ruleToApply.getNewTag () != null) {
        // does the rule require changing the name of the tag?
        String newTagName = ruleToApply.getNewTag ().getTagName ().toLowerCase ();
        String currentTagName = node.getNodeName ().toLowerCase ();
        if (!newTagName.equals (currentTagName)) {
          node.getOwnerDocument ().renameNode (node, "", newTagName);
        }

        // now what about attributes?
        // lets first create a map of all attributes that need to be there.
        // we will remove any that are not there and modify the ones which are
        // there
        // according to the rules of transformation.
        Map<String, String> mapOfTransformRuleAttributes = new HashMap<String, String> ();
        if (ruleToApply.getNewTag ().getAttributes () != null && ruleToApply.getNewTag ().getAttributes ().getAttribute () != null
            && ruleToApply.getNewTag ().getAttributes ().getAttribute ().size () > 0) {
          for (Attribute attribute : ruleToApply.getNewTag ().getAttributes ().getAttribute ()) {
            mapOfTransformRuleAttributes.put (attribute.getName ().toLowerCase (), attribute.getValue ());
          }
        }
        NamedNodeMap attributes = node.getAttributes ();
        if (attributes != null) {
          int numAttrs = attributes.getLength();
          for (int i = 0; i < numAttrs; i++) {
            Attr attribute = (Attr) attributes.item(i);
            if (mapOfTransformRuleAttributes.containsKey (attribute.getNodeName ().toLowerCase ())) {
              // so the attribute is there in the transformation rule.
              // we will just set its value to that dictated by the transformation
              // rule.
              attribute.setValue (mapOfTransformRuleAttributes.get (attribute.getNodeName ().toLowerCase ()));
              mapOfTransformRuleAttributes.remove (attribute.getNodeName ().toLowerCase ());
            } else {
              // so the node currently has a attribute which is not there in the
              // transformation
              // rule. lets remove it.
              node.removeAttribute (attribute.getNodeName ());
            }
  
            // we will now go ahead and remove this key from the temporary
            // mapping.
            // the reason is at the end of this for loop we will have to add all
            // the attributes which
            // currently do not exist in the node.
          }
        }

        // now is the step in which we need to add all attributes which do not
        // already exist.
        for (String key : mapOfTransformRuleAttributes.keySet ()) {
          String value = mapOfTransformRuleAttributes.get (key);
          node.setAttribute (key, value);
        }
      } else {
        // ok...so we are going to remove this tag.
        KeepChildrenValues keepchildrenValues = ruleToApply.getKeepchildren ();
        // TODO: jmambo check why C# ruleToApply.KeepchildrenSpecified is used
        // without being set first
        boolean ruleToApplyKeepchildrenSpecified = true;
        if (ruleToApplyKeepchildrenSpecified) {// TODO:
          if (keepchildrenValues.value ().equals (KeepChildrenValues.TEXT_ONLY)) {
            String textValue = node.getTextContent ();
            XmlUtils.insertAfter(node, generateTextNode (node, textValue));
            removeNode = true;
          } else if (keepchildrenValues.equals (KeepChildrenValues.NONE)) { // TODO:
            removeNode = true;
          }
        }
      }

      if (removeNode) {
        node.getParentNode().removeChild(node);
      }
    }
  }

  private List<Transform> getMatches (Element node, ITSContextType contextType)
  {
    String contextTypeString = contextType.toString ().toLowerCase ();

    List<Transform> transformationsMatched = new ArrayList<> ();
    List<Transform> globalTransformationsMatched = new ArrayList<> ();

    // lets first see which transform subsecions match our node.
    for (Tag tag : processingRules.getTag ()) {

      List<Transform> toAddList = null;
      // we will maintain two separate lists of rule matches: global and context
      // dependent.
      // if there is a context dependent match then we will only return that
      // else we will return global matches
      if (contextType != ITSContextType.All && contextTypeString.equals (tag.getContextType ().toString ().toLowerCase ())) {
        toAddList = transformationsMatched;
      }
      else if (ITSContextType.All.toString ().toLowerCase ().equals (tag.getContextType ().toString ().toLowerCase ())) {
        toAddList = globalTransformationsMatched;
      } else {
        continue;
      }

      if (toAddList.size () == 0 && isMatch (node, tag)) {
        // ok...so this one matches. we will do one
        for (Transform transformAs : tag.getTransformations ().getTransform ()) {
          toAddList.add (transformAs);
        }
      }
    }

    if (transformationsMatched.size () != 0) {
      return transformationsMatched;
    } else {
      return globalTransformationsMatched;
    }

  }

  private boolean isMatch (Element node, Tag rulesTag) {
    String nodeName = node.getNodeName ().toLowerCase ();
    if (rulesTag.getTagName ().equals (nodeName)) {
      Map<String, String> existingAttributes = new HashMap<> ();
      if (rulesTag.getAttributes () != null && rulesTag.getAttributes ().getAttribute () != null) {
        // lets add all the attributes that we have for this rule match to the
        // map.

        for (Attribute attribute : rulesTag.getAttributes ().getAttribute ()) {
          String attributeName = attribute.getName ().toLowerCase ();
          String attributeValue = attribute.getValue ().toLowerCase ();
          if (attributeValue != null) {
            attributeValue = attributeValue.replace ("\\s+", "");
          }
          existingAttributes.put (attributeName, attributeValue);
        }
      }

      // Is a content match required? If a text match has been specified
      // and there is inner xml of the content node then we need to make sure
      // that InnerXML matches.
      if (rulesTag.getAttributes ().getContent () != null && node.getTextContent () != null) {
        if (!node.getTextContent ().trim ().toLowerCase ().equals (rulesTag.getAttributes ().getContent ().trim ().toLowerCase ())) {
          return false;
        }
      }

      // now lets go through the attributes of the node and make sure that the
      // attribute values match.
      NamedNodeMap attributes = node.getAttributes ();
      if (attributes != null) {
        int numAttrs = attributes.getLength();
        for (int i = 0; i < numAttrs; i++) {
          Attr attribute = (Attr) attributes.item(i);
          String attributeName = attribute.getNodeName ().toLowerCase ();
          if (existingAttributes.containsKey (attributeName)) {
            if (existingAttributes.get (attributeName).equals ("*")) {
              // a wild card value has been specified and hence it is a match.
              existingAttributes.remove (attributeName);
            }
            else {
              // ok...so this attribute has been specified in the transformation
              // rules and not marked with an *
              // so we would need to make sure that values match.
              String toMatchAttrValue = attribute.getValue ().toLowerCase ().trim ();
              toMatchAttrValue = toMatchAttrValue.replace ("\\s+", "");
  
              if (!existingAttributes.get (attributeName).equals (toMatchAttrValue)) {
                return false;
              } else {
                // ok...so this attribute value matches. lets remove it from the
                // dictionary of existingAttributes.
                existingAttributes.remove (attributeName);
              }
            }
          }
        }
      }
      // now existingAttributes should be empty.
      if (existingAttributes.size () == 0) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

}
