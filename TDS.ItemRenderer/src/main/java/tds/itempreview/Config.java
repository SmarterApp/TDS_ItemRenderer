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

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class Config
{
  private String              _client         = null;
  private InterfaceControls   _ui             = null;
  private List<Accommodation> _accommodations = null;
  private List<Section>       _sections       = null;
  private List<Page>          _pages          = null;

  @JsonProperty ("client")
  public String getClient () {
    return _client;
  }

  public void setClient (String value) {
    _client = value;
  }

  @JsonProperty ("ui")
  public InterfaceControls getUi () {
    return _ui;
  }

  public void setUi (InterfaceControls value) {
    _ui = value;
  }

  @JsonProperty ("accommodations")
  public List<Accommodation> getAccommodations () {
    return _accommodations;
  }

  public void setAccommmodations (List<Accommodation> value) {
    _accommodations = value;
  }

  @JsonProperty ("sections")
  public List<Section> getSections () {
    return _sections;
  }

  public void setSections (List<Section> value) {
    _sections = value;
  }

  @JsonProperty ("pages")
  public List<Page> getPages () {
    return _pages;
  }

  public void setPages (List<Page> value) {
    _pages = value;
  }

}
