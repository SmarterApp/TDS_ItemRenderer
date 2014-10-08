/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

import java.util.List;

import tds.itempreview.content.ITSDocumentExtensions;
import tds.itemrenderer.data.ITSTypes.ITSEntityType;

/**
 * @author This is the minimal interface required for page rendering and
 *         external use. This interface is not used for adding or modifying
 *         data. Note: made methods abstract as well.
 */
public abstract class IITSDocument
{

  protected String          _baseUri;        // The original file path of where
                                              // the XML data came from.
  private String            _rendererSpec;
  private String            _layout;
  private String            _format;
  private String            _responseType;
  private String            _subject;
  private String            _grade;
  private String            _answerKey;
  private String            _credit;
  private String            _copyright;
  private String            _gridAnswerSpace; // This is the new top level grid
                                              // answer space. This replaces the
                                              // content element level answer
                                              // space.
  private ITSEntityType     _type;           // What type of entity this is.
                                              // This can be item or passage.
  private ITSSoundCue       _soundCue;
  private ITSTutorial       _tutorial;
  private List<ITSResource> _resources;
  private ITSMachineRubric  _machineRubric;
  private long              _bankKey;
  private long              _itemKey;
  private long              _stimulusKey;
  private boolean           _isLoaded;       // Is the XML loaded and parsed.
  private boolean           _autoEmboss;
  
  public String getBaseUri () {
    return _baseUri;
  }

  protected void setBaseUri (String value) {
    _baseUri = value;
  }

  public boolean getIsLoaded () {
    return _isLoaded;
  }

  protected void setIsLoaded (boolean value) {
    _isLoaded = value;
  }

  public ITSEntityType getType () {
    return _type;
  }

  protected void setType (ITSEntityType value) {
    _type = value;
  }

  public long getBankKey () {
    return _bankKey;
  }

  protected void setBankKey (long value) {
    _bankKey = value;
  }

  public long getItemKey () {
    return _itemKey;
  }

  public long getStimulusKey () {
    return _stimulusKey;
  }

  public String getLayout () {
    return _layout;
  }

  public String getFormat () {
    return _format;
  }

  protected void setFormat (String value) {
    _format = value;
  }

  public String getResponseType () {
    return _responseType;
  }

  public String getSubject () {
    return _subject;
  }

  public String getGrade () {
    return _grade;
  }

  public String getAnswerKey () {
    return _answerKey;
  }

  public String getCredit () {
    return _credit;
  }

  public String getCopyright () {
    return _copyright;
  }

  public boolean isAutoEmboss () {
    return _autoEmboss;
  }

  public ITSSoundCue getSoundCue () {
    return _soundCue;
  }

  protected void setSoundCue (ITSSoundCue value) {
    _soundCue = value;
  }

  public ITSTutorial getTutorial () {
    return _tutorial;
  }

  protected void setTutorial (ITSTutorial value) {
    _tutorial = value;
  }

  public List<ITSResource> getResources () {
    return _resources;
  }

  protected void setResources (List<ITSResource> value) {
    _resources = value;
  }

  public String getRendererSpec () {
    return _rendererSpec;
  }

  protected void setRendererSpec (String value) {
    _rendererSpec = value;
  }

  public ITSMachineRubric getMachineRubric () {
    return _machineRubric;
  }

  protected void setMachineRubric (ITSMachineRubric value) {
    _machineRubric = value;
  }

  public String getGridAnswerSpace () {
    return _gridAnswerSpace;
  }

  protected void setGridAnswerSpace (String value) {
    _gridAnswerSpace = value;
  }

  // Gets the content for a specific language.
  public abstract ITSContent getContent (String language);

  // Gets the content for the default language ("ENU").
  public abstract ITSContent getContentDefault ();

  public abstract List<String> getMediaFiles ();

  public String getID () {
    return ITSDocumentExtensions.getID (this);
  }

  public String getGroupID () {
    return ITSDocumentExtensions.getGroupID (this);
  }

  public String[] getBaseUriDirSegments () {
    return ITSDocumentExtensions.getBaseUriDirSegments (this);
  }

  public String getFolderName () {
    return ITSDocumentExtensions.getFolderName (this);
  }

  public String getParentFolderName () {
    return ITSDocumentExtensions.getParentFolderName (this);
  }

  /**
   * @return
   */
  public int getMaxScore () {
    return 0;
  }

}
