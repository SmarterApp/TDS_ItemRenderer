/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;

import AIR.Common.Helpers.CaseInsensitiveMap;
import AIR.Common.Helpers._Ref;

// Represents the raw ITS XML data.

public class ITSDocumentXml extends ITSDocument
{
  private double                                       _version;
  private boolean                                      _validated;
  private int                                          _approvedVersion;
  private long                                         _id;

  private final List<String>                           _mediaFiles = new ArrayList<String> ();

  public ITSDocumentXml () {
  }

  public double getVersion () {
    return _version;
  }

  public void setVersion (double value) {
    this._version = value;
  }


  public void setValidated (boolean value) {
    this._validated = value;
  }


  public void setApprovedVersion (int value) {
    this._approvedVersion = value;
  }

  public long getId () {
    return _id;
  }

  public void setId (long value) {
    this._id = value;
  }

}
