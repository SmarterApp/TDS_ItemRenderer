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

import tds.itemrenderer.data.ITSTypes.ITSEntityType;
import AIR.Common.Helpers.CaseInsensitiveMap;
import AIR.Common.Helpers._Ref;

// Represents the raw ITS XML data.

public class ITSDocumentXml extends IITSDocument
{
  private double                                       _version;
  private boolean                                      _validated;
  private int                                          _approvedVersion;
  private long                                         _id;
  private long                                         _associatedpassage;

  private final CaseInsensitiveMap<List<ITSAttribute>> _attributes = new CaseInsensitiveMap<List<ITSAttribute>> ();
  private final CaseInsensitiveMap<ITSContent>         _contents   = new CaseInsensitiveMap<ITSContent> ();
  private final List<String>                           _mediaFiles = new ArrayList<String> ();

  public ITSDocumentXml () {
    super.setResources (new ArrayList<ITSResource> ());
  }

  public void setBaseUri (String value) {
    super.setBaseUri (value);
  }

  public void setIsLoaded (boolean value) {
    super.setIsLoaded (value);
  }

  public double getVersion () {
    return _version;
  }

  public void setVersion (double value) {
    this._version = value;
  }

  public boolean getValidated () {
    return _validated;
  }

  public void setValidated (boolean value) {
    this._validated = value;
  }

  public void setType (ITSEntityType value) {
    super.setType (value);
  }

  public int getApprovedVersion () {
    return _approvedVersion;
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

  public long getAssociatedpassage () {
    return _associatedpassage;
  }

  public void setAssociatedpassage (long value) {
    this._associatedpassage = value;
  }

  public void setBankKey (long value) {
    super.setBankKey (value);
  }

  public void setFormat (String value) {
    super.setFormat (value);
  }

  public void setSoundCue (ITSSoundCue value) {
    super.setSoundCue (value);
  }

  public void setTutorial (ITSTutorial value) {
    super.setTutorial (value);
  }

  public void setResources (List<ITSResource> value) {
    super.setResources (value);
  }

  public void setRendererSpec (String value) {
    super.setRendererSpec (value);
  }

  public void setMachineRubric (ITSMachineRubric value) {
    super.setMachineRubric (value);
  }

  public void setGridAnswerSpace (String value) {
    super.setGridAnswerSpace (value);
  }

  public void addAttribute (ITSAttribute attribute) {

    List<ITSAttribute> attribList = null;
    _Ref<List<ITSAttribute>> attribListRef = new _Ref<List<ITSAttribute>> ();

    boolean attribExist = _attributes.tryGetValue (attribute.getId (), attribListRef);

    if (!attribExist) {
      attribList = new ArrayList<ITSAttribute> ();
      _attributes.put (attribute.getId (), attribList);
    } else
      attribList = attribListRef.get ();

    attribList.add (attribute);

  }

  public String getAttributeValue (String attid) {
    ITSAttribute attribute = getAttribute (attid);
    return (attribute == null) ? "" : attribute.getValue ();
  }

  public boolean hasAttribute (String attid) {
    return _attributes.containsKey (attid);
  }

  public ITSAttribute createAttribute (String id, String value) {
    ITSAttribute itsAttrib = new ITSAttribute (id, value);
    addAttribute (itsAttrib);
    return itsAttrib;
  }

  public ITSAttribute setAttributeValue (String id, String value) {
    ITSAttribute attrib;

    if (hasAttribute (id)) {
      attrib = getAttribute (id);
      attrib.setValue (value);
    } else {
      attrib = createAttribute (id, value);
    }

    return attrib;
  }

  public void addContent (ITSContent content) {
    if (content.getLanguage () == null) {
      throw new InvalidDataException ("Could not add the <content> element because it is missing the language attribute.");
    }

    _contents.put (content.getLanguage (), content);
  }

  /*
   * The XML content nodes. These come internally from a dictionary so the order
   * of the content nodes is not guaranteed to be the same as the original XML.
   */
  public List<ITSContent> getContents () {
    List<ITSContent> contents = new ArrayList<ITSContent> ();

    for (ITSContent content : _contents.values ()) {
      contents.add (content);
    }

    return contents;
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

  public ITSContent getContentDefault () {
    return getContent ("ENU");
  }

  public boolean hasContent (String language) {
    // return language != null && _contents.ContainsKey(language); {this was
    // commented out in C# file}
    return (getContent (language) != null);
  }

  public List<String> getMediaFiles () {
    return _mediaFiles;
  }

  public void addMediaFiles (List<String> capturedResources) {
    _mediaFiles.addAll (capturedResources);
    // _mediaFiles.AddRange(capturedResources);
  }

  public String toString () {
    return _baseUri == null ? "" : _baseUri;
  }

  private List<ITSAttribute> getAttributes (String attid) {

    _Ref<List<ITSAttribute>> attribList = new _Ref<List<ITSAttribute>> ();

    boolean attribExist = _attributes.tryGetValue (attid, attribList);

    if (!attribExist || attribList.get () == null || attribList.get ().size () == 0) {
      return null;
    }

    return attribList.get ();
  }

  private ITSAttribute getAttribute (String attid) {
    List<ITSAttribute> attribList = getAttributes (attid);
    return (attribList == null) ? null : attribList.get (0);
  }
}
