package tds.itemrenderer.service.impl;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.runners.MockitoJUnitRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

import tds.itemrenderer.configuration.ItemDocumentSettings;
import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.processing.ItemDataReader;

import static org.junit.Assert.assertEquals;
import static org.mockito.Matchers.isA;
import static org.mockito.Mockito.when;


@RunWith(MockitoJUnitRunner.class)
public class ITSDocumentServiceTest {
  @Mock
  private ItemDataReader mockReader;

  private Resource resource;
  private ITSDocumentService service;

  @Before
  public void setUp() {
    resource = new ClassPathResource("items/item-187-1126.xml");
    ItemDocumentSettings settings = new ItemDocumentSettings();
    settings.setEncryptionEnabled(false);
    service = new ITSDocumentService(mockReader, settings);
  }

  @Test
  public void shouldParseDocument() throws IOException, URISyntaxException {
    when(mockReader.readData(isA(URI.class))).thenReturn(resource.getInputStream());

    IITSDocument iitsDocument = service.loadItemDocument(new URI("test"), new AccLookup(), true);

    assertEquals("I-187-1126", iitsDocument.getID());
    assertEquals("MC", iitsDocument.getFormat());
    assertEquals("8", iitsDocument.getLayout());
    assertEquals("<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>", iitsDocument.getContent("ENU").getStem());
  }
}