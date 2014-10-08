/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

// This class represents a file attachment to this items content.
public class ITSAttachment
{
  private String _id; 
  private String _type;  // The type of attachment. This can be repeated for multiple attachments.
  private String _subType;  // The subtype of the type of attachment. This should not be repeated.
  private String _file; // The file name of the attachment. When we parse this we turn it into the full physical path.
  private String _url; // The url of the handler for this attachment. This can be used in javascript to get the resource. 
  // url will be NULL right after parsing occurs. It gets set in the proccessing state 
  private String _target;

  public String getId () {
    return _id;
  }

  public void setId (String value) {
    this._id = value;
  }

  public String getType () {
    return _type;
  }

  public void setType (String value) {
    this._type = value;
  }

  public String getSubType () {
    return _subType;
  }

  public void setSubType (String value) {
    this._subType = value;
  }

  public String getFile () {
    return _file;
  }

  public void setFile (String value) {
    this._file = value;
  }

  public String getUrl () {
    return _url;
  }

  public void setUrl (String value) {
    this._url = value;
  }

  public String getTarget () {
    return _target;
  }

  public void setTarget (String target) {
    _target = target;
  }

  
}

