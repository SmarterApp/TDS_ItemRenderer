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

import AIR.Common.Utilities.TDSStringUtils;

  public class ITSAttribute
  {
    private String _id; 
    private String _name; 
    private String _value; 
    private String _description; 

    public ITSAttribute()
    {

    }

    public ITSAttribute(String id, String value)
    {
      _id = id;
      _value = value;
    }

    public String getId () {
      return _id;
    }

    public void setId (String _id) {
      this._id = _id;
    }

    public String getName () {
      return _name;
    }

    public void setName (String _name) {
      this._name = _name;
    }

    public String getValue () {
      return _value;
    }

    public void setValue (String _value) {
      this._value = _value;
    }

    public String getDescription () {
      return _description;
    }

    public void setDescription (String _description) {
      this._description = _description;
    }

    public String toString()
    {
      return TDSStringUtils.format("attid: {0}", _id);
    }

  }
