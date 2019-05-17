/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip;

import java.util.ArrayList;
import java.util.List;

import tds.itemrenderer.apip.apiprulelement.APIPRuleElementGraphics;
import tds.itemrenderer.apip.apipruletag.APIPRuleTagNemeth;
import tds.itemrenderer.data.AccProperties;
import tds.itemrenderer.data.ITSTypes.ITSContextType;
import tds.itemrenderer.data.apip.APIPAccessElement;

/**
 * @author jmambo
 *
 *  Gets the APIP element text based on rules in APIPRuleGroup
 */
public class APIPRulesEngine
{
  private final APIPMode _apipMode;
  private List<APIPRule> _contextRules = new ArrayList<APIPRule>();

  public APIPRulesEngine(APIPMode apipMode, APIPRuleGroup apipRuleGroup, ITSContextType contextType)  {
      _apipMode = apipMode;
 
      //TODO: perform filtering based on context type (TODO)
      List<APIPRule> apipRules = apipRuleGroup.getRules();
      if (apipRules != null)  {
        for (APIPRule apipRule : apipRules)  {
            _contextRules.add(apipRule);
        }
      }
  }

  /**
   * 
   * Returns the text for a HTML node name and corresponding APIP XML element
   *  
   * @param nodeName
   * @param accessElement
   * @return
   */
  public String evaluate(String nodeName, APIPAccessElement accessElement, AccProperties accProperties)  {
      StringBuilder replacementText = new StringBuilder();

      int lastOrderRead = 0;

      for (APIPRule apipRule : _contextRules) {
        
          // check if we have already used this reading sequence (order)
          if (apipRule.getOrder () == lastOrderRead) { 
            continue;
          }

          // check if rule matches element
          if (apipRule.getType () == null)  {
            throw new APIPException("APIP missing rule type");
          }
          if (!apipRule.getType ().matches(accessElement))  {
            continue;
          }

          // get rules APIP value 
          if (apipRule.getTag() == null) {
            throw new APIPException("APIP missing rule tag");
          }

          // Adding special condition when TTS_VI is enabled
          // Will only process BrailleText
          String ruleValue;
          if (accProperties.isTTSViEnabled()) {
              if (apipRule.getType() instanceof APIPRuleElementGraphics) {
                  ruleValue = accessElement.getRelatedElementInfo().getBraille().getText();
              } else {
                  ruleValue = null;
              }
          } else {
              ruleValue = apipRule.getTag().getValue(accessElement);
          }

          // check if APIP value exists (NULL if no value exists)
          if (ruleValue != null) {
              // HACK: If we are in BRF mode and nemeth then wrap in special tag and stop processing here
              if (_apipMode == APIPMode.BRF && apipRule.getTag() instanceof APIPRuleTagNemeth) {
                 return "<ntr>" + ruleValue + "</ntr>"; 
              }

              // add space if we are appending to existing text
              if (replacementText.length() > 0) {
                  replacementText.append(" ");
              }

              replacementText.append(ruleValue);
              lastOrderRead = apipRule.getOrder();
          }
      }

      if (lastOrderRead > 0) {
          return replacementText.toString();
      }

      return null;
  }
}
