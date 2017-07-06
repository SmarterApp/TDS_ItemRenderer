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
    final ITSDocument itsDocument = ITSDocumentFactory.loadUri2(url.getFile(), null, false);
    assertEquals("I-187-1126", itsDocument.getItemGroupID());
    assertEquals("MC", itsDocument.getFormat());
    assertEquals("8", itsDocument.getLayout());
    assertEquals("<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>", itsDocument.getContent("ENU").getStem());
  }

  @Test
  public void itShouldLoadDocumentWithReader() throws URISyntaxException, IOException {
    final URI uri = getClass().getResource("/items/item-187-1126.xml").toURI();
    final ITSDocument iitsDocument;
    try (final InputStream is = new FileInputStream(new File(uri))) {
      when(itemReader.readData(uri)).thenReturn(IOUtils.toString(is));
      iitsDocument = ITSDocumentFactory.load(uri, null, itemReader, false);
    }

    assertEquals("I-187-1126", iitsDocument.getItemGroupID());
    assertEquals("MC", iitsDocument.getFormat());
    assertEquals("8", iitsDocument.getLayout());
    assertEquals("<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>", iitsDocument.getContent("ENU").getStem());
  }

  @Test
  public void documentShouldSerialize() throws Exception {
    final URL url = getClass().getResource("/items/item-187-1126.xml");
    final ITSDocument itsDocument = ITSDocumentFactory.loadUri2(url.getFile(), null, false);
    final String json = OBJECT_MAPPER.writeValueAsString(itsDocument);
    assertTrue(json.contains("item-187-1126"));
  }

  @Test
  public void documentShouldDeserialize() throws Exception {
    final URL url = getClass().getResource("/items/item-187-1126.xml");
    final ITSDocument expected = ITSDocumentFactory.loadUri2(url.getFile(), null, false);
//    final String json = "{\"@class\":\"tds.itemrenderer.data.ITSDocument\",\"_baseUri\":\"/TDS_ItemRenderer/TDS.ItemRenderer/target/test-classes/items/item-187-1126.xml\",\"_rendererSpec\":null,\"_layout\":null,\"_format\":\"mc\",\"_responseType\":null,\"_subject\":null,\"_grade\":null,\"_answerKey\":null,\"_credit\":null,\"_copyright\":null,\"_gridAnswerSpace\":null,\"_type\":\"Item\",\"_soundCue\":null,\"_tutorial\":{\"@class\":\"tds.itemrenderer.data.ITSTutorial\",\"_id\":1072,\"_bankKey\":187,\"id\":1072,\"bankKey\":187},\"_resources\":[\"java.util.ArrayList\",[]],\"_machineRubric\":null,\"_bankKey\":187,\"_itemKey\":0,\"_stimulusKey\":0,\"_isLoaded\":true,\"_autoEmboss\":false,\"_version\":2.0,\"_validated\":true,\"_approvedVersion\":3,\"_id\":1126,\"_attributes\":{\"@class\":\"AIR.Common.Helpers.CaseInsensitiveMap\",\"itm_item_id\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: ITS ID\",\"value\":\"1126\",\"id\":\"itm_item_id\",\"description\":\"\"}]],\"itm_att_item format\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Item Format\",\"value\":\"MC\",\"id\":\"itm_att_Item Format\",\"description\":\"MC4 [1]\"}]],\"itm_att_page layout\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Page Layout\",\"value\":\"8\",\"id\":\"itm_att_Page Layout\",\"description\":\"\"}]],\"itm_item_desc\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Item Description\",\"value\":\"Cloned for Special Forms from 44343 - SB OP\",\"id\":\"itm_item_desc\",\"description\":\"\"}]],\"itm_opuse\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Operational Use\",\"value\":\"\",\"id\":\"itm_OPUse\",\"description\":\"\"}]],\"itm_att_response type\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Response Type\",\"value\":\"Vertical\",\"id\":\"itm_att_Response Type\",\"description\":\"\"}]],\"itm_att_grade\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Grade\",\"value\":\"3\",\"id\":\"itm_att_Grade\",\"description\":\"3\"}]],\"itm_att_item point\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Item Point\",\"value\":\"1 pt.\",\"id\":\"itm_att_Item Point\",\"description\":\"1 Point\"}]],\"itm_att_answer key\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Answer Key\",\"value\":\"B\",\"id\":\"itm_att_Answer Key\",\"description\":\"\"}]],\"itm_ftuse\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Fieldtest Use\",\"value\":\"PracTest::MG3::S1::SP13::BRAILLE (14); Math Training 3-5::SP 14::Braille (3);\",\"id\":\"itm_FTUse\",\"description\":\"\"}]],\"itm_item_subject\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttribute\",\"name\":\"Item: Subject\",\"value\":\"MATH\",\"id\":\"itm_item_subject\",\"description\":\"\"}]]},\"_contents\":{\"@class\":\"AIR.Common.Helpers.CaseInsensitiveMap\",\"enu\":{\"@class\":\"tds.itemrenderer.data.ITSContent\",\"language\":\"ENU\",\"illustrationTTS\":null,\"stemTTS\":null,\"options\":[\"tds.itemrenderer.data.ITSOptionList\",[{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"A\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics1\\\" src=\\\"item_1126_v3_graphics1_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics1\\\" src=\\\"item_1126_v3_graphics1_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"A\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null},{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"B\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics2\\\" src=\\\"item_1126_v3_graphics2_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics2\\\" src=\\\"item_1126_v3_graphics2_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"B\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null},{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"C\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics3\\\" src=\\\"item_1126_v3_graphics3_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics3\\\" src=\\\"item_1126_v3_graphics3_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"C\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null},{\"@class\":\"tds.itemrenderer.data.ITSOption\",\"_key\":\"D\",\"_value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics4\\\" src=\\\"item_1126_v3_graphics4_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"_sound\":null,\"_feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"_tts\":null,\"value\":\"<p style=\\\"\\\"><img id=\\\"item_1126_graphics4\\\" src=\\\"item_1126_v3_graphics4_png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\"key\":\"D\",\"tts\":null,\"feedback\":\"<p style=\\\"\\\">&#xA0;</p>\",\"sound\":null}]],\"stem\":\"<p style=\\\"font-weight:normal; \\\">Which shows the fractions in the correct location on the number line?</p>\",\"qti\":null,\"title\":null,\"keyboard\":null,\"apip\":null,\"attachments\":[\"java.util.ArrayList\",[{\"@class\":\"tds.itemrenderer.data.ITSAttachment\",\"id\":\"braillefile2\",\"type\":\"PRN\",\"target\":null,\"file\":\"/Users/miketrupkin/tds-project/legacy/TDS_ItemRenderer/TDS.ItemRenderer/target/test-classes/items/item_1126_enu_nemeth.prn\",\"subType\":\"nemeth\",\"url\":null}]],\"genericElements\":[\"java.util.ArrayList\",[]],\"machineRubric\":null,\"gridAnswerSpace\":null,\"illustration\":null}},\"_mediaFiles\":[\"java.util.ArrayList\",[]],\"autoEmboss\":false}";
    final String json = "{\n" +
        "  \"@class\": \"tds.itemrenderer.data.ITSDocument\",\n" +
        "  \"baseUri\": \"/TDSItemRenderer/TDS.ItemRenderer/target/test-classes/items/item-187-1126.xml\",\n" +
        "  \"rendererSpec\": null,\n" +
        "  \"layout\": null,\n" +
        "  \"format\": \"mc\",\n" +
        "  \"responseType\": null,\n" +
        "  \"subject\": null,\n" +
        "  \"grade\": null,\n" +
        "  \"answerKey\": null,\n" +
        "  \"credit\": null,\n" +
        "  \"copyright\": null,\n" +
        "  \"gridAnswerSpace\": null,\n" +
        "  \"type\": \"Item\",\n" +
        "  \"soundCue\": null,\n" +
        "  \"tutorial\": {\n" +
        "    \"@class\": \"tds.itemrenderer.data.ITSTutorial\",\n" +
        "    \"id\": 1072,\n" +
        "    \"bankKey\": 187,\n" +
        "    \"id\": 1072,\n" +
        "    \"bankKey\": 187\n" +
        "  },\n" +
        "  \"resources\": [\n" +
        "    \"java.util.ArrayList\",\n" +
        "    []\n" +
        "  ],\n" +
        "  \"machineRubric\": null,\n" +
        "  \"bankKey\": 187,\n" +
        "  \"itemKey\": 0,\n" +
        "  \"stimulusKey\": 0,\n" +
        "  \"isLoaded\": true,\n" +
        "  \"autoEmboss\": false,\n" +
        "  \"version\": 2,\n" +
        "  \"validated\": true,\n" +
        "  \"approvedVersion\": 3,\n" +
        "  \"id\": 1126,\n" +
        "  \"attributes\": {\n" +
        "    \"@class\": \"AIR.Common.Helpers.CaseInsensitiveMap\",\n" +
        "    \"itmitemid\": [\n" +
        "      \"java.util.ArrayList\",\n" +
        "      [\n" +
        "        {\n" +
        "          \"@class\": \"tds.itemrenderer.data.ITSAttribute\",\n" +
        "          \"name\": \"Item: ITS ID\",\n" +
        "          \"value\": \"1126\",\n" +
        "          \"id\": \"itmitemid\",\n" +
        "          \"description\": \"\"\n" +
        "        }\n" +
        "      ]\n" +
        "    ],\n" +
        "    \"itmattitem format\": [\n" +
        "      \"java.util.ArrayList\",\n" +
        "      [\n" +
        "        {\n" +
        "          \"@class\": \"tds.itemrenderer.data.ITSAttribute\",\n" +
        "          \"name\": \"Item: Item Format\",\n" +
        "          \"value\": \"MC\",\n" +
        "          \"id\": \"itmattItem Format\",\n" +
        "          \"description\": \"MC4 [1]\"\n" +
        "        }\n" +
        "      ]\n" +
        "    ],\n" +
        "    \"itmattpage layout\": [\n" +
        "      \"java.util.ArrayList\",\n" +
        "      [\n" +
        "        {\n" +
        "          \"@class\": \"tds.itemrenderer.data.ITSAttribute\",\n" +
        "          \"name\": \"Item: Page Layout\",\n" +
        "          \"value\": \"8\",\n" +
        "          \"id\": \"itmattPage Layout\",\n" +
        "          \"description\": \"\"\n" +
        "        }\n" +
        "      ]\n" +
        "    ],\n" +
        "    \"itmitemdesc\": [\n" +
        "      \"java.util.ArrayList\",\n" +
        "      [\n" +
        "        {\n" +
        "          \"@class\": \"tds.itemrenderer.data.ITSAttribute\",\n" +
        "          \"name\": \"Item: Item Description\",\n" +
        "          \"value\": \"Cloned for Special Forms from 44343 - SB OP\",\n" +
        "          \"id\": \"itmitemdesc\",\n" +
        "          \"description\": \"\"\n" +
        "        }\n" +
        "      ]\n" +
        "    ],\n" +
        "    \"itmopuse\": [\n" +
        "      \"java.util.ArrayList\",\n" +
        "      [\n" +
        "        {\n" +
        "          \"@class\": \"tds.itemrenderer.data.ITSAttribute\",\n" +
        "          \"name\": \"Operational Use\",\n" +
        "          \"value\": \"\",\n" +
        "          \"id\": \"itmOPUse\",\n" +
        "          \"description\": \"\"\n" +
        "        }\n" +
        "      ]\n" +
        "    ],\n" +
        "    \"itmattresponse type\": [\n" +
        "      \"java.util.ArrayList\",\n" +
        "      [\n" +
        "        {\n" +
        "          \"@class\": \"tds.itemrenderer.data.ITSAttribute\",\n" +
        "          \"name\": \"Item: Response Type\",\n" +
        "          \"value\": \"Vertical\",\n" +
        "          \"id\": \"itmattResponse Type\",\n" +
        "          \"description\": \"\"\n" +
        "        }\n" +
        "      ]\n" +
        "    ],\n" +
        "    \"itmattgrade\": [\n" +
        "      \"java.util.ArrayList\",\n" +
        "      [\n" +
        "        {\n" +
        "          \"@class\": \"tds.itemrenderer.data.ITSAttribute\",\n" +
        "          \"name\": \"Item: Grade\",\n" +
        "          \"value\": \"3\",\n" +
        "          \"id\": \"itmattGrade\",\n" +
        "          \"description\": \"3\"\n" +
        "        }\n" +
        "      ]\n" +
        "    ],\n" +
        "    \"itmattitem point\": [\n" +
        "      \"java.util.ArrayList\",\n" +
        "      [\n" +
        "        {\n" +
        "          \"@class\": \"tds.itemrenderer.data.ITSAttribute\",\n" +
        "          \"name\": \"Item: Item Point\",\n" +
        "          \"value\": \"1 pt.\",\n" +
        "          \"id\": \"itmattItem Point\",\n" +
        "          \"description\": \"1 Point\"\n" +
        "        }\n" +
        "      ]\n" +
        "    ],\n" +
        "    \"itmattanswer key\": [\n" +
        "      \"java.util.ArrayList\",\n" +
        "      [\n" +
        "        {\n" +
        "          \"@class\": \"tds.itemrenderer.data.ITSAttribute\",\n" +
        "          \"name\": \"Item: Answer Key\",\n" +
        "          \"value\": \"B\",\n" +
        "          \"id\": \"itmattAnswer Key\",\n" +
        "          \"description\": \"\"\n" +
        "        }\n" +
        "      ]\n" +
        "    ],\n" +
        "    \"itmftuse\": [\n" +
        "      \"java.util.ArrayList\",\n" +
        "      [\n" +
        "        {\n" +
        "          \"@class\": \"tds.itemrenderer.data.ITSAttribute\",\n" +
        "          \"name\": \"Fieldtest Use\",\n" +
        "          \"value\": \"PracTest::MG3::S1::SP13::BRAILLE (14); Math Training 3-5::SP 14::Braille (3);\",\n" +
        "          \"id\": \"itmFTUse\",\n" +
        "          \"description\": \"\"\n" +
        "        }\n" +
        "      ]\n" +
        "    ],\n" +
        "    \"itmitemsubject\": [\n" +
        "      \"java.util.ArrayList\",\n" +
        "      [\n" +
        "        {\n" +
        "          \"@class\": \"tds.itemrenderer.data.ITSAttribute\",\n" +
        "          \"name\": \"Item: Subject\",\n" +
        "          \"value\": \"MATH\",\n" +
        "          \"id\": \"itmitemsubject\",\n" +
        "          \"description\": \"\"\n" +
        "        }\n" +
        "      ]\n" +
        "    ]\n" +
        "  },\n" +
        "  \"contents\": {\n" +
        "    \"@class\": \"AIR.Common.Helpers.CaseInsensitiveMap\",\n" +
        "    \"enu\": {\n" +
        "      \"@class\": \"tds.itemrenderer.data.ITSContent\",\n" +
        "      \"language\": \"ENU\",\n" +
        "      \"illustrationTTS\": null,\n" +
        "      \"stemTTS\": null,\n" +
        "      \"options\": [\n" +
        "        \"tds.itemrenderer.data.ITSOptionList\",\n" +
        "        [\n" +
        "          {\n" +
        "            \"@class\": \"tds.itemrenderer.data.ITSOption\",\n" +
        "            \"key\": \"A\",\n" +
        "            \"value\": \"<p style=\\\"\\\"><img id=\\\"item1126graphics1\\\" src=\\\"item1126v3graphics1png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\n" +
        "            \"sound\": null,\n" +
        "            \"feedback\": \"<p style=\\\"\\\">&#xA0;</p>\",\n" +
        "            \"tts\": null,\n" +
        "            \"value\": \"<p style=\\\"\\\"><img id=\\\"item1126graphics1\\\" src=\\\"item1126v3graphics1png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\n" +
        "            \"key\": \"A\",\n" +
        "            \"tts\": null,\n" +
        "            \"feedback\": \"<p style=\\\"\\\">&#xA0;</p>\",\n" +
        "            \"sound\": null\n" +
        "          },\n" +
        "          {\n" +
        "            \"@class\": \"tds.itemrenderer.data.ITSOption\",\n" +
        "            \"key\": \"B\",\n" +
        "            \"value\": \"<p style=\\\"\\\"><img id=\\\"item1126graphics2\\\" src=\\\"item1126v3graphics2png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\n" +
        "            \"sound\": null,\n" +
        "            \"feedback\": \"<p style=\\\"\\\">&#xA0;</p>\",\n" +
        "            \"tts\": null,\n" +
        "            \"value\": \"<p style=\\\"\\\"><img id=\\\"item1126graphics2\\\" src=\\\"item1126v3graphics2png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\n" +
        "            \"key\": \"B\",\n" +
        "            \"tts\": null,\n" +
        "            \"feedback\": \"<p style=\\\"\\\">&#xA0;</p>\",\n" +
        "            \"sound\": null\n" +
        "          },\n" +
        "          {\n" +
        "            \"@class\": \"tds.itemrenderer.data.ITSOption\",\n" +
        "            \"key\": \"C\",\n" +
        "            \"value\": \"<p style=\\\"\\\"><img id=\\\"item1126graphics3\\\" src=\\\"item1126v3graphics3png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\n" +
        "            \"sound\": null,\n" +
        "            \"feedback\": \"<p style=\\\"\\\">&#xA0;</p>\",\n" +
        "            \"tts\": null,\n" +
        "            \"value\": \"<p style=\\\"\\\"><img id=\\\"item1126graphics3\\\" src=\\\"item1126v3graphics3png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\n" +
        "            \"key\": \"C\",\n" +
        "            \"tts\": null,\n" +
        "            \"feedback\": \"<p style=\\\"\\\">&#xA0;</p>\",\n" +
        "            \"sound\": null\n" +
        "          },\n" +
        "          {\n" +
        "            \"@class\": \"tds.itemrenderer.data.ITSOption\",\n" +
        "            \"key\": \"D\",\n" +
        "            \"value\": \"<p style=\\\"\\\"><img id=\\\"item1126graphics4\\\" src=\\\"item1126v3graphics4png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\n" +
        "            \"sound\": null,\n" +
        "            \"feedback\": \"<p style=\\\"\\\">&#xA0;</p>\",\n" +
        "            \"tts\": null,\n" +
        "            \"value\": \"<p style=\\\"\\\"><img id=\\\"item1126graphics4\\\" src=\\\"item1126v3graphics4png256.png\\\" width=\\\"484\\\" height=\\\"89\\\" style=\\\"vertical-align:baseline;\\\" /></p>\",\n" +
        "            \"key\": \"D\",\n" +
        "            \"tts\": null,\n" +
        "            \"feedback\": \"<p style=\\\"\\\">&#xA0;</p>\",\n" +
        "            \"sound\": null\n" +
        "          }\n" +
        "        ]\n" +
        "      ],\n" +
        "      \"stem\": \"<p style=\\\"font-weight:normal; \\\">Which shows the fractions in the correct location on the number line?</p>\",\n" +
        "      \"qti\": null,\n" +
        "      \"title\": null,\n" +
        "      \"keyboard\": null,\n" +
        "      \"apip\": null,\n" +
        "      \"attachments\": [\n" +
        "        \"java.util.ArrayList\",\n" +
        "        [\n" +
        "          {\n" +
        "            \"@class\": \"tds.itemrenderer.data.ITSAttachment\",\n" +
        "            \"id\": \"braillefile2\",\n" +
        "            \"type\": \"PRN\",\n" +
        "            \"target\": null,\n" +
        "            \"file\": \"/Users/miketrupkin/tds-project/legacy/TDSItemRenderer/TDS.ItemRenderer/target/test-classes/items/item1126enunemeth.prn\",\n" +
        "            \"subType\": \"nemeth\",\n" +
        "            \"url\": null\n" +
        "          }\n" +
        "        ]\n" +
        "      ],\n" +
        "      \"genericElements\": [\n" +
        "        \"java.util.ArrayList\",\n" +
        "        []\n" +
        "      ],\n" +
        "      \"machineRubric\": null,\n" +
        "      \"gridAnswerSpace\": null,\n" +
        "      \"illustration\": null\n" +
        "    }\n" +
        "  },\n" +
        "  \"mediaFiles\": [\n" +
        "    \"java.util.ArrayList\",\n" +
        "    []\n" +
        "  ],\n" +
        "  \"autoEmboss\": false\n" +
        "}";
    final ITSDocument actual = OBJECT_MAPPER.readValue(json, ITSDocument.class);

    assertEquals(expected.getItemGroupID(), actual.getItemGroupID());
    assertEquals(expected.getFormat(), actual.getFormat());
    assertEquals(expected.getLayout(), actual.getLayout());
    assertEquals(expected.getContent("ENU").getStem(), actual.getContent("ENU").getStem());
  }

  @Test
  public void documentShouldRoundTripSerialize() throws Exception {
    final URL url = getClass().getResource("/items/item-187-1126.xml");
    final ITSDocument actual = ITSDocumentFactory.loadUri2(url.getFile(), null, false);
    final String json = OBJECT_MAPPER.writeValueAsString(actual);
    final ITSDocument expected = OBJECT_MAPPER.readValue(json, ITSDocument.class);

    assertEquals(expected.getItemGroupID(), actual.getItemGroupID());
    assertEquals(expected.getFormat(), actual.getFormat());
    assertEquals(expected.getLayout(), actual.getLayout());
    assertEquals(expected.getContent("ENU").getStem(), actual.getContent("ENU").getStem());
  }
}
