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

public class LayoutHolder extends PlaceHolder
{
  private String _layout;

  public String getLayout () {
    return _layout;
  }

  public void setLayout (String value) {
    _layout = value;
  }
}
