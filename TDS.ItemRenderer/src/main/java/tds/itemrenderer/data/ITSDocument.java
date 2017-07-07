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

import com.fasterxml.jackson.annotation.JsonAutoDetect;
import org.apache.commons.lang.StringUtils;

import tds.itemrenderer.data.ITSTypes.ITSEntityType;
import AIR.Common.Helpers._Ref;

import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.ANY;
import static com.fasterxml.jackson.annotation.JsonAutoDetect.Visibility.NONE;

// Represents ITS XML data and well known attributes.
@JsonAutoDetect(fieldVisibility = ANY, getterVisibility = NONE, setterVisibility = NONE)
public class ITSDocument extends ITSDocumentXml
{
  @Override
  public long getItemKey () {
    return getId ();
  }

  @Override
  public void setItemKey (Long value) {
    setId (value);
  }

  public void setAttributeStimulusKey (long value) {
    setAttributeValue ("stm_pass_id", "" + value);
    setStimulusKey (value);
  }

  @Override
  public long getStimulusKey () {
    String value = getAttributeValue ("stm_pass_id");
    return StringUtils.isEmpty (value) ? 0 : Long.parseLong (value);
  }

  public void setAttributeLayout (String value) {
    setAttributeValue ("itm_att_Page Layout", value);
  }

  @Override
  public String getLayout () {
    if (!StringUtils.isEmpty (super.getLayout ()))
      return super.getLayout ();
    // If there is no response type then it is the older item format
    if (StringUtils.isEmpty (getResponseType ())) {
      return getAttributeValue ("itm_att_Item Layout");
    }
    return getAttributeValue ("itm_att_Page Layout");
  }

  public void setAttributeFormat (String value) {
    setAttributeValue ("itm_att_Item Format", value);
  }

  public void setAttributeResponseType (String value) {
    setAttributeValue ("itm_att_Response Type", value);
  }

  @Override
  public String getResponseType () {
    return getAttributeValue ("itm_att_Response Type");
  }

  public void setAttributeSubject (String value) {
    setAttributeValue ("itm_item_subject", value);
  }

  @Override
  public String getSubject () {
    return getAttributeValue ("itm_item_subject");
  }

  public void setAttributeGrade (String value) {
    setAttributeValue ("itm_att_Grade", value);
  }

  @Override
  public String getGrade () {
    return getAttributeValue ("itm_att_Grade");
  }

  public void setAttributeAnswerKey (String value) {
    setAttributeValue ("itm_att_Answer Key", value);
  }

  @Override
  public String getAnswerKey () {
    return getAttributeValue ("itm_att_Answer Key");
  }

  public void setAttributeCredit (String value) {
    setAttributeValue ("stm_att_Credit Line", value);
  }

  @Override
  public String getCredit () {
    return getAttributeValue ("stm_att_Credit Line");
  }

  public void setAttributeCopyright (String value) {
    setAttributeValue ("itm_att_Copyright text", value);
  }

  @Override
  public String getCopyright () {
    return getAttributeValue ("itm_att_Copyright text");
  }

  public boolean getAutoEmboss () {
    String attid = (getStimulusKey () > 0) ? "stm_att_Rendering Guide" : "itm_att_Rendering Guide";
    String renderingGuide = getAttributeValue (attid);
    return (renderingGuide != null && StringUtils.equalsIgnoreCase (renderingGuide, "AutoEmboss"));
  }

  public int getMaxScore () {
    String value = getAttributeValue ("itm_att_Max Item Score");
    int maxScore;
    try {
      maxScore = Integer.parseInt (value);
    } catch (NumberFormatException e) {
      maxScore = 0;
    }
    return maxScore;
  }
  
  @Override
  public String getFormat ()
  {
    return getAttributeValue ("itm_att_Item Format");
  }

}
