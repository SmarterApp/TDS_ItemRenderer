/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.qti.interactions;


import org.jdom2.Attribute;
import org.jdom2.Element;

import tds.itemrenderer.data.ITSDocument;
import tds.itemrenderer.data.ITSOption;
import tds.itemrenderer.qti.QTIHelper;
import tds.itemrenderer.qti.QTIInteraction;

// / QTI parser for the choiceInteraction element.
public class ChoiceInteraction extends QTIInteraction
{

  public String getName () {
    return "choiceInteraction";
  }

  public boolean includeStem () {
    return true;
  }

  @Override
  public void process (ITSDocument itsDoc, Element element) {
    
  }

//TODO uncomment following code when we start to port QTIParser
  /*
  @Override
  public void process (ITSDocument itsDoc, Element choiceEl) {
    //choiceInteractionEl.GEtA
    int minChoices = 0;
    Attribute minAttrib = choiceEl.Attribute("minChoices");   
    if (minAttrib != null)
    {
      int.TryParse(minAttrib.Value, out minChoices);
    }

    int maxChoices = 0;
    Attribute maxAttrib = choiceEl.Attribute("maxChoices");
    if (maxAttrib != null)
    {
      int.TryParse(maxAttrib.Value, out maxChoices);
    }

    // if there is max choice of 1 then this is MC, otherwise MS
    if (maxChoices == 1)
    {
      itsDoc.Format = "MC";
      itsDoc.SetAttributeFormat("MC");
      itsDoc.SetAttributeResponseType("Vertical");
    }
    else
    {
      itsDoc.Format = "MS";
      itsDoc.SetAttributeFormat("MS");
      itsDoc.SetAttributeResponseType("Vertical MS");
    }

    // set options
    ITSContent itsContent = itsDoc.GetContentDefault();
    itsContent.Options = new List<ITSOption>();

    for (Element simpleChoiceEl : choiceEl.Elements(choiceEl.Name.Namespace + "simpleChoice")) {
      ITSOption itsOption = CreateITSOption(simpleChoiceEl);
      itsContent.Options.Add(itsOption);
    }
  }

  private ITSOption CreateITSOption (Element simpleChoiceEl) {
    // get the option key
    Attribute idAttrib = simpleChoiceEl.Attribute ("identifier");
    String optionKey = idAttrib.Value.ToUpper (); // HACK: module_mc.js expects
    // this to be uppercase
    ITSOption itsOption = new ITSOption (optionKey);

    ReadITSOption (simpleChoiceEl, itsOption);
    return itsOption;
  }

  private void ReadITSOption(Element simpleChoiceEl, ITSOption itsOption)
  {
    StringBuilder htmlBuilder = new StringBuilder();

    for (Node node : simpleChoiceEl.Nodes()) {
      if (node is XText)
      {
        htmlBuilder.Append(node);
      } else if (node is Element) {
        Element el = node as Element;

        // check if <feedback>
        if (el.Name == el.Name.Namespace + "feedback")
        {

        }  else if (QTIHelper.isHtml(el)) {
          // TODO Ayo/Shiva QTIHelper method access in a static manner
          htmlBuilder.Append(QTIHelper.toStringWithoutNamespace(el));
        }
      }
    }

    itsOption.setValue (htmlBuilder.toString());
  }*/
}
