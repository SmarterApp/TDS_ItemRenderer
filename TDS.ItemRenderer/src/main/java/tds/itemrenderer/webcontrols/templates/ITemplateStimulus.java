/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols.templates;

import javax.faces.component.UINamingContainer;

import AIR.Common.Web.taglib.LiteralControl;

public abstract class ITemplateStimulus extends UINamingContainer
{

  private LiteralControl _title;
  private LiteralControl _credit;
  private LiteralControl _content;

  public LiteralControl getTitle () {
    return _title;
  }

  public void setTitle (LiteralControl value) {
    _title = value;
  }

  public LiteralControl getCredit () {
    return _credit;
  }

  public void setCredit (LiteralControl value) {
    _credit = value;
  }

  public LiteralControl getContent () {
    return _content;
  }

  public void setContent (LiteralControl value) {
    _content = value;
  }
}
