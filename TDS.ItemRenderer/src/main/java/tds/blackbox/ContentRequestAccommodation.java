/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/**
 * 
 */
package tds.blackbox;

import java.util.List;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class ContentRequestAccommodation
{
  private String       _type  = null;
  private List<String> _codes = null;

  public String getType () {
    return _type;
  }

  public void setType (String value) {
    _type = value;
  }

  public List<String> getCodes () {
    return _codes;
  }

  public void setCodes (List<String> value) {
    _codes = value;
  }

  @Override
  public String toString () {
    return getType ();
  }
}
