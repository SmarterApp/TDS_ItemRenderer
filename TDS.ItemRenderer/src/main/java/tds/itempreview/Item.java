/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/**
 * 
 */
package tds.itempreview;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class Item extends Content
{
  private String _label    = null;
  private int    _position = 0;

  @JsonProperty ("position")
  public int getPosition () {
    return _position;
  }

  public void setPosition (int value) {
    _position = value;
  }

  @JsonProperty ("label")
  public String getLabel () {
    return _label;
  }

  public void setLabel (String value) {
    _label = value;
  }
}
