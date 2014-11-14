/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/**
 * 
 */
package tds.blackbox;

import java.util.List;

import AIR.Common.Json.JsonHelper;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
// / <summary>
// / These classes are used to facilitate blackbox javascript requests.
// / </summary>
// / <remarks>
// / This class is used by a .NET web service do not change.
// / </remarks>
public class ContentRequest
{
  // / <summary>
  // / A unique identifier for this request.
  // / </summary>
  private String                            _id             = null;
  private String                            _client         = null;
  private String                            _language       = null;
  private String                            _layoutFolder   = null;
  private String                            _layoutFile     = null;
  private String                            _layoutName     = null;
  private ContentRequestPassage             _passage        = null;
  private List<ContentRequestItem>          _items          = null;
  private List<ContentRequestAccommodation> _accommodations = null;
  private List<ContentRequestSetting>       _settings       = null;
  private boolean                           _encrypted      = false;
  private String                            _label          = null;
  private String                            _sectionId      = null;

  @JsonProperty ("id")
  public String getId () {
    return _id;
  }

  public void setId (String value) {
    _id = value;
  }

  @JsonProperty ("sectionID")
  public String getSectionId () {
    return _sectionId;
  }

  public void setSectionId (String value) {
    _sectionId = value;
  }

  @JsonProperty ("client")
  public String getClient () {
    return _client;
  }

  public void setClient (String value) {
    _client = value;
  }

  @JsonProperty ("language")
  public String getLanguage () {
    return _language;
  }

  public void setLanguage (String value) {
    _language = value;
  }

  @JsonProperty ("layoutFolder")
  public String getLayoutFolder () {
    return _layoutFolder;
  }

  public void setLayoutFolder (String value) {
    _layoutFolder = value;
  }

  @JsonProperty ("layoutFile")
  public String getLayoutFile () {
    return _layoutFile;
  }

  public void setLayoutFile (String value) {
    _layoutFile = value;
  }

  @JsonProperty ("layoutName")
  public String getLayoutName () {
    return _layoutName;
  }

  public void setLayoutName (String value) {
    _layoutName = value;
  }

  @JsonProperty ("passage")
  public ContentRequestPassage getPassage () {
    return _passage;
  }

  public void setPassage (ContentRequestPassage value) {
    _passage = value;
  }

  @JsonProperty ("items")
  public List<ContentRequestItem> getItems () {
    return _items;
  }

  public void setItems (List<ContentRequestItem> value) {
    _items = value;
  }

  @JsonProperty ("accommodations")
  public List<ContentRequestAccommodation> getAccommodations () {
    return _accommodations;
  }

  public void setAccommodations (List<ContentRequestAccommodation> value) {
    _accommodations = value;
  }

  @JsonProperty ("settings")
  public List<ContentRequestSetting> getSettings () {
    return _settings;
  }

  public void setSettings (List<ContentRequestSetting> value) {
    _settings = value;
  }

  // / <summary>
  // / If this is true the file paths are encrypted and base64 encoded.
  // / </summary>
  @JsonProperty ("encrypted")
  public boolean getEncrypted () {
    return _encrypted;
  }

  public void setEncrypted (boolean value) {
    _encrypted = value;
  }

  public String getLabel () {
    return _label;
  }

  public void setLabel (String value) {
    _label = value;
  }

  public ContentRequest () {
  }

  public static void main (String[] args) {
    try {
      String json = "{\"accommodations\":[{\"codes\":[\"ENU\"],\"type\":\"Language\"},{\"codes\":[\"TDS_TTX_0\"],\"type\":\"TTX Business Rules\"},{\"codes\":[\"TDS_CC0\"],\"type\":\"Color Choices\"},{\"codes\":[\"TDS_ASL0\"],\"type\":\"American Sign Language\"},{\"codes\":[\"TDS_ItmNum1\"],\"type\":\"Item Numbers\"},{\"codes\":[\"TDS_PS_L0\"],\"type\":\"Print Size\"},{\"codes\":[\"TDS_FT_San-Serif\"],\"type\":\"Font Type\"},{\"codes\":[\"TDS_F_S12\"],\"type\":\"Font Size\"},{\"codes\":[\"TDS_TTS_Item\",\"TDS_TTS_Stim\"],\"type\":\"TTS\"},{\"codes\":[\"TDS_TTSPause1\"],\"type\":\"TTS Pausing\"},{\"codes\":[\"TDS_TTSTracking1\"],\"type\":\"TTS Tracking\"},{\"codes\":[\"TDS_Masking1\"],\"type\":\"Masking\"},{\"codes\":[\"TDS_Highlight1\"],\"type\":\"Highlight\"},{\"codes\":[\"TDS_ExpandablePassages1\"],\"type\":\"Expandable Passages\"},{\"codes\":[\"TDS_ITM1\"],\"type\":\"Item Tools Menu\"},{\"codes\":[\"TDS_ItemReset0\"],\"type\":\"Item Response Reset\"},{\"codes\":[\"TDS_PoD_Item\",\"TDS_PoD_Stim\"],\"type\":\"Print on Request\"},{\"codes\":[\"TDS_GfR1\"],\"type\":\"Guide for Revision\"},{\"codes\":[\"TDS_MfR1\"],\"type\":\"Mark for Review\"},{\"codes\":[\"TDS_SC1\"],\"type\":\"Student Comments\"},{\"codes\":[\"TDS_T1\"],\"type\":\"Tutorial\"},{\"codes\":[\"TDS_ST1\"],\"type\":\"Strikethrough\"},{\"codes\":[\"TDS_LR1\"],\"type\":\"Line Reader\"},{\"codes\":[\"LPN_FB1\"],\"type\":\"Feedback\"},{\"codes\":[\"TDS_WL_DICT\",\"TDS_WL_ESNGlossary\"],\"type\":\"Word List\"},{\"codes\":[\"TDS_Compass1\"],\"type\":\"Compass\"},{\"codes\":[\"TDS_StraightLine1\"],\"type\":\"Straight Line\"},{\"codes\":[\"TDS_Ruler0\"],\"type\":\"Ruler\"},{\"codes\":[\"TDS_Protractor0\"],\"type\":\"Protractor\"},{\"codes\":[\"TDS_ASIGuide0\"],\"type\":\"Scaffolding Voice Guidance\"},{\"codes\":[\"TDS_APC_PSP\"],\"type\":\"Audio Playback Controls\"},{\"codes\":[\"TDS_SLM0\"],\"type\":\"Streamlined Mode\"},{\"codes\":[\"TDS_PIG0\"],\"type\":\"Paginate Item Groups\"},{\"codes\":[\"TDS_HEBG_None\"],\"type\":\"HTMLEditor Button Groups\"}],\"encrypted\":false,\"id\":\"page-4070778843\",\"items\":[{\"bankKey\":126,\"file\":\"~/ItemPreviewContent/17135_Content_QTI_Score/Item_17135_v1.xml\",\"itemKey\":17135,\"label\":null,\"position\":0,\"printable\":false}],\"label\":\"I-126-17135 - 8 TableMatch (mi)\",\"layoutName\":null,\"passage\":null,\"sectionID\":\"17135_Content_QTI_Score\"}";
      ContentRequest request = JsonHelper.deserialize (json, ContentRequest.class);
      System.err.println("");
    } catch (Exception exp) {
      exp.printStackTrace ();
    }
  }
}
