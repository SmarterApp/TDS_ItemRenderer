/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import java.io.StringReader;
import java.io.StringWriter;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathFactory;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.InputSource;

/**
 * @author jmambo
 *
 */
public class XmlUtils
{

  private static Logger _logger = LoggerFactory.getLogger (XmlUtils.class);

  public static Document createDocument (String xml) {
    Document document = null;
    xml = xml.replace ("&#xA0;", " ");
    try {
      DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance ();
      DocumentBuilder builder = factory.newDocumentBuilder ();
      document = builder.parse (new InputSource (new StringReader (xml)));

    } catch (Exception e) {
      _logger.error (e.getMessage (), e);
    }
    return document;
  }

  public static Document createFragmentDocument (String xml) {
    xml = "<root>" + xml + "</root>";
    return createDocument (xml);
  }

  public static NodeList getNodeListByPath (Document document, String path) {
    try {
      XPath xpath = XPathFactory.newInstance ().newXPath ();

      XPathExpression expression = xpath.compile (path);
      return (NodeList) expression.evaluate (document, XPathConstants.NODESET);

    } catch (Exception e) {
      _logger.error (e.getMessage (), e);
    }
    return null;
  }

  public static String getXml (Document document) {
    return getXml (document, false);
  }

  public static String getXml (Document document, boolean hasRootTag) {
    try {
      TransformerFactory transformerFactory = TransformerFactory.newInstance();
      Transformer transformer = transformerFactory.newTransformer(new StreamSource(new StringReader(XsltProvider.SELF_CLOSED_TAGS)));
      StringWriter writer = new StringWriter ();
      transformer.transform(new DOMSource(document), new StreamResult(writer));
      String xml = writer.toString ().replace(XsltProvider.SPACE_FILLER_VALUE, "");
      if (hasRootTag) {
        // remove the root tags
        // <root></root>
        xml = xml.substring (6);
        xml = xml.substring (0, xml.length () - 7);
      }
      return xml;
    } catch (Exception e) {
      _logger.error (e.getMessage (), e);
    }
    return null;
  }

  public static String getXml (Element element) {
    try {
      TransformerFactory transformerFactory = TransformerFactory.newInstance();
      Transformer transformer = transformerFactory.newTransformer(new StreamSource(new StringReader(XsltProvider.SELF_CLOSED_TAGS)));
      StringWriter writer = new StringWriter ();
      transformer.transform(new DOMSource(element), new StreamResult(writer));
      return writer.toString ().replace(XsltProvider.SPACE_FILLER_VALUE, "");
    } catch (Exception e) {
      _logger.error (e.getMessage (), e);
    }
    return null;
  }

  public static Element getElementById (Document document, String id) {

    try {
      XPath xpath = XPathFactory.newInstance ().newXPath ();
      return (Element) xpath.evaluate ("//*[@id='" + id + "']", document, XPathConstants.NODE);
    } catch (Exception e) {
      _logger.error (e.getMessage (), e);
    }
    return null;

  }

  public static void insertBefore (Node currentNode, Node insertNode) {
    currentNode.getParentNode ().insertBefore (insertNode, currentNode);
  }

  public static void insertAfter (Node currentNode, Node insertNode) {
    currentNode.getParentNode ().insertBefore (insertNode, currentNode.getNextSibling ());
  }

  public static void replaceWith (Node currentNode, Node replacerNode) {
    currentNode.getParentNode ().replaceChild (replacerNode, currentNode);
  }

  public static void addSibling (Node currentNode, Node newNode) {
    currentNode.getParentNode ().appendChild (newNode);
  }

  public static Element createElement (Node node, String name) {
    return node.getOwnerDocument ().createElement (name);
  }

  public static NodeList getAllElements (Document document) {
    return document.getElementsByTagName ("*");
  }

  public static NodeList getAllElements (Element element) {
    return element.getElementsByTagName ("*");
  }
  
  class XsltProvider {
    
    //HACK: prevent space from showing up in empty tags 
    //that will be removed after XML is generated
    public static final String SPACE_FILLER_VALUE =  "ty^8%3C6@q!0";
        
        
    public static final String SELF_CLOSED_TAGS = "<?xml version=\"1.0\" ?>" +
    "<xsl:stylesheet version=\"1.0\" xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\">" +
    "    <xsl:output method=\"xml\" omit-xml-declaration=\"yes\" encoding=\"UTF-8\"/>" +
    "    <xsl:template match=\"*[not(node())]\">" +
    "        <xsl:copy>" +
    "            <xsl:apply-templates select=\"@*\"/>" +
    "            <xsl:text>" + SPACE_FILLER_VALUE +  "</xsl:text>" +
    "        </xsl:copy>" +
    "    </xsl:template>" +
    "    <xsl:template match=\"script[not(node())]\">" +
    "        <xsl:copy>" +
    "            <xsl:apply-templates select=\"@*\"/>" +
    "            <xsl:text>//</xsl:text>" +
    "        </xsl:copy>" +
    "    </xsl:template>" +
    "    <xsl:template match=\"*\">" +
    "        <xsl:copy>" +
    "            <xsl:apply-templates select=\"@*\"/>" +
    "            <xsl:apply-templates select=\"node()\"/>" +
    "        </xsl:copy>" +
    "    </xsl:template>" +
    "    <xsl:template match=\"area[not(node())]|base[not(node())]|" +
    "        basefont[not(node())]|bgsound[not(node())]|br[not(node())]|" +
    "        col[not(node())]|frame[not(node())]|hr[not(node())]|" +
    "        img[not(node())]|input[not(node())]|isindex[not(node())]|" +
    "        keygen[not(node())]|link[not(node())]|meta[not(node())]|" +
    "        param[not(node())]\">" +
    "        <xsl:copy>" +
    "            <xsl:apply-templates select=\"@*\"/>" +
    "        </xsl:copy>" +
    "    </xsl:template>" +
    "    <xsl:template match=\"@*|text()|comment()|processing-instruction()\">" +
    "        <xsl:copy/>" +
    "    </xsl:template>" +
    "</xsl:stylesheet>";
  }

}

