/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox.web.data;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import tds.itemrenderer.data.ITSTypes.ITSEntityType;
import tds.itemrenderer.data.ItsItemIdUtil;

public class ContentRequestEntity
{
  private String        _id;
  private long          _bankKey = 0;
  private long          _itemKey = 0;

  @JsonIgnore
  // Shiva: do i need it on this one as well ?
  private ITSEntityType _itsDocType;

  @JsonProperty ("id")
  public String getId () {

    if (getBankKey () > 0 && getItemKey () > 0)
      return ItsItemIdUtil.getItsDocumentId (getBankKey (), getItemKey (), getItsType ());

    return _id;
  }

  public void setId (String value) {
    _id = value;
  }

  @JsonProperty ("bankKey")
  public long getBankKey () {
    return _bankKey;
  }

  public void setBankKey (long value) {
    _bankKey = value;
  }

  @JsonProperty ("itemKey")
  public long getItemKey () {
    return _itemKey;
  }

  public void setItemKey (long value) {
    _itemKey = value;
  }

  @JsonIgnore
  public ITSEntityType getItsType () {
    return _itsDocType;
  }

  protected void setItsType (ITSEntityType value) {
    _itsDocType = value;
  }

  @Override
  public String toString () {
    return getId ();
  }

}
