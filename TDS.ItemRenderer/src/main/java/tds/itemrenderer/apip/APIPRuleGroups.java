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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author jmambo
 *
 */
public class APIPRuleGroups {
  
  private static final Map<String, APIPRuleGroup> _accommodations = new HashMap<>();

  public static APIPRuleGroup createGroup(String code)  {
      APIPRuleGroup apipAcc = new APIPRuleGroup(code);
      _accommodations.put(code, apipAcc);
      return apipAcc;
  }

  public static boolean hasGroup(String code)  {
      return _accommodations.containsKey(code);
  }

  public static APIPRuleGroup getGroup(String code)  {
      return _accommodations.get (code);
  }

  public static List<APIPRuleGroup> getGroups()  {
      return new ArrayList<APIPRuleGroup>(_accommodations.values());
  }
  
}
