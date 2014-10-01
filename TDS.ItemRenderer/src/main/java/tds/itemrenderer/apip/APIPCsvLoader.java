/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.supercsv.cellprocessor.ift.CellProcessor;
import org.supercsv.io.CsvBeanReader;
import org.supercsv.io.ICsvBeanReader;
import org.supercsv.prefs.CsvPreference;

import tds.itemrenderer.apip.apiprulelement.APIPRuleElementEquations;
import tds.itemrenderer.apip.apiprulelement.APIPRuleElementGraphics;
import tds.itemrenderer.apip.apiprulelement.APIPRuleElementTables;
import tds.itemrenderer.apip.apiprulelement.APIPRuleElementText;
import tds.itemrenderer.apip.apipruletag.APIPRuleTag;
import tds.itemrenderer.apip.apipruletag.APIPRuleTagBrailleText;
import tds.itemrenderer.apip.apipruletag.APIPRuleTagLiteralText;
import tds.itemrenderer.apip.apipruletag.APIPRuleTagLongDesc;
import tds.itemrenderer.apip.apipruletag.APIPRuleTagNemeth;
import tds.itemrenderer.apip.apipruletag.APIPRuleTagShortDesc;
import tds.itemrenderer.apip.apipruletag.APIPRuleTagTTS;
import tds.itemrenderer.data.ITSTypes.ITSContextType;

/**
 * @author jmambo
 *
 */
public class APIPCsvLoader
{

  public static void loadRules () {
    ICsvBeanReader beanReader = null;
    List<APIPCsvMapper> apipRulesData = new ArrayList<APIPCsvMapper> ();
    try {
      InputStream inputStream =
          APIPCsvLoader.class.getClassLoader ().getResourceAsStream ("apip.csv");
      beanReader = new CsvBeanReader (new InputStreamReader (inputStream), CsvPreference.STANDARD_PREFERENCE);
      String[] header = beanReader.getHeader (true);
      CellProcessor[] processors = new CellProcessor[] { null, null, null, null, null, null, null };
      APIPCsvMapper apipCsvMapper;
      while ((apipCsvMapper = beanReader.read (APIPCsvMapper.class, header, processors)) != null) {
        apipRulesData.add (apipCsvMapper);
      }
    } catch (Exception e) {
      throw new RuntimeException ("APIPCsvLoader.loadRules: " + e.getMessage (), e);
    } finally {
      if (beanReader != null) {
        try {
          beanReader.close ();
        } catch (IOException e) {
          throw new RuntimeException ("APIPCsvLoader.loadRules: " + e.getMessage (), e);
        }
      }
    }

    // load rules
    for (APIPCsvMapper rulesReader : apipRulesData) {

      String code = rulesReader.getCode ();

      // get accommodation code (or create it if doesn't exist)
      APIPRuleGroup apipAcc = APIPRuleGroups.getGroup (code);

      if (apipAcc == null) {
        apipAcc = APIPRuleGroups.createGroup (code);
      }

      // create rule
      APIPRule apipRule = new APIPRule ();

      // create tag
      APIPRuleTag apipTag = createTag (rulesReader.getTag ());
      apipRule.setTag (apipTag);

      // create type
      APIPRuleElement apipType = createElementType (rulesReader.getType (), rulesReader.getSubtype ());
      apipRule.setType (apipType);

      apipRule.setContext (ITSContextType.valueOf (rulesReader.getContext ()));
      apipRule.setOrder (Integer.parseInt (rulesReader.getOrder ()));
      apipRule.setPriority (Integer.parseInt (rulesReader.getPriority ()));

      // add rule to accommodation
      apipAcc.addRule (apipRule);
    }

    // sort rule groups
    for (APIPRuleGroup apipRuleGroup : APIPRuleGroups.getGroups ()) {
      List<APIPRule> apipRules = apipRuleGroup.getRules ();
      Collections.sort (apipRules, new APIPRuleComparer ());
    }
    
  }

  private static APIPRuleTag createTag (String tag) {
    switch (tag) {
    case "Literal Text":
    case "Summary":
      return new APIPRuleTagLiteralText (tag);
    case "Short Desc":
      return new APIPRuleTagShortDesc (tag);
    case "Long Desc":
      return new APIPRuleTagLongDesc (tag);
    case "Alt. Pronunciation":
      return new APIPRuleTagTTS (tag);
    case "Braille Text":
      return new APIPRuleTagBrailleText (tag);
    case "Nemeth":
      return new APIPRuleTagNemeth (tag);
    default:
      return null;
    }
  }

  private static APIPRuleElement createElementType (String type, String subtype) {
    switch (type) {
    case "Text":
      return new APIPRuleElementText (type);
    case "Graphics":
      return new APIPRuleElementGraphics (type, subtype);
    case "Equations":
      return new APIPRuleElementEquations (type);
    case "Tables":
      return new APIPRuleElementTables (type, subtype);
    default:
      return null;
    }
  }

}

/**
 * 
 * A comparer class for APIPRules which is used for sorting.
 *
 */
class APIPRuleComparer implements Comparator<APIPRule>
{

  public int compare (APIPRule rule1, APIPRule rule2) {
    // sort order
    int result = 0;
    if (rule1.getOrder () > rule2.getOrder ()) {
      result = 1;
    } else if (rule1.getOrder () < rule2.getOrder ()) {
      result = -1;
    }
    // sort priority
    if (result == 0) {
      if (rule1.getPriority () > rule2.getPriority ()) {
        result = 1;
      } else if (rule1.getPriority () < rule2.getPriority ()) {
        result = -1;
      }
    }

    // sort context
    if (result == 0) {
      if (rule1.getContextOrder () > rule2.getContextOrder ()) {
        result = 1;
      } else if (rule1.getContextOrder () < rule2.getContextOrder ()) {
        result = -1;
      }
    }

    return result;
  }
  
}
