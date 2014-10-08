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

public class Accommodation
{
  private String      _type = null;

  @JsonProperty ("codes")
  public List<String> Codes;

  @JsonProperty ("type")
  public String getType () {
    return _type;
  }

  public void setType (String value) {
    _type = value;
  }

  public String toString () {
    return _type;
  }
}
