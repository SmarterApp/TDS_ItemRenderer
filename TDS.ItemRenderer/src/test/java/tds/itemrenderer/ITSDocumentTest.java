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
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.ContextConfiguration;

import java.net.URL;

import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.ITSDocumentXMLFactory;
import tds.itemrenderer.data.ITSDocumentXml;
import tds.itemrenderer.data.ITSTypes.ITSEntityType;
import tds.itemrenderer.data.IrisITSDocument;
import tds.itemrenderer.processing.ItemDataService;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNull;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;

@ContextConfiguration(locations = "/item-renderer-test-context.xml")
public class ITSDocumentTest extends AbstractTest {
  private ItemDataService itemReader;

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  @Before
  public void setUp() {
    itemReader = mock(ItemDataService.class);
    OBJECT_MAPPER.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
    OBJECT_MAPPER.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
  }

  @Test
  public void testLoadUri() {
    final String itemPath = "/items/item-187-1126.xml";
    final URL url = getClass().getResource(itemPath);
    final IITSDocument itsDocument = ITSDocumentFactory.loadUri2(url.getFile(), null, false);

    assertTrue(itsDocument.getBaseUri().contains(itemPath));
    assertTrue(itsDocument.getIsLoaded());
    assertEquals(ITSEntityType.Item, itsDocument.getType());
    assertEquals(187, itsDocument.getBankKey());
    assertEquals(1126, itsDocument.getItemKey());
    assertEquals(0, itsDocument.getStimulusKey());
    assertEquals("8", itsDocument.getLayout());
    assertEquals("MC", itsDocument.getFormat());
    assertEquals("Vertical", itsDocument.getResponseType());
    assertEquals("MATH", itsDocument.getSubject());
    assertEquals("3", itsDocument.getGrade());
    assertEquals("B", itsDocument.getAnswerKey());
    assertEquals("", itsDocument.getCredit());
    assertEquals("", itsDocument.getCopyright());
    assertEquals(false, itsDocument.isAutoEmboss());
    assertNull(itsDocument.getSoundCue());
    assertTrue(itsDocument.getResources().isEmpty());
    assertNull(itsDocument.getRendererSpec());
    assertNull(itsDocument.getMachineRubric());
    assertNull(itsDocument.getGridAnswerSpace());
    assertEquals("<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>", itsDocument.getContent("ENU").getStem());
    assertTrue(itsDocument.getMediaFiles().isEmpty());
    assertEquals("I-187-1126", itsDocument.getID());
    assertEquals("I--187-1126", itsDocument.getGroupID());
    assertEquals("items", itsDocument.getFolderName());
    assertEquals("test-classes", itsDocument.getParentFolderName());
    assertEquals(0, itsDocument.getMaxScore());
  }

  @Test
  public void shouldLoadITSDocumentXMLFromUri() {
    final String itemPath = "/items/item-187-1126.xml";
    final URL url = getClass().getResource(itemPath);
    final ITSDocumentXml itsDocument = ITSDocumentXMLFactory.loadITSDocumentXml(url.getFile(), null, false);

    assertTrue(itsDocument.getBaseUri().contains(itemPath));
    assertTrue(itsDocument.getIsLoaded());
    assertEquals(ITSEntityType.Item, itsDocument.getType());
    assertEquals("Item bank", 187, itsDocument.getBankKey());
    assertEquals("Item key", 0, itsDocument.getItemKey());
    assertEquals("Id", 1126, itsDocument.getId());
    assertEquals(0, itsDocument.getStimulusKey());
    assertNull("Layout", itsDocument.getLayout());
    assertEquals("mc", itsDocument.getFormat());
    assertNull("Response Type", itsDocument.getResponseType());
    assertNull("Subject", itsDocument.getSubject());
    assertNull("Grade", itsDocument.getGrade());
    assertNull("Answer Key", itsDocument.getAnswerKey());
    assertNull("", itsDocument.getCredit());
    assertNull("", itsDocument.getCopyright());
    assertEquals(false, itsDocument.isAutoEmboss());
    assertNull(itsDocument.getSoundCue());
    assertTrue(itsDocument.getResources().isEmpty());
    assertNull(itsDocument.getRendererSpec());
    assertNull(itsDocument.getMachineRubric());
    assertNull(itsDocument.getGridAnswerSpace());
    assertEquals("<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>", itsDocument.getContent("ENU").getStem());
    assertTrue(itsDocument.getMediaFiles().isEmpty());
    assertEquals("I-187-0", itsDocument.getID());
    assertEquals("I--187-0", itsDocument.getGroupID());
    assertEquals("items", itsDocument.getFolderName());
    assertEquals("test-classes", itsDocument.getParentFolderName());
    assertEquals(0, itsDocument.getMaxScore());
    assertEquals(3, itsDocument.getApprovedVersion());
    assertEquals(1126, itsDocument.getId());
    assertTrue(itsDocument.getValidated());
    assertEquals(2.0, itsDocument.getVersion(), 0.0001);
  }

  @Test
  public void shouldLoadIrisITSDocumentXMLFromUri() {
    final String itemPath = "/items/item-187-1126.xml";
    final URL url = getClass().getResource(itemPath);
    final String xmlFile = url.getFile();
    final IITSDocument itsDocument = ITSDocumentFactory.loadUri2(xmlFile, null, false);
    final IrisITSDocument irisDocument = new IrisITSDocument(itsDocument, xmlFile);

    assertEquals(irisDocument.getItemKey(), itsDocument.getItemKey());
    assertEquals(irisDocument.getBankKey(), itsDocument.getBankKey());
    assertEquals(irisDocument.getBaseUri(), itsDocument.getBaseUri());
    assertEquals(irisDocument.getFormat(), itsDocument.getFormat());
    assertEquals(irisDocument.getType(), itsDocument.getType());
    assertEquals(irisDocument.getStimulusKey(), itsDocument.getStimulusKey());
    assertEquals(xmlFile, irisDocument.getRealPath());
  }
}

