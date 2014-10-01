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
public class InterfaceControls
{
  private boolean _grouping       = false;
  private boolean _language       = false;
  private boolean _accommodations = false;
  private boolean _reload         = false;
  private boolean _accessibility  = false;
  private boolean _tts            = false;

  @JsonProperty ("grouping")
  public boolean getGrouping () {
    return _grouping;
  }

  public void setGrouping (boolean value) {
    _grouping = value;
  }

  @JsonProperty ("language")
  public boolean getLanguage () {
    return _language;
  }

  public void setLanguage (boolean value) {
    _language = value;
  }

  @JsonProperty ("accommodations")
  public boolean getAccommodations () {
    return _accommodations;
  }

  public void setAccommodations (boolean value) {
    _accommodations = value;
  }

  @JsonProperty ("reload")
  public boolean getReload () {
    return _reload;
  }

  public void setReload (boolean value) {
    _reload = value;
  }

  @JsonProperty ("accessibility")
  public boolean getAccessibility () {
    return _accessibility;
  }

  public void setAccessibility (boolean value) {
    _accessibility = value;
  }

  @JsonProperty ("tts")
  public boolean getTts () {
    return _tts;
  }

  public void setTts (boolean value) {
    _tts = value;
  }
}
