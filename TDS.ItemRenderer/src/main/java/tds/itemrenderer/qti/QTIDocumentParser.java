/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.qti;

import java.util.HashMap;

import org.jdom2.Element;

import AIR.Common.xml.XmlReader;

import tds.itemrenderer.data.ITSDocument2;

public class QTIDocumentParser
{

  // collection of interactions
  private final HashMap<String, QTIInteraction> _interactions = new HashMap<String, QTIInteraction> ();
  private final ITSDocument2 _itsDoc;
  private final StringBuilder                   _stemBuilder  = new StringBuilder ();

  public QTIDocumentParser (ITSDocument2 itsDoc) {
    _itsDoc = itsDoc;
  }

  public ITSDocument2 GetITSDocument () {
    return _itsDoc;
  }

  void addInteraction (QTIInteraction interaction) {
    _interactions.put (interaction.getName (), interaction);
  }

  QTIInteraction lookupInteraction (String name) {

    if (_interactions.containsKey (name))
      return _interactions.get (name);
    return null;
  }

  QTIInteraction lookupInteraction (Element element) {
    return lookupInteraction (element.getName ());
  }

 
  public void load (String uri) {
    // TODO Shiva will we ever come to a point where the URI is a remote
    // resource?
    loadReader (XmlReader.create (uri));
  }

  public void loadReader (XmlReader reader) {
    //TODO mpatel Uncomment following code when we start porting QTIParser
    // set default properties
    /*_itsDoc.setIsLoaded (true);
    _itsDoc.setType (ITSEntityType.Item);

    // set default layout name
    if (StringUtils.isEmpty (_itsDoc.getLayout ())) {
      _itsDoc.setAttributeLayout ("1");
    }

    // set default response type
    if (StringUtils.isEmpty (_itsDoc.getResponseType ())) {
      _itsDoc.setAttributeResponseType ("NA");
    }

    // parse xml
    Document xmlDoc = reader.getDocument ();
    
    if (xmlDoc.getRootElement () == null) {
      // TODO Shiva here a XNode was required but does not seem like there is a
      // equivalent
      // definition in JDOM
      throw new QTIException ("Could not find root.");
    }

    // get the root namespace (most likely QTI)
    Namespace nsRoot = xmlDoc.getRootElement ().getNamespace ();
    
    Element assessmentItem = XmlHelper.getElement (xmlDoc, "assessmentItem", nsRoot);

    if (assessmentItem == null) {
      throw new QTIException ("Could not find <assessmentItem>.");
    }

    // get item id
    Attribute idAttrib = assessmentItem.getAttribute ("identifier");
    if (idAttrib != null) {
      // HACK: we make up the id based on QTI identifier hash code
      _itsDoc.setId (Math.abs (idAttrib.getValue().hashCode ()));
    }

    // get itembody
    Element itemBody = XmlHelper.getElement (assessmentItem, "itemBody", nsRoot);

    if (itemBody == null) {
      throw new QTINodeException (assessmentItem, "Could not find <itemBody>.");
    }

    // valid QTI document
    _itsDoc.setValidated (true);

    // create english content
    ITSContent itsContent = new ITSContent ("ENU");
    _itsDoc.addContent (itsContent);

    // set QTI xml
    itsContent.setQti (new ITSQTI ());
    itsContent.getQti ().setSpecification ("itemBody");
    itsContent.getQti ().setXml (QTIHelper.toStringWithoutNamespace (itemBody));

    // collection of all the html elements in the item body
    List<Element> htmlElements = new ArrayList<Element> ();

    // this is to hold a single interaction (there might be more but we only
    // support one)
    QTIInteraction interaction = null;

    // get all the interactions in the html
    Iterable<Element> interactions = QTIHelper.getInteractions (itemBody);

    // get the first interaction (we can only process one)
    Element interactionEl = interactions.iterator ().next ();

    if (interactionEl != null) {
      // try and get interaction object
      interaction = lookupInteraction (interactionEl);

      // process the interaction element
      if (interaction != null) {
        interaction.process (_itsDoc, interactionEl);
      }
    }

    // perform some final work
    if (interaction != null) {
      if (interaction.getIncludeStem ()) {
        // iterate over the item body elements (HTML, interactions, etc)
        for (Element child : itemBody.getChildren ()) {
          if (QTIHelper.isHtml (child)) {
            _stemBuilder.append (QTIHelper.toStringWithoutNamespace (child));
          }
        }
      }

      if (interaction.getIncludePrompt ()) {
        Element promptEl = XmlHelper.getElement (interactionEl, "prompt", interactionEl.getNamespace ());
        
        if (promptEl != null) {
          // add fake break if we already added something to the stem
          if (_stemBuilder.length () > 0) {
            _stemBuilder.append ("<p>&nbsp;</p>");
          }

          // try and get the prompt as plain text
          Text promptText = (Text) promptEl.Nodes ().First ();

          if (promptText != null) {
            _stemBuilder.AppendFormat ("<p>{0}</p>", promptText.Value);
          } else {
            // iterate over the prompts elements
            for (Element promptChild : promptEl.Elements ()) {
              _stemBuilder.Append (QTIHelper.toStringWithoutNamespace (promptChild));
            }
          }
        }
      }
    }

    // check if we tried to build a stem
    if (_stemBuilder.length () > 0) {
      itsContent.setStem (_stemBuilder.toString ());
    }*/
  }

}
