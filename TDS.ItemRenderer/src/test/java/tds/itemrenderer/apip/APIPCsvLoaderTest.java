/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip;

import static org.junit.Assert.assertEquals;

import java.util.List;

import org.junit.Test;
import org.springframework.test.context.ContextConfiguration;

import AIR.test.framework.AbstractTest;

/**
 * @author jmambo
 *
 */
@ContextConfiguration (locations = "/item-renderer-test-context.xml")
public class APIPCsvLoaderTest extends AbstractTest
{

  @Test
  public void testLoadRules () throws Exception {
    int expectedNumGroups = 16;

    APIPCsvLoader.loadRules ();
    assertEquals (expectedNumGroups, APIPRuleGroups.getGroups ().size ());
    for (APIPRuleGroup apipRuleGroup : APIPRuleGroups.getGroups ()) {
      if (apipRuleGroup.getCode ().equals ("TDS_TTX_A202")) {
        List<APIPRule> apipRules = apipRuleGroup.getRules ();
        assertEquals("Graphics", apipRules.get (0).getType ().getName ());
        assertEquals("Braille Text", apipRules.get (0).getTag().getName ());
        assertEquals("Text", apipRules.get (1).getType ().getName ());
        assertEquals("Braille Text", apipRules.get (1).getTag ().getName ());
        assertEquals("Equations", apipRules.get (2).getType ().getName ());
        assertEquals("Braille Text", apipRules.get (2).getTag ().getName ());
        break;
      }
    }

  }


}
