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
 * APIP business rule for "Graphics".
 * 
 * @author jmambo
 *
 */
public class APIPRuleElementGraphics extends APIPRuleElement
{
  
  public APIPRuleElementGraphics(String type, String subtype)  {
     super(type, subtype);
  }

  /**
   *  Check if the name of the HTML element is an image but the APIP type is not an equation.
   */
  @Override 
  public boolean matches(APIPAccessElement accessElement) {
      String apipType = accessElement.getContentLinkInfo().getType ();
      String apipSubType = accessElement.getContentLinkInfo().getSubType();

      //  check if HTML element is a image
      if (apipType.equalsIgnoreCase("Graphic")) {
          // Possible APIP subtypes: Generic, Chart
          if (getSubType().equalsIgnoreCase("All") || getSubType().equalsIgnoreCase(apipSubType)) { 
            return true;
          }
      }
      return false;
  }
  
}

