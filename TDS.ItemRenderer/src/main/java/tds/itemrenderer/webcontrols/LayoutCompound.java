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

public class LayoutCompound extends ILayout
{
  private PlaceHolder      _stem;
  private PlaceHolder      _tools;
  private QuestionRepeater _questions;

  // / <summary>
  // / Stem
  // / </summary>
  public PlaceHolder geStem () {
    return _stem;
  }

  public void setStem (PlaceHolder value) {
    _stem = value;
  }

  // / <summary>
  // / Tools
  // / </summary>
  public PlaceHolder getTools () {
    return _tools;
  }

  public void setTools (PlaceHolder value) {
    _tools = value;
  }

  // / <summary>
  // / Items
  // / </summary>
  public QuestionRepeater getQuestions () {
    return _questions;
  }

  public void setQuestions (QuestionRepeater value) {
    _questions = value;
  }

  public LayoutCompound () {
  }
}
