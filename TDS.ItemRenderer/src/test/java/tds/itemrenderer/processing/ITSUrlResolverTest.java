/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import org.junit.Before;
import org.springframework.test.context.ContextConfiguration;

import tds.itemrenderer.data.ITSDocument;

/**
 * @author jmambo
 *
 */
@ContextConfiguration (locations = "/item-renderer-test-context.xml")
public class ITSUrlResolverTest
{

  ITSDocument _itsDocument;
  
  @Before
  public void setUp() {
    _itsDocument = ITSDocumentFixture.getITSDocument();
  }
  
  //@Test
  public void testResolveResourceUrls() {
        String content = new ITSUrlResolver2("file://item/test.xml").resolveResourceUrls(_itsDocument.getContents ().get (0).getStem ());
       //TODO
 }
  
  
 // @Test
  public void testResolveGridXmlUrls() {
       String content = new ITSUrlResolver2("file://item/test.xml").resolveGridXmlUrls(_itsDocument.getGridAnswerSpace (), "ENU");
       //TODO
  }
  
}
