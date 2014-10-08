/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data.apip;

// / <summary>
// / This is the container for the information that describes how the new
// alternative accessibility content is linked to the ITS content.
// / </summary>
public class APIPContentLinkInfo
{
  // / <summary>
  // / This is the pointer to a feature within the ITS content. The associated
  // ITS structure is expected to have
  // / an �id� attribute to which the value of the �itsLinkIdentifier� refers.
  // / </summary>
  public String _itsLinkIdentifierRef = null;

  public String _type                 = null;

  public String _subType              = null;

  @Override
  public String toString () {
    return getItsLinkIdentifierRef ();
  }

  public String getItsLinkIdentifierRef () {
    return _itsLinkIdentifierRef;
  }

  public void setItsLinkIdentifierRef (String value) {
    _itsLinkIdentifierRef = value;
  }

  public String getSubType () {
    return _subType;
  }

  public void setSubType (String value) {
    _subType = value;
  }

  public String getType () {
    return _type;
  }

  public void setType (String type) {
    _type = type;
  }

}
