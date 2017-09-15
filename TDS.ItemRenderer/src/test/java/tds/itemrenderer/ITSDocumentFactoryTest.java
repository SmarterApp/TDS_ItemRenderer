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
import org.apache.commons.io.IOUtils;
import org.junit.Before;
import org.junit.Test;
import org.springframework.test.context.ContextConfiguration;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.ITSDocument;
import tds.itemrenderer.processing.ItemDataService;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ContextConfiguration(locations = "/item-renderer-test-context.xml")
public class ITSDocumentFactoryTest extends AbstractTest {
  private ItemDataService itemReader;

  private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

  @Before
  public void setUp() {
    itemReader = mock(ItemDataService.class);
    OBJECT_MAPPER.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL, JsonTypeInfo.As.PROPERTY);
    OBJECT_MAPPER.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
  }

  @Test
  public void testLoadUri2() {
    final URL url = getClass().getResource("/items/item-187-1126.xml");
    final IITSDocument itsDocument = ITSDocumentFactory.loadUri2(url.getFile(), null, false);
    assertEquals("I-187-1126", itsDocument.getIDString());
    assertEquals("MC", itsDocument.getAttributeFormat());
    assertEquals("8", itsDocument.getLayout());
    assertEquals("<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>", itsDocument.getContent("ENU").getStem());
  }

  @Test
  public void itShouldLoadDocumentWithReader() throws URISyntaxException, IOException {
    final URI uri = getClass().getResource("/items/item-187-1126.xml").toURI();
    final IITSDocument iitsDocument;
    try (final InputStream is = new FileInputStream(new File(uri))) {
      when(itemReader.readData(uri)).thenReturn(IOUtils.toString(is));
      iitsDocument = ITSDocumentFactory.load(uri, null, itemReader, false);
    }

    assertEquals("I-187-1126", iitsDocument.getIDString());
    assertEquals("MC", iitsDocument.getAttributeFormat());
    assertEquals("8", iitsDocument.getLayout());
    assertEquals("<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>", iitsDocument.getContent("ENU").getStem());
  }

  @Test
  public void documentShouldSerialize() throws Exception {
    final URL url = getClass().getResource("/items/item-187-1126.xml");
    final IITSDocument itsDocument = ITSDocumentFactory.loadUri2(url.getFile(), null, false);
    final String json = OBJECT_MAPPER.writeValueAsString(itsDocument);
    assertTrue(json.contains("item-187-1126"));
  }

  @Test
  public void documentShouldDeserialize() throws Exception {
    final URL url = getClass().getResource("/items/item-187-1126.xml");
    final IITSDocument expected = ITSDocumentFactory.loadUri2(url.getFile(), null, false);
//    final String json = "{\"@class\":\"tds.itemrenderer.data.ITSDocument\",\"_baseUri\":\"/TDS_ItemRenderer/TDS.ItemRenderer/target/test-classes/items/item-187-1126.xml\",\"_rendererSpec\":null,\"_layout\":null,\"_format\":\"mc\",\"_responseType\":null,\"_subject\":null,\"_grade\":null,\"_answerKey\":null,\"_credit\":null,\"_copyright\":null,\"_gridAnswerSpace\":null,\"_type\":\"Item\",\"_soundCue\":null,\"_tutorial\":{\"@class\":\"tds.itemrenderer.data.ITSTutorial\",\"_id\":1072,\"_bankKey\":187,\"id\":1072,\"bankKey\":187},\"_resources\":[\"java.util.ArrayList\",[]],\"_machineRubric\":null,\"_bankKey\":187,\"_itemKey\":0,\"_stimulusKey\":0,\"_isLoaded\":true,\"_autoEmboss\":false,\"_version\":2.0,\"_validated\":true,\"_approvedVersion\":3,\"_id\":1126,\"_attributes\":{\"@class\":\"AIR.Common.Helpers.CaseInsensitiveMap\",\"itm_item_id\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: ITS ID\",\"value\":\"1126\",\"id\":\"itm_item_id\",\"description\":\"\"}]],\"itm_att_item format\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Item Format\",\"value\":\"MC\",\"id\":\"itm_att_Item Format\",\"description\":\"MC4 [1]\"}]],\"itm_att_page layout\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Page Layout\",\"value\":\"8\",\"id\":\"itm_att_Page Layout\",\"description\":\"\"}]],\"itm_item_desc\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Item Description\",\"value\":\"Cloned for Special Forms from 44343 - SB OP\",\"id\":\"itm_item_desc\",\"description\":\"\"}]],\"itm_opuse\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Operational Use\",\"value\":\"\",\"id\":\"itm_OPUse\",\"description\":\"\"}]],\"itm_att_response type\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Response Type\",\"value\":\"Vertical\",\"id\":\"itm_att_Response Type\",\"description\":\"\"}]],\"itm_att_grade\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Grade\",\"value\":\"3\",\"id\":\"itm_att_Grade\",\"description\":\"3\"}]],\"itm_att_item point\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Item Point\",\"value\":\"1 pt.\",\"id\":\"itm_att_Item Point\",\"description\":\"1 Point\"}]],\"itm_att_answer key\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Answer Key\",\"value\":\"B\",\"id\":\"itm_att_Answer Key\",\"description\":\"\"}]],\"itm_ftuse\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Fieldtest Use\",\"value\":\"PracTest::MG3::S1::SP13::BRAILLE (14); Math Training 3-5::SP 14::Braille (3);\",\"id\":\"itm_FTUse\",\"description\":\"\"}]],\"itm_item_subject\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Subject\",\"value\":\"MATH\",\"id\":\"itm_item_subject\",\"description\":\"\"}]]},\"_contents\":{\"@class\":\"AIR.Common.Helpers.CaseInsensitiveMap\",\"enu\":{\"@class\":\"tds.itemrenderer.data.ITSContent\",\"language\":\"ENU\",\"illustrationTTS\":null,\"stemTTS\":null,\"options\":[\"tds.itemrenderer.data.ITSOptionList\",[{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"A\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics1\\\" src=\\\"item_1126_v3_graphics1_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics1\\\" src=\\\"item_1126_v3_graphics1_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"A\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null},{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"B\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics2\\\" src=\\\"item_1126_v3_graphics2_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics2\\\" src=\\\"item_1126_v3_graphics2_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"B\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null},{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"C\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics3\\\" src=\\\"item_1126_v3_graphics3_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics3\\\" src=\\\"item_1126_v3_graphics3_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"C\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null},{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"D\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics4\\\" src=\\\"item_1126_v3_graphics4_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics4\\\" src=\\\"item_1126_v3_graphics4_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"D\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null}]],\"stem\":\"<p style=\\\"font-weight:normal; \\\">Which shows the fractions in the correct location on the number line?</p>\",\"qti\":null,\"title\":null,\"keyboard\":null,\"apip\":null,\"attachments\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttachment\",\"id\":\"braillefile2\",\"type\":\"PRN\",\"target\":null,\"file\":\"/Users/miketrupkin/tds-project/legacy/TDS_ItemRenderer/TDS.ItemRenderer/target/test-classes/items/item_1126_enu_nemeth.prn\",\"subType\":\"nemeth\",\"url\":null}]],\"genericElements\":[\"java.util.ArrayList\",[]],\"machineRubric\":null,\"gridAnswerSpace\":null,\"illustration\":null}},\"_mediaFiles\":[\"java.util.ArrayList\",[]],\"autoEmboss\":false}";
    final String json = "{\"@class\":\"tds.itemrenderer.data.ITSDocument\",\"baseUri\":\"/TDS_ItemRenderer/TDS.ItemRenderer/target/test-classes/items/item-187-1126.xml\",\"rendererSpec\":null,\"layout\":null,\"format\":\"mc\",\"responseType\":null,\"subject\":null,\"grade\":null,\"answerKey\":null,\"credit\":null,\"copyright\":null,\"gridAnswerSpace\":null,\"type\":\"Item\",\"soundCue\":null,\"tutorial\":{\"@class\":\"tds.itemrenderer.data.ITSTutorial\",\"id\":1072,\"bankKey\":187,\"id\":1072,\"bankKey\":187},\"resources\":[\"java.util.ArrayList\",[]],\"machineRubric\":null,\"bankKey\":187,\"itemKey\":0,\"stimulusKey\":0,\"isLoaded\":true,\"autoEmboss\":false,\"version\":2,\"validated\":true,\"approvedVersion\":3,\"id\":1126,\"attributes\":{\"@class\":\"AIR.Common.Helpers.CaseInsensitiveMap\",\"itm_item_id\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: ITS ID\",\"value\":\"1126\",\"id\":\"itm_item_id\",\"description\":\"\"}]],\"itm_att_item format\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Item Format\",\"value\":\"MC\",\"id\":\"itm_att_Item Format\",\"description\":\"MC4 [1]\"}]],\"itm_att_page layout\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Page Layout\",\"value\":\"8\",\"id\":\"itm_att_Page Layout\",\"description\":\"\"}]],\"itm_item_desc\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Item Description\",\"value\":\"Cloned for Special Forms from 44343 - SB OP\",\"id\":\"itm_item_desc\",\"description\":\"\"}]],\"itm_opuse\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Operational Use\",\"value\":\"\",\"id\":\"itm_OPUse\",\"description\":\"\"}]],\"itm_att_response type\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Response Type\",\"value\":\"Vertical\",\"id\":\"itm_att_Response Type\",\"description\":\"\"}]],\"itm_att_grade\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Grade\",\"value\":\"3\",\"id\":\"itm_att_Grade\",\"description\":\"3\"}]],\"itm_att_item point\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Item Point\",\"value\":\"1 pt.\",\"id\":\"itm_att_Item Point\",\"description\":\"1 Point\"}]],\"itm_att_answer key\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Answer Key\",\"value\":\"B\",\"id\":\"itm_att_Answer Key\",\"description\":\"\"}]],\"itm_ftuse\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Fieldtest Use\",\"value\":\"PracTest::MG3::S1::SP13::BRAILLE (14); Math Training 3-5::SP 14::Braille (3);\",\"id\":\"itm_FTUse\",\"description\":\"\"}]],\"itm_item_subject\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Subject\",\"value\":\"MATH\",\"id\":\"itm_item_subject\",\"description\":\"\"}]]},\"contents\":{\"@class\":\"AIR.Common.Helpers.CaseInsensitiveMap\",\"enu\":{\"@class\":\"tds.itemrenderer.data.ITSContent\",\"language\":\"ENU\",\"illustrationTTS\":null,\"stemTTS\":null,\"options\":[\"tds.itemrenderer.data.ITSOptionList\",[{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"A\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics1\\\" src=\\\"item_1126_v3_graphics1_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics1\\\" src=\\\"item_1126_v3_graphics1_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"A\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null},{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"B\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics2\\\" src=\\\"item_1126_v3_graphics2_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics2\\\" src=\\\"item_1126_v3_graphics2_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"B\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null},{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"C\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics3\\\" src=\\\"item_1126_v3_graphics3_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics3\\\" src=\\\"item_1126_v3_graphics3_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"C\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null},{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"D\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics4\\\" src=\\\"item_1126_v3_graphics4_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics4\\\" src=\\\"item_1126_v3_graphics4_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"D\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null}]],\"stem\":\"<p style=\\\"font-weight:normal; \\\">Which shows the fractions in the correct location on the number line?</p>\",\"qti\":null,\"title\":null,\"keyboard\":null,\"apip\":null,\"attachments\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttachment\",\"id\":\"braillefile2\",\"type\":\"PRN\",\"target\":null,\"file\":\"/Users/miketrupkin/tds-project/legacy/TDS_ItemRenderer/TDS.ItemRenderer/target/test-classes/items/item_1126_enu_nemeth.prn\",\"subType\":\"nemeth\",\"url\":null}]],\"genericElements\":[\"java.util.ArrayList\",[]],\"machineRubric\":null,\"gridAnswerSpace\":null,\"illustration\":null}},\"mediaFiles\":[\"java.util.ArrayList\",[]],\"autoEmboss\":false}";
    final IITSDocument actual = OBJECT_MAPPER.readValue(json, ITSDocument.class);


    assertEquals(expected.getIDString(), actual.getIDString());
    assertEquals(expected.getFormat(), actual.getFormat());
    assertEquals(expected.getLayout(), actual.getLayout());
    assertEquals(expected.getContent("ENU").getStem(), actual.getContent("ENU").getStem());
  }

  @Test
  public void documentShouldRoundTripSerialize() throws Exception {
    final URL url = getClass().getResource("/items/item-187-1126.xml");
    final IITSDocument expected = ITSDocumentFactory.loadUri2(url.getFile(), null, false);
    final String json = OBJECT_MAPPER.writeValueAsString(expected);
    final IITSDocument actual = OBJECT_MAPPER.readValue(json, ITSDocument.class);

    assertEquals(expected.getIDString(), actual.getIDString());
    assertEquals(expected.getFormat(), actual.getFormat());
    assertEquals(expected.getLayout(), actual.getLayout());
    assertEquals(expected.getContent("ENU").getStem(), actual.getContent("ENU").getStem());
  }
}
