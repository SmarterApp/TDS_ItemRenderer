/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols;

import AIR.Common.Web.taglib.PlaceHolder;

public abstract class ILayout extends RendererBase
{
  private PlaceHolder _stimulus;

  public PlaceHolder getStimulus () {
    return _stimulus;
  }

  public void setStimulus (PlaceHolder value) {
    _stimulus = value;
  }

  @Override
  public String getFamily () {
    return "javax.faces.NamingContainer";
  }
}
