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

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;


/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
// / <summary>
// / These classes are used to facilitate blackbox javascript requests.
// / </summary>
// / <remarks>
// / This class is used by a .NET web service do not change.
// / </remarks>
public class ContentRequest
{
  // / <summary>
  // / A unique identifier for this request.
  // / </summary>
  private String                            _id             = null;
  private String                            _client         = null;
  private String                            _language       = null;
  private String                            _layoutFolder   = null;
  private String                            _layoutFile     = null;
  private String                            _layoutName     = null;
  private ContentRequestPassage             _passage        = null;
  private List<ContentRequestItem>          _items          = null;
  private List<ContentRequestAccommodation> _accommodations = null;
  private List<ContentRequestSetting>       _settings       = null;
  private boolean                           _encrypted      = false;
  private String                            _label          = null;
  private String                            _sectionId      = null;

  @JsonProperty ("sectionID")
  public String getSectionId () {
    return _sectionId;
  }

  public void setSectionId (String value) {
    _sectionId = value;
  }

  @JsonProperty ("id")
  public String getId () {
    return _id;
  }

  public void setId (String value) {
    _id = value;
  }

  public String getClient () {
    return _client;
  }

  public void setClient (String value) {
    _client = value;
  }

  public String getLanguage () {
    return _language;
  }

  public void setLanguage (String value) {
    _language = value;
  }

  public String getLayoutFolder () {
    return _layoutFolder;
  }

  public void setLayoutFolder (String value) {
    _layoutFolder = value;
  }

  public String getLayoutFile () {
    return _layoutFile;
  }

  public void setLayoutFile (String value) {
    _layoutFile = value;
  }

  public String getLayoutName () {
    return _layoutName;
  }

  public void setLayoutName (String value) {
    _layoutName = value;
  }

  public String getLabel () {
    return _label;
  }

  public void setLabel (String value) {
    _label = value;
  }

  public ContentRequestPassage getPassage () {
    return _passage;
  }

  public void setPassage (ContentRequestPassage value) {
    _passage = value;
  }

  public List<ContentRequestItem> getItems () {
    return _items;
  }

  public void setItems (List<ContentRequestItem> value) {
    _items = value;
  }

  public List<ContentRequestAccommodation> getAccommodations () {
    return _accommodations;
  }

  public void setAccommodations (List<ContentRequestAccommodation> value) {
    _accommodations = value;
  }

  public List<ContentRequestSetting> getSettings () {
    return _settings;
  }

  public void setSettings (List<ContentRequestSetting> value) {
    _settings = value;
  }

  // / <summary>
  // / If this is true the file paths are encrypted and base64 encoded.
  // / </summary>
  public boolean getEncrypted () {
    return _encrypted;
  }

  public void setEncrypted (boolean value) {
    _encrypted = value;
  }

  public ContentRequest () {
  }
}
