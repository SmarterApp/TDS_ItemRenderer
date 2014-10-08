/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols;


public class LayoutSingleMulti extends ILayout
{
  private QuestionRepeater _questionsLeft;
  private QuestionRepeater _questionsRight;

  // / <summary>
  // / The items on the left.
  // / </summary>
  public QuestionRepeater getQuestionsLeft () {
    return _questionsLeft;
  }

  public void setQuestionsLeft (QuestionRepeater value) {
    _questionsLeft = value;
  }

  // / <summary>
  // / The items on the right.
  // / </summary>
  public QuestionRepeater getQuestionsRight () {
    return _questionsRight;
  }

  public void setQuestionsRight (QuestionRepeater value) {
    _questionsRight = value;
  }

  public LayoutSingleMulti () {
  }
}
