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
 * APIP business rule for "Math Equations".
 * 
 * MathML is outputted as an HTML image. So we need to look for a image 
 * with apip type set specically as equation. You cannot manually select 
 * this using tagging interface so only MathML will ever match. 
 * 
 * @author jmambo
 *
 */
public class APIPRuleElementEquations extends APIPRuleElement
{
  
  public APIPRuleElementEquations(String type)  {
     super(type);
  }

  /**
   * Check if the name of the HTML element is an image and the APIP type  
   */
  @Override 
  public boolean matches(APIPAccessElement accessElement) {
      String apipType = accessElement.getContentLinkInfo().getType ();
      return (apipType.equalsIgnoreCase("Equation"));
  }
  
}

