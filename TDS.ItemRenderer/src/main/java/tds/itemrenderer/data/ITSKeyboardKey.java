/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

public class ITSKeyboardKey
{
  private String _id;     // { get; set; }
  private String _type;   // { get; set; }
  private String _value;  // { get; set; }
  private String _display; // { get; set; }

  public String getId () {
    return _id;
  }

  public void setId (String _id) {
    this._id = _id;
  }

  public String getType () {
    return _type;
  }

  public void setType (String _type) {
    this._type = _type;
  }

  public String getValue () {
    return _value;
  }

  public void setValue (String value) {
    this._value = value;
  }

  public String getDisplay () {
    return _display;
  }

  public void setDisplay (String _display) {
    this._display = _display;
  }

  public String ToString () {
    return _display;
  }
}
