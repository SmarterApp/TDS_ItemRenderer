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
public class ITSDocument2 extends IITSDocument
{
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

  public String getAttributeValue (String attid) {
    ITSAttribute attribute = getAttribute (attid);
    return (attribute == null) ? "" : attribute.getValue ();
  }



  public long getItemKey () {
    return getId ();
  }

  public void setItemKey (Long value) {
    setId (value);
  }

  public long getStimulusKey () {
    String value = getAttributeValue ("stm_pass_id");
    return StringUtils.isEmpty (value) ? 0 : Long.parseLong (value);
  }


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

  public String getResponseType () {
    return getAttributeValue ("itm_att_Response Type");
  }


  public String getSubject () {
    return getAttributeValue ("itm_item_subject");
  }


  public String getGrade () {
    return getAttributeValue ("itm_att_Grade");
  }


  public String getCopyright () {
    return getAttributeValue ("itm_att_Copyright text");
  }

  public String getFormat ()
  {
    return getAttributeValue ("itm_att_Item Format");
  }

}
