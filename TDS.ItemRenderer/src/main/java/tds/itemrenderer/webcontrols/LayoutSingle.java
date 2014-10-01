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

public class LayoutSingle extends ILayout
{
  private PlaceHolder _question;
  private PlaceHolder _answer;

  public PlaceHolder getStem () {
    return _question;
  }

  public void setStem (PlaceHolder value) {
    _question = value;
  }

  public PlaceHolder getAnswer () {
    return _answer;
  }

  public void setAnswer (PlaceHolder value) {
    _answer = value;
  }

  public LayoutSingle () {
  }
}
