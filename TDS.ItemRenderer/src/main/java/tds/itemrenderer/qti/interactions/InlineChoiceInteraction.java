/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.qti.interactions;

import org.jdom2.Element;

import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.qti.QTIInteraction;

// QTI parser for the inlineChoiceInteraction element.
public class InlineChoiceInteraction extends QTIInteraction
{
  @Override
  public String getName () {
    return "inlineChoiceInteraction";
  }

  @Override
  public void process (IITSDocument itsDoc, Element element) {
    itsDoc.setFormat ("ET");
    itsDoc.setAttributeResponseType ("EditTaskChoice");
  }

}
