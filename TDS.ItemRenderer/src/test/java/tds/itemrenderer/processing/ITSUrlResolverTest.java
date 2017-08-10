/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.runners.MockitoJUnitRunner;

import tds.itemrenderer.data.ITSDocument;

import static junit.framework.TestCase.assertEquals;

/**
 * @author jmambo
 *
 */
@RunWith(MockitoJUnitRunner.class)
public class ITSUrlResolverTest
{

  @Test
  public void testResolveResourceUrls() {
      ITSDocument itsDocument =  ITSDocumentFixture.getITSDocumentWithLinks();
      final ITSUrlResolver resolver = new ITSUrlResolver2("path/file.ext", false, "/contextPath", null) {
          @Override
          protected String audioSwapHack(String fileName) { return fileName; }
      };

      final String content = resolver.resolveResourceUrls(itsDocument.getContents().get(0).getStem());
      assertEquals(content, "<p style=\"font-weight:bold; \">Water in <span id=\"passage_3716_TAG_1_BEGIN\">Space</span></p><p style=\"\">&#xA0;</p><p style=\"\">Listen to the presentation. Then answer the questions.</p><p style=\"\">&#xA0;</p><p style=\"\"><a href=\"/contextPath/Pages/API/Resources.axd?path=path%2F&amp;file=passage_3716_v7_3716_audio.ogg\" type=\"audio/ogg\" class=\"sound_explicit\" autoplay=\"False\" visible=\"True\"></a></p><p style=\"\">&#xA0;</p><p style=\"\">“Water in <span id=\"passage_3716_TAG_3_BEGIN\">Space”</span> by NASA, from <span id=\"passage_3716_TAG_2_BEGIN\">http://www.nasa.gov/mov/178680main_028_ksnn_3-5_water_cap.mov</span><span id=\"passage_3716_TAG_4_BEGIN\">.</span> In the public domain.</p>");
  }
}
