/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

import java.util.ArrayList;

/**
 * @author jmambo
 *
 */
public class ITSOptionList extends ArrayList<ITSOption>
{

  private static final long serialVersionUID = 1L;
  
  private int minChoices = 1;
  private int maxChoices = 0;
  
  /**
   * @return the minChoices
   */
  public int getMinChoices () {
    return minChoices;
  }
  /**
   * @param minChoices the minChoices to set
   */
  public void setMinChoices (int minChoices) {
    this.minChoices = minChoices;
  }
  /**
   * @return the maxChoices
   */
  public int getMaxChoices () {
    return maxChoices;
  }
  /**
   * @param maxChoices the maxChoices to set
   */
  public void setMaxChoices (int maxChoices) {
    this.maxChoices = maxChoices;
  }
  
  
  

}
