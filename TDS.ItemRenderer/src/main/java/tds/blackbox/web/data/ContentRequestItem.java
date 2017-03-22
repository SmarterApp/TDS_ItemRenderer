/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox.web.data;

import com.fasterxml.jackson.annotation.JsonProperty;
import tds.itemrenderer.data.ITSTypes.ITSEntityType;

public class ContentRequestItem extends ContentRequestEntity
{
  private String _response;

  public ContentRequestItem () {
    super ();
    setItsType (ITSEntityType.Item);
  }

  @JsonProperty ("response")
  public String getResponse () {
    return _response;
  }

  public void setResponse (String value) {
    _response = value;
  }
}
