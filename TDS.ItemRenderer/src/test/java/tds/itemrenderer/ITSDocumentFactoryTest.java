/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer;

import AIR.test.framework.AbstractTest;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.ContextConfiguration;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.processing.ItemDataReader;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ContextConfiguration(locations = "/item-renderer-test-context.xml")
public class ITSDocumentFactoryTest extends AbstractTest {
  private ItemDataReader itemReader;

  @Before
  public void setUp() {
    itemReader = mock(ItemDataReader.class);
  }

  @Test
  public void testLoadUri2() {
    URL url = getClass().getResource("/items/item-187-1126.xml");
    IITSDocument itsDocument = ITSDocumentFactory.loadUri2(url.getFile(), null, false);
    assertEquals("I-187-1126", itsDocument.getID());
    assertEquals("MC", itsDocument.getFormat());
    assertEquals("8", itsDocument.getLayout());
    assertEquals("<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>", itsDocument.getContent("ENU").getStem());
  }

  @Test
  public void itShouldLoadDocumentWithReader() throws URISyntaxException, IOException {
    URL url = getClass().getResource("/items/item-187-1126.xml");
    InputStream is = null;
    URI uri = url.toURI();
    IITSDocument iitsDocument;
    try {
      is = new FileInputStream(new File(uri));
      when(itemReader.readData(uri)).thenReturn(is);
      iitsDocument = ITSDocumentFactory.load(uri, null, itemReader, false);
    } finally {
      if (is != null) {
        is.close();
      }
    }

    assertEquals("I-187-1126", iitsDocument.getID());
    assertEquals("MC", iitsDocument.getFormat());
    assertEquals("8", iitsDocument.getLayout());
    assertEquals("<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>", iitsDocument.getContent("ENU").getStem());
  }
}
