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
public class APIPRuleTagBrailleText extends APIPRuleTag
{

  public APIPRuleTagBrailleText(String tag) {
    super(tag);
  }

  @Override
  public String getValue(APIPAccessElement accessElement)  {
      if (accessElement.getRelatedElementInfo().getBraille() != null) {
          return accessElement.getRelatedElementInfo().getBraille().getText();
      }
      return null;
  }
  
}
