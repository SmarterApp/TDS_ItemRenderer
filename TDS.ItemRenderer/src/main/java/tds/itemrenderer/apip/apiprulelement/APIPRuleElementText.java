/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip.apiprulelement;

import tds.itemrenderer.apip.APIPRuleElement;
import tds.itemrenderer.data.apip.APIPAccessElement;

/**
 * APIP business rule for "Text".
 * 
 * @author jmambo
 *
 */
public class APIPRuleElementText extends APIPRuleElement
{
  
  public APIPRuleElementText(String type)  {
     super(type);
  }

  /**
   * APIP business rule for "Text".
   */
  @Override 
  public boolean matches(APIPAccessElement accessElement) {
      String apipType = accessElement.getContentLinkInfo().getType ();
      return (apipType.equalsIgnoreCase("Text"));
  }
  
}

