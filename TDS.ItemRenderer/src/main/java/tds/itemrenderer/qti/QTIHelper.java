/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.qti;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.jdom2.Element;
import org.jdom2.Namespace;

// / QTI helper utilities for common tasks.
public class QTIHelper
{
  
//TODO uncomment following code when we start to port QTIParser
  /*private static final Namespace   _namespace;

  private static final List<String> _htmlElements = new ArrayList<String> (Arrays.asList (
                                               // text
                                               "abbr", "acronym", "address", "blockquote", "br", "cite", "code", "dfn", "div", "em", "h1", "h2", "h3", "h4", "h5", "h6", "kpd", "p", "pre", "q",
                                               "samp", "span", "strong", "var",

                                               // list
                                               "dl", "dt", "dd", "ol", "ul", "li",

                                               // object
                                               "object", "param",

                                               // presentation
                                               "b", "big", "hr", "i", "small", "sub", "sup", "tt",

                                               // table
                                               "caption", "col", "colgroup", "table", "tbody", "td", "tfoot", "th", "thead", "tr",

                                               // image
                                               "img",

                                               // math
                                               "math"));

  static {
    // _namespace =
    // "http://www.imsglobal.org/xsd/apip/apipv1p0/qtiitem/imsqti_v2p1";
    _namespace = "http://www.imsglobal.org/xsd/imsqti_v2p1";
  }

  public static Namespace getNamespace () {
    return _namespace;
  }

  public static Iterable<Element> getInteractions (Element element) {
    // TODO Ayo/Shiva Port this to Java
    // C# implementation
    
     * return from el in element.Descendants() where
     * el.Attribute("responseIdentifier") != null select el;
     

    // Java implementation
    Iterable<Element> interactions;
    for (Element el : element.Descendants ()) {
      if (el.Attribute ("responseIdentifier") != null)
        interactions.add (el);
    }

    return interactions;
  }

  // Clones an element but excludes a namespace.
  public static Element copyWithoutNamespace (Element source, Namespace namespaceToRemove) {
    Element copy;

    // create new element without the namespace we are removing
    if (source.Name.Namespace == namespaceToRemove) {
      copy = new Element (source.Name.LocalName);
    } else {
      copy = new Element (source.Name);
    }

    // copy all the attributes and remove any prefix of the namespace we are
    // removing
    for (Attribute attrib : source.Attributes ()) {
      // remove namespace prefix
      if (attrib.Name.Namespace == namespaceToRemove) {
        copy.Add (new Attribute (attrib.Name.LocalName, attrib.Value));
      } else {
        copy.Add (attrib);
      }
    }

    // copy all the child nodes and for any elements remove namespace
    for (Node child : source.Nodes ()) {
      // TODO Ayo/Shiva Correct porting of: "If (child is Element)..."  ?
      if (child instanceof Element) {
        // copy.Add(CopyWithoutNamespace(child as Element, namespaceToRemove));
        copy.Add (CopyWithoutNamespace ((Element) child, namespaceToRemove));
      } else {
        copy.Add (child);
      }
    }

    return copy;
  }

  // Clones an element but excludes the default namespace.
  public static Element copyWithoutNamespace (Element source) {
    return copyWithoutNamespace (source, source.getDefaultNamespace ());
  }

  // Check if this is an HTML element.
  public static boolean isHtml (Element element) {
    return _htmlElements.Contains (element.getName ().LocalName);
  }

  // Check if this is an interaction element.
  public static boolean isInteraction (Element element) {
    return element.getAttribute ("responseIdentifier") != null;
  }

  public static String toString (Element element) {
    return element.ToString (SaveOptions.OmitDuplicateNamespaces | SaveOptions.DisableFormatting);
  }

  public static String toStringWithoutNamespace (Element element) {
    element = copyWithoutNamespace (element);
    return ToString (element);
  }*/
}
