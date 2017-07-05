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


  public void addContent (ITSContent content) {
    if (content.getLanguage () == null) {
      throw new InvalidDataException ("Could not add the <content> element because it is missing the language attribute.");
    }

    _contents.put (content.getLanguage (), content);
  }

  public ITSContent getContent (String language) {
    if (StringUtils.isEmpty (language))
      return null;

    _Ref<ITSContent> content = new _Ref<ITSContent> ();

    // get language
    _contents.tryGetValue (language, content);

    // if language does not exist try splitting language
    if (content.get () == null && language.indexOf ('-') != -1) {
      String[] langTags = StringUtils.split (language, '-');

      if (langTags.length > 1) {
        _contents.tryGetValue (langTags[0], content);
      }
    }

    return content.get ();
  }

  public void addMediaFiles (List<String> capturedResources) {
    _mediaFiles.addAll (capturedResources);
    // _mediaFiles.AddRange(capturedResources);
  }

//  public String toString () {
//    return _baseUri == null ? "" : _baseUri;
//  }

}
