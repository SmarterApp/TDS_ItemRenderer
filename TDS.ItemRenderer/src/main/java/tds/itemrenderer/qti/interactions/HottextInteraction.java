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

import tds.itemrenderer.data.ITSDocument;
import tds.itemrenderer.qti.QTIInteraction;

// QTI parser for the hottextInteraction element.
public class HottextInteraction extends QTIInteraction
{
  @Override
  public String getName () {
    return "hottextInteraction";
  }

  @Override
  public void process (ITSDocument itsDoc, Element element) {
    itsDoc.setFormat ("HT");
    itsDoc.setAttributeFormat ("HT");
    itsDoc.setAttributeResponseType ("Hottext");
  }
}
