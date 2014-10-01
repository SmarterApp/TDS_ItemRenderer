/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

// Represents the data for rendering a MC option in a response template.
public class ItemRenderMCOption
{
  private String  _id;      // A unique ID for the option grouping.
  private String  _key;     // The unique letter for this option (e.x., "A").
  private String  _text;    // The HTML for the value element.
  private String  _feedback; // The HTML for the feedback element.
  private String  _sound;   // The HTML for the audio element (should just
                             // contain sound element).
  private boolean _answer;  // If this is true then this option is one of the
                             // correct responses.
  private boolean _selected; // If this is true then the user selected this
                             // option from the loaded response.
  private boolean _disabled; // If this is true then this option is disabled and
                             // cannot be selected. Note: I don't think this is
                             // used anywhere.

  public ItemRenderMCOption (String id, String key) {
    setAnswer (false);
    setSelected (false);
    setDisabled (false);
    setId (id);
    setKey (key);
  }

  // returns a unique ID for this specific option.
  public String getName () {
    return getId () + "_" + getKey ();
  }

  // Returns True If the user selected this option and it is the correct
  // response.
  public boolean getCorrect () {
    return (getAnswer () && getSelected ());
  }

  public String getId () {
    return _id;
  }

  public void setId (String value) {
    this._id = value;
  }

  public String getKey () {
    return _key;
  }

  public void setKey (String value) {
    this._key = value;
  }

  public String getText () {
    return _text;
  }

  public void setText (String value) {
    this._text = value;
  }

  public String getFeedback () {
    return _feedback;
  }

  public void setFeedback (String value) {
    this._feedback = value;
  }

  public String getSound () {
    return _sound;
  }

  public void setSound (String value) {
    this._sound = value;
  }

  public boolean getAnswer () {
    return _answer;
  }

  public void setAnswer (boolean value) {
    this._answer = value;
  }

  public boolean getSelected () {
    return _selected;
  }

  public void setSelected (boolean value) {
    this._selected = value;
  }

  public boolean getDisabled () {
    return _disabled;
  }

  public void setDisabled (boolean value) {
    this._disabled = value;
  }
}
