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

import tds.itemrenderer.data.ITSDocument2;
import tds.itemrenderer.qti.QTIInteraction;

// / QTI parser for the matchInteraction element.
public class MatchInteraction extends QTIInteraction
{
  public String getName () {
    return "matchInteraction";
  }

  @Override
  public boolean getIncludePrompt () {
    return true;
  }

  @Override
  public void process (ITSDocument2 itsDoc, Element element) {
    // set format and response type
    itsDoc.setFormat ("MI");
    itsDoc.setAttributeFormat ("MI");
    itsDoc.setAttributeResponseType ("MatchItem");

  }
}
