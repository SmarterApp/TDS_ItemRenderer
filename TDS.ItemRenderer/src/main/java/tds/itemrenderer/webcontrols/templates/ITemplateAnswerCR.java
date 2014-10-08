/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols.templates;

import javax.faces.component.html.HtmlInputTextarea;
import tds.itemrenderer.webcontrols.RendererBase;

public class ITemplateAnswerCR extends RendererBase implements IResponseLayout
{
  private HtmlInputTextarea _answer;

  public HtmlInputTextarea getAnswer () {
    return _answer;
  }

  public void setAnswer (HtmlInputTextarea value) {
    _answer = value;
  }
}
