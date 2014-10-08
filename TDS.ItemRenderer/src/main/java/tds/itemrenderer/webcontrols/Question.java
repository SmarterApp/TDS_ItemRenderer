/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols;

import javax.faces.component.UIComponent;
import javax.faces.component.html.HtmlOutputLabel;

import org.apache.commons.lang3.StringUtils;

import AIR.Common.Web.taglib.LiteralControl;
import AIR.Common.Web.taglib.PlaceHolder;

import tds.itemrenderer.data.IItemRender;

public class Question implements IUiRepeatDataElement
{
  private PlaceHolder _illustration;
  private PlaceHolder _tools;
  private PlaceHolder _stem;
  private PlaceHolder _answer;
  private IItemRender _item;

  public PlaceHolder getIllustration () {
    return _illustration;
  }

  public void setIllustration (PlaceHolder value) {
    _illustration = value;
  }

  public PlaceHolder getTools () {
    return _tools;
  }

  public void setTools (PlaceHolder value) {
    _tools = value;
  }

  public PlaceHolder getStem () {
    return _stem;
  }

  public void setStem (PlaceHolder value) {
    _stem = value;
  }

  public PlaceHolder getAnswer () {
    return _answer;
  }

  public void setAnswer (PlaceHolder value) {
    _answer = value;
  }

  public IItemRender getItem () {
    return _item;
  }

  public void setItem (IItemRender value) {
    _item = value;
  }

  // Shiva: We do not have a requirement for QuestionContainer - atleast as of
  // right now.
  // in layouts however they are using Container.Data to refer to this item. so
  // we will
  // create a pseudo property.
  public IItemRender getData () {
    return _item;
  }

  @Override
  public UIComponent getCustomBinding (String id) {
    if (StringUtils.isNotEmpty (id)) {
      id = id.toLowerCase ();
      switch (id) {
      case "stem":
        return getStem ();
      case "answer":
        return getAnswer ();
      }
    }
    return null;
  }

}
