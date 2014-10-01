/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

import java.util.ArrayList;
import java.util.List;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Predicate;
import org.apache.commons.lang.StringUtils;
import org.w3c.dom.Element;

import tds.itemrenderer.data.apip.APIPXml;

public class ITSContent
{
  private String              _title;          // only for passage
  private String              _language;
  private ITSMachineRubric    _machineRubric;
  private String              _illustration;
  private String              _illustrationTTS;
  private String              _stem;
  private String              _stemTTS;
  private String              _gridAnswerSpace;
  private ITSOptionList       _options;
  private ITSKeyboard         _keyboard;
  private APIPXml             _apip;
  private List<ITSAttachment> _attachments;
  private ITSQTI              _qti;
  private final List<Element>        _genericElements = new ArrayList<>();

  public ITSContent () {
  }

  public ITSContent (String language) {
    _language = language;
  }

  public String getTitle () {
    return _title;
  }

  public void setTitle (String _title) {
    this._title = _title;
  }

  public String getLanguage () {
    return _language;
  }

  public void setLanguage (String _language) {
    this._language = _language;
  }

  public ITSMachineRubric getMachineRubric () {
    return _machineRubric;
  }

  public void setMachineRubric (ITSMachineRubric _machineRubric) {
    this._machineRubric = _machineRubric;
  }

  public String getIllustration () {
    return _illustration;
  }

  public void setIllustration (String _illustration) {
    this._illustration = _illustration;
  }

  public String getIllustrationTTS () {
    return _illustrationTTS;
  }

  public void setIllustrationTTS (String _illustrationTTS) {
    this._illustrationTTS = _illustrationTTS;
  }

  public String getStem () {
    return _stem;
  }

  public void setStem (String _stem) {
    this._stem = _stem;
  }

  public String getStemTTS () {
    return _stemTTS;
  }

  public void setStemTTS (String _stemTTS) {
    this._stemTTS = _stemTTS;
  }

  public String getGridAnswerSpace () {
    return _gridAnswerSpace;
  }

  public void setGridAnswerSpace (String _gridAnswerSpace) {
    this._gridAnswerSpace = _gridAnswerSpace;
  }

  public ITSOptionList getOptions () {
    return _options;
  }

  public void setOptions (ITSOptionList _options) {
    this._options = _options;
  }

  public ITSKeyboard getKeyboard () {
    return _keyboard;
  }

  public void setKeyboard (ITSKeyboard _keyboard) {
    this._keyboard = _keyboard;
  }

  public APIPXml getApip () {
    return _apip;
  }

  public void setApip (APIPXml _apip) {
    this._apip = _apip;
  }

  public List<ITSAttachment> getAttachments () {
    return _attachments;
  }

  public void setAttachments (List<ITSAttachment> _attachments) {
    this._attachments = _attachments;
  }

  public ITSQTI getQti () {
    return _qti;
  }

  public void setQti (ITSQTI _qti) {
    this._qti = _qti;
  }

  public ITSAttachment GetBrailleTypeAttachment (AccLookup accLookup) {
    // check if there are any attachments
    if (_attachments == null)
      return null;

    String brailleType = null;
    AccProperties accProps = new AccProperties (accLookup);
    
    if (accProps.getBrailleType () == null) {
      return null;
    }

    // using the accommodation code for braille type figure out what the ITS
    // braille would be
    switch (accProps.getBrailleType ()) {
    case "TDS_BT_G1":
      brailleType = "uncontracted";
      break;
    case "TDS_BT_G2":
      brailleType = "contracted";
      break;
    case "TDS_BT_NM":
      brailleType = "nemeth";
      break;
    }

    // check if the braille type was found
    if (brailleType == null)
      return null;

    final String brailleTypeFinal = brailleType;

    // check if the tests braille type matches the attachments subtype (which is
    // a braille type as well)
    return (ITSAttachment) CollectionUtils.find (_attachments, new Predicate ()
    {
      @Override
      public boolean evaluate (Object attachment) {
        return StringUtils.equalsIgnoreCase (brailleTypeFinal, ((ITSAttachment) attachment).getSubType ());
      }
    });
  }

  public List<Element> getGenericElements () {
    return _genericElements;
  }
 
  
}
