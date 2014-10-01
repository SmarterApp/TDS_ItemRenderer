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
package tds.blackbox;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class ContentRequestSetting
{
  private String _name  = null;
  private String _type  = null;
  private String _value = null;

  // / <summary>
  // / Name of the settings.
  // / </summary>

  public String getName () {
    return _name;
  }

  public void setName (String value) {
    _name = value;
  }

  // / <summary>
  // / This is either boolean, integer or string.
  // / </summary>
  public String getType () {
    return _type;
  }

  public void setType (String value) {
    _type = value;
  }

  // / <summary>
  // / Value of the settings.
  // / </summary>
  public String getValue () {
    return _value;
  }

  public void setValue (String value) {
    _value = value;
  }

  @Override
  public String toString () {
    return getName ();
  }
}
