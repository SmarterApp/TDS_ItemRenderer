/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itempreview;

import java.io.IOException;
import java.util.List;

import AIR.Common.Json.JsonHelper;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ITSResourceConfig
{

  private long   _bankKey;

  private long   _itemKey;

  private String _file;

  @JsonProperty ("bankKey")
  public long getBankKey () {
    return _bankKey;
  }

  public void setBankKey (long value) {
    _bankKey = value;
  }

  @JsonProperty ("itemKey")
  public long getItemKey () {
    return _itemKey;
  }

  public void setItemKey (long value) {
    _itemKey = value;
  }

  @JsonProperty ("file")
  public String getFile () {
    return _file;
  }

  public void setFile (String value) {
    _file = value;
  }

  public static List<ITSResourceConfig> deserializeFromJson (String jsonText) throws IOException {
    return JsonHelper.deserialize (jsonText, new TypeReference<List<ITSResourceConfig>> ()
    {
    });
  }

  public static void main (String[] args) {
    try {
      String json = "[\r\n      { \"bankKey\": 187, \"itemKey\": 1184, \"file\": \"Content\\\\WordList\\\\item-187-1184\\\\Item-187-1184.xml\" },\r\n      { \"bankKey\": 96, \"itemKey\": 48693, \"file\": \"Content\\\\WordList\\\\Item-22222.xml\" },\r\n\t  { \"bankKey\": 187, \"itemKey\": 1085, \"file\": \"Content\\\\WordListExamples\\\\Item_1085_v1.xml\" }\r\n\t, { \"bankKey\": 187, \"itemKey\": 1300, \"file\": \"Content\\\\SBAC_PT_Wordlist\\\\Item_1300_v5.xml\" }\r\n]\r\n";
      List<ITSResourceConfig> resources = ITSResourceConfig.deserializeFromJson (json);
      System.err.println ("");
    } catch (Exception exp) {
      exp.printStackTrace ();
    }
  }

}
