/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols.templates;

import AIR.Common.Web.taglib.LiteralControl;

public class Stimulus extends ITemplateStimulus
{
  public LiteralControl getPassage()
  {
    return super.getContent ();
  }
  
  public void setPassage(LiteralControl value)
  {
    super.setContent (value);
  }
}
