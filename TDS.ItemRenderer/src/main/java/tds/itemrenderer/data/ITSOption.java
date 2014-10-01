/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

public class ITSOption
{
  public String _key; // { get; set; }
  public String _value; // { get; set; }
  public String _sound; // { get; set; }
  public String _feedback; // { get; set; }
  public String _tts; // { get; set; }

  public ITSOption()
  {
  }

  public ITSOption(String key)
  {
    _key = key;
  }

  public ITSOption(String key, String value)
  {
    _key = key;
    _value = value;
  }

  
  
  public String getKey () {
    return _key;
  }

  public void setKey (String _key) {
    this._key = _key;
  }

  public String getValue () {
    return _value;
  }

  public void setValue (String _value) {
    this._value = _value;
  }

  public String getSound () {
    return _sound;
  }

  public void setSound (String _sound) {
    this._sound = _sound;
  }

  public String getFeedback () {
    return _feedback;
  }

  public void setFeedback (String _feedback) {
    this._feedback = _feedback;
  }

  public String getTts () {
    return _tts;
  }

  public void setTts (String _tts) {
    this._tts = _tts;
  }

  public String ToString()
  {
    return _key;
  }
}
