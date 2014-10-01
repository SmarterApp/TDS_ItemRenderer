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

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

import tds.itempreview.Content;
import tds.itempreview.Item;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class Page
{
  private boolean    _encrypted = false;
  private String     _sectionId = null;
  private String     _label     = null;
  private Content    _passage   = null;
  private List<Item> _items     = null;

  // / <summary>
  // / If this is true the file paths are encrypted and base64 encoded.
  // / </summary>
  @JsonProperty ("encrypted")
  public boolean getEncrypted () {
    return _encrypted;
  }

  public void setEncrypted (boolean value) {
    _encrypted = value;
  }

  @JsonProperty ("sectionID")
  public String getSectionId () {
    return _sectionId;
  }

  public void setSectionId (String value) {
    _sectionId = value;
  }

  @JsonProperty ("label")
  public String getLabel () {
    return _label;
  }

  public void setLabel (String value) {
    _label = value;
  }

  @JsonProperty ("passage")
  public Content getPassage () {
    return _passage;
  }

  public void setPassage (Content value) {
    _passage = value;
  }

  @JsonProperty ("items")
  public List<Item> getItems () {
    return _items;
  }

  public void setItems (List<Item> value) {
    _items = value;
  }

  public String toString () {
    return getLabel ();
  }
}
