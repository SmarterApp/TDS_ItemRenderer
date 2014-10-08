/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols;



public class LayoutMulti extends ILayout
{
  private QuestionRepeater _questions;

  public QuestionRepeater getQuestions () {
    return _questions;
  }

  public void setQuestions (QuestionRepeater value) {
    _questions = value;
  }
  
  public LayoutMulti () {
  }
  
}
