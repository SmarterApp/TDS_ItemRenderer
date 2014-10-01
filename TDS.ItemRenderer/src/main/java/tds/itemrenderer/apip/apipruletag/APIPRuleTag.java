/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip.apipruletag;

import tds.itemrenderer.data.apip.APIPAccessElement;

/**
 * @author jmambo
 *
 */
public abstract class APIPRuleTag
{

  public String _name; 

  protected APIPRuleTag(String tag)  {
      _name = tag;
  }

  /**
   * Gets the APIP related element info text value.
   * 
   * @param accessElement
   * @return
   */
  public abstract String getValue(APIPAccessElement accessElement);

  
  public String getName () {
    return _name;
  }

  public void setName (String name) {
    _name = name;
  }

  @Override
  public String toString()  {
      return _name;
  }
  
}
