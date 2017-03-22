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

public class ContentRequestPassage extends ContentRequestEntity
{
  private boolean _autoLoad = true;

  public ContentRequestPassage () {
    super ();
    setItsType (ITSEntityType.Passage);
  }

  @JsonProperty ("autoLoad")
  public boolean getAutoLoad () {
    return _autoLoad;
  }

  public void setAutoLoad (boolean value) {
    _autoLoad = value;
  }
}
