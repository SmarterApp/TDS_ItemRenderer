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
public class ContentRequestItem
{
  private int     _position = 0;
  private String  _response = null;
  private String  _file     = null;
  private boolean _disabled = false;
  private String  _label    = null;

  public String getLabel () {
    return _label;
  }

  public void setLabel (String value) {
    _label = value;
  }

  public int getPosition () {
    return _position;
  }

  public void setPosition (int value) {
    _position = value;
  }

  public String getFile () {
    return _file;
  }

  public void setFile (String value) {
    _file = value;
  }

  public String getResponse () {
    return _response;
  }

  public void setResponse (String value) {
    _response = value;
  }

  public boolean getDisabled () {
    return _disabled;
  }

  public void setDisabled (boolean value) {
    _disabled = value;
  }

  @Override
  public String toString () {
    return getFile ();
  }
}
