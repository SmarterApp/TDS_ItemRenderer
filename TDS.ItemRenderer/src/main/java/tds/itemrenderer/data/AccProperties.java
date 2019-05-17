/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

import org.apache.commons.lang.StringUtils;

/// These are well known accommodation properties.
public class AccProperties    {

  /*
   * When a field declaration includes a readonly modifier, 
   * assignments to the fields introduced by the declaration can only occur as 
   * part of the declaration or in a constructor in the same class.
   * Ensures field is not modified outside of constructor. Specified at runtime
   */

  private String _language;
  private final AccLookup _lookup;


  public AccProperties(AccLookup lookup)
  {
    _lookup = lookup;
  }

  public AccLookup getLookup(){
    return _lookup;
  }

  public String getLanguage() {
    if (_language == null ) {
      String language = _lookup.getCode("Language");
      _language = (StringUtils.isEmpty (language)) ? "ENU" : language;
    } 
    return _language;
  }

  //Check if Braille is enabled for this test.
  public boolean isBrailleEnabled()
  {
    // for legacy ITS reasons check braille accommodations
    if (isSelected("Braille", "TDS_Braille1")) 
      return true;

    // otherwise check if language has braille support or braille type is selected
    return (getLanguage().endsWith("-Braille") || isExistsAndNotEquals("Braille Type", "TDS_BT0"));
  }

  /**
   * Get the test shell to load.
   * @return TDS_TS_Classic, TDS_TS_Modern, TDS_TS_Accessibility
   */
  public String getTestShell()
  {
      return getCode("Test Shell");
  }
  
  public boolean isStreamlinedMode()
  {
	  return isSelected("Streamlined Mode", "TDS_SLM1");
  }
  
  public boolean isCalculatorEnabled()
  {
    return isExistsAndNotEquals("Calculator", "TDS_Calc0"); 
  }

  public String getCalculatorMode()
  {
    return getCode("Calculator"); 
  }

  public boolean isColorChoiceEnabled()
  {
    return isExistsAndNotEquals("Color Choices", "TDS_CC0");
  }

  public String getColorChoice()
  {
    return getCode("Color Choices"); 
  }

  public boolean isFormulaSheetEnabled()
  {
    return isExistsAndNotEquals("Formula", "TDS_F0");
  }

  public String getFormulaSheet()
  {
    return getCode("Formula");
  }

  public boolean isPeriodicTableEnabled()
  {
    return isExistsAndNotEquals("Periodic Table", "TDS_PT0"); 
  }

  public String getPeriodicTable()
  {
    return getCode("Periodic Table"); 
  }

  public String getFontSize()
  {
    return getCode("Font Size"); 
  }

  public String getFontType()
  {
    return getCode("Font Type"); 
  }

  public boolean isGTREnabled()
  {
    return isSelected("Guide for Revision", "TDS_GfR1"); 
  }

  public boolean isHighlightingEnabled()
  {
    return isSelected("Highlight", "TDS_Highlight1"); 
  }

  public boolean isMarkForReviewEnabled()
  {
    return isSelected("Mark for Review", "TDS_MfR1"); 
  }

  public boolean isPrintItemEnabled()
  {
    return isSelected("Print on Request", "TDS_PoD_Item"); 
  }

  public boolean isPrintStimulusEnabled()
  {
    return isSelected("Print on Request", "TDS_PoD_Stim"); 
  }

  public String getPrintSize()
  {
    return getCode("Print Size"); 
  }

  public boolean isStrikethroughEnabled()
  {
    return isSelected("Strikethrough", "TDS_ST1"); 
  }

  public boolean isStudentCommentsEnabled()
  {
    return isSelected("Student Comments", "TDS_SC1"); 
  }

  public boolean isTTSInstructionEnabled()
  {
    return isSelected("TTS", "TDS_TTS_Inst"); 
  }

  public boolean isTTSItemEnabled()
  {
    return isSelected("TTS", "TDS_TTS_Item"); 
  }

  public boolean isTTSStimulusEnabled()
  {
    return isSelected("TTS", "TDS_TTS_Stim"); 
  }

  public boolean isTTSViEnabled() {
    return isSelected("TTS", "TDS_TTS_VI");
  }

  public boolean isItemTutorialEnabled()
  {
    return isSelected("Tutorial", "TDS_T1"); 
  }

  // If this is true then hide the final test score from the student on the results page.
  public boolean isSuppressScore()
  {
    return isSelected("Suppress Score", "TDS_SS1"); 
  }

 
  /// If this is true then we show the item score report summary on the test results page.
  public boolean isItemScoreReportSummary()
  {
    return isSelected("Item Score Report", "TDS_ISR_Summary"); 
  }


  /// If this is true then we show the item score report summary on the test results page
  /// and allow to go back into the test to see responses.
  public boolean isItemScoreReportResponses()
  {
    return isSelected("Item Score Report", "TDS_ISR_SumViewResp");
  }

  //#region Accessibility

  /// <summary>
  /// Check if BRF generation is being requested for content. This is only used by ITS.
  /// </summary>
  public boolean isBRFEnabled()
  {
    return isSelected("BRF", "ITS_BRF1"); 
  }

  /// <summary>
  /// Get the type of braille for this test.
  /// </summary>
  /// <example>
  /// Uncontracted, Contracted, Nemeth
  /// </example>
  public String getBrailleType()
  {
    return getCode("Braille Type"); 
  }

  /// <summary>
  /// Enable the print button for items for embossing on a braille test.
  /// </summary>
  public boolean isEmbossItemEnabled()
  {
    return isSelected("Emboss", "TDS_Emboss_Item");
  }

  /// <summary>
  /// Enable the print button for stimulus for embossing on a braille test.
  /// </summary>
  public boolean isEmbossStimulusEnabled()
  {
    return isSelected("Emboss", "TDS_Emboss_Stim");
  }


  // Allow submitting item/stimulus for embossing.
  // This requires the accommodation for embossing to be enabled for items and stimlus as well.
  public boolean hasEmbossOnRequest()
  {
    return isSelected("Emboss Request Type", "TDS_ERT_OR"); 
  }


  //  Automatically submit item/stimulus for embossing when the content is requested. 
  // This requires the accommodation for embossing to be enabled for items and stimlus as well.

  public boolean hasEmbossAutoRequest()
  {
    return isSelected("Emboss Request Type", "TDS_ERT_Auto"); 
  }

  public boolean isTTXBusinessRulesEnabled()
  {
    return isExistsAndNotEquals("TTX Business Rules", "TDS_TTX_0");
  }

  //Get the APIP code for the business rules.
  public String getTTXBusinessRules()
  {
    return getCode("TTX Business Rules"); 
  }
  
  /// <summary>
  /// Determine how to show item numbers. 
  /// </summary>
  /// <remarks>
  /// TDS_ItmNum0: Do not show numbers next to items
  /// TDS_ItmNumPos: Show the item position number on the test
  /// TDS_ItmNumSeq: Restart numbering items on every page
  /// </remarks>
  public String ItemNumbers(){
	  
	  if(getCode("Item Numbers")!=null)
	  {
		  return getCode("Item Numbers");
	  }
	  return "TDS_ItmNumPos";
  }
  //#endregion

  //#region Acc Helpers

  private String getCode(String type)
  {
    if (_lookup != null)
    {
      return _lookup.getCode(type);
    }

    return null;
  }

  private boolean isSelected(String type, String code)
  {
    if (_lookup == null) return false;
    return _lookup.exists(type, code);
  }

  private boolean isExistsAndNotEquals(String type, String code)
  {
    // get selected types code
    String selectedCode = this.getCode(type);

    // make sure there is something selected and if there is that it doesn't equal the valye passed in
    return (selectedCode != null && !selectedCode.equals(code));
  }

  //#endregion

}