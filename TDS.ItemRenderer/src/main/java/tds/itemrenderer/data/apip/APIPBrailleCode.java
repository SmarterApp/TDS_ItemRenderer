/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data.apip;

public class APIPBrailleCode
{
  public String _type = null;

  public String _code = null;

  public APIPBrailleCode (String type, String code) {
    setType (type);
    setCode (code);
  }

  public String getType () {
    return _type;
  }

  public void setType (String value) {
    _type = value;
  }

  public String getCode () {
    return _code;
  }

  public void setCode (String value) {
    _code = value;
  }
}
