/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer;

import java.net.URL;

import org.junit.Test;
import org.springframework.test.context.ContextConfiguration;

import tds.itemrenderer.data.IITSDocument;
import AIR.test.framework.AbstractTest;

import static org.junit.Assert.*;

/**
 * @author jmambo
 *
 */
@ContextConfiguration (locations = "/item-renderer-test-context.xml")
public class ITSDocumentFactoryTest extends AbstractTest
{
  
  @Test
  public void testLoadUri2() {
    URL url = getClass ().getResource ("/items/item-187-1126.xml");
    IITSDocument itsDocument  = ITSDocumentFactory.loadUri2 (url.getFile (), null, false);
    assertEquals("I-187-1126", itsDocument.getID ());
    assertEquals("mc", itsDocument.getFormat ());
    assertEquals("8", itsDocument.getLayout ());
    assertEquals("<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>", itsDocument.getContent ("ENU").getStem ());
  }
  
  
}
