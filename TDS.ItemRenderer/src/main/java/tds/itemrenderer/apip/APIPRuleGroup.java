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

/**
 * @author jmambo
 *
 */
public class APIPRuleGroup
{

  private final List<APIPRule> _rules = new ArrayList<APIPRule>();
  private String _code;

  public String getCode() {
    return _code; 
  }
  
  public void setCode(String code) {
    _code = code;
    
  }

  public APIPRuleGroup(String code)
  {
      _code = code;
  }

  public void addRule(APIPRule rule)
  {
      _rules.add(rule);
  }

  public List<APIPRule> getRules()
  {
      return _rules;
  }

  @Override
  public String toString()
  {
      return _code;
  }
  
}
