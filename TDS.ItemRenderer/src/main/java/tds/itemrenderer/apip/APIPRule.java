/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip;

import tds.itemrenderer.apip.apipruletag.APIPRuleTag;
import tds.itemrenderer.data.ITSTypes.ITSContextType;
import AIR.Common.Utilities.TDSStringUtils;

/**
 * @author jmambo
 *
 */
public class APIPRule
{

  private APIPRuleElement _type;
  private APIPRuleTag     _tag;
  private int             _order;
  private int             _priority;
  private ITSContextType  _context;

  /**
   * Gets the type
   * 
   * @return the type
   */
  public APIPRuleElement getType () {
    return _type;
  }

  /**
   * Sets the type
   * 
   * @param type
   *          the type to set
   */
  public void setType (APIPRuleElement type) {
    _type = type;
  }

  /**
   * Gets the tag
   * 
   * @return the tag
   */
  public APIPRuleTag getTag () {
    return _tag;
  }

  /**
   * Sets the tag
   * 
   * @param tag
   *          the tag to set
   */
  public void setTag (APIPRuleTag tag) {
    _tag = tag;
  }

  /**
   * Gets the order
   * 
   * @return the order
   */
  public int getOrder () {
    return _order;
  }

  /**
   * 
   * Sets the order
   * 
   * @param order
   *          the order to set
   */
  public void setOrder (int order) {
    _order = order;
  }

  /**
   * Gets the priority
   * 
   * @return the priority
   */
  public int getPriority () {
    return _priority;
  }

  /**
   * Sets the priority
   * 
   * @param priority
   *          the priority to set
   */
  public void setPriority (int priority) {
    _priority = priority;
  }

  /**
   * Gets the context
   * 
   * @return the context
   */
  public ITSContextType getContext () {
    return _context;
  }

  /**
   * 
   * Sets the context
   * 
   * @param context
   *          the context to set
   */
  public void setContext (ITSContextType context) {
    _context = context;
  }

  /**
   * Gets the order of context
   * 
   * @return context order
   */
  public int getContextOrder () {
    int context = _context.getValue ();

    if (context == ITSContextType.All.getValue ()) {
      return 3;
    } else if (context == ITSContextType.Passage.getValue ()) {
      return 2;
    } else if (context == ITSContextType.Item.getValue ()) {
      return 2;
    } else if (context == ITSContextType.Grid.getValue ()) {
      return 1;
    } else if (context == ITSContextType.Stem.getValue ()) {
      return 1;
    } else if (context == ITSContextType.Illustration.getValue ()) {
      return 1;
    } else if (context == ITSContextType.Option.getValue ()) {
      return 1;
    } else {
      return 9999;
    }
  }

  @Override
  public String toString () {
    return TDSStringUtils.format ("Rule for type {1} where the tag \"{0}\" exists for the context of {4} (Order: {2}, Priority: {3})", _tag.getName (), _type.getName (), _order, _priority, _context);
  }

}
