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
package tds.itemrenderer.apip;

import tds.itemrenderer.data.apip.APIPAccessElement;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public abstract class APIPRuleElement
{

  private String _name    = null;
  private String _subType = null;

  public String getSubType () {
    return _subType;
  }

  private void setSubType (String value) {
    _subType = value;
  }

  public String getName () {
    return _name;
  }

  private void setName (String value) {
    _name = value;
  }

  protected APIPRuleElement (String type, String subtype) {
    setName (type);
    setSubType (subtype);
  }

  protected APIPRuleElement (String type) {
    setName (type);
  }

  // / <summary>
  // / Check if this APIP Rule element matches.
  // / </summary>
  // / <param name="name">HTML node name</param>
  // / <param name="accessElement">APIP info for HTML node</param>
  // / <returns>True means match</returns>
  public abstract boolean matches (APIPAccessElement accessElement);

  @Override
  public String toString () {
    return getName ();
  }
}
