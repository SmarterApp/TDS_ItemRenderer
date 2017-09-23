/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import java.util.ArrayList;
import java.util.List;

import tds.itemrenderer.data.ITSAttachment;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.ITSDocument;

/**
 * @author jmambo
 *
 */
public class ITSDocumentFixture
{
  
  public static IITSDocument getITSDocument() {
    final IITSDocument itsDocument = new ITSDocument();
    final ITSContent itsContent = new  ITSContent ();
    final String stem = "<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>";
    itsContent.setStem (stem);
    itsContent.setLanguage("ENU");
    itsDocument.setGridAnswerSpace("<Question id=\"540\" ITSVer=\"10\" ScoreEngineVer=\"1\" version=\"2.0\"><Description></Description><QuestionPart id=\"1\"><Options><ShowButtons></ShowButtons><GridColor>None</GridColor><GridSpacing>10,N</GridSpacing><CenterImage>true</CenterImage><ScaleImage>false</ScaleImage></Options><Text></Text><ObjectMenuIcons><IconSpec><FileSpec>item_540_v22_1_png16malpha.png</FileSpec><Label>1</Label></IconSpec><IconSpec><FileSpec>item_540_v22_2_png16malpha.png</FileSpec><Label>2</Label></IconSpec><IconSpec><FileSpec>item_540_v22_3_png16malpha.png</FileSpec><Label>3</Label></IconSpec><IconSpec><FileSpec>item_540_v22_4_png16malpha.png</FileSpec><Label>4</Label></IconSpec></ObjectMenuIcons><ImageSpec><FileSpec>item_540_v22_Background_png16malpha.png</FileSpec><Position>0,0</Position></ImageSpec></QuestionPart></Question>");
    itsDocument.addContent(itsContent);
    return itsDocument;
  }

  public static IITSDocument getITSDocumentWithLinks() {
    final IITSDocument document = new ITSDocument();
    document.setBaseUri("/usr/local/tomcat/resources/tds/bank/stimuli/stim-187-3716/stim-187-3716.xml");
    final ITSContent content = new ITSContent();
    final String stem = "<p style=\"font-weight:bold; \">Water in <span id=\"passage_3716_TAG_1_BEGIN\">Space</span></p><p style=\"\">&#xA0;</p><p style=\"\">Listen to the presentation. Then answer the questions.</p><p style=\"\">&#xA0;</p><p style=\"\"><a href=\"passage_3716_v7_3716_audio.ogg\" type=\"audio/ogg\" class=\"sound_explicit\" autoplay=\"False\" visible=\"True\"></a></p><p style=\"\">&#xA0;</p><p style=\"\">“Water in <span id=\"passage_3716_TAG_3_BEGIN\">Space”</span> by NASA, from <span id=\"passage_3716_TAG_2_BEGIN\">http://www.nasa.gov/mov/178680main_028_ksnn_3-5_water_cap.mov</span><span id=\"passage_3716_TAG_4_BEGIN\">.</span> In the public domain.</p>";
    content.setStem(stem);
    content.setLanguage("ENU");

    final ITSAttachment attachment = new ITSAttachment();
    attachment.setType("ASL");
    attachment.setSubType("STEM");
    attachment.setFile("/usr/local/tomcat/resources/tds/bank/stimuli/stim-187-3716/passage_3716_ASL_STEM.MP4");
    final List<ITSAttachment> attachements = new ArrayList<>();
    attachements.add(attachment);
    content.setAttachments(attachements);
    document.addContent(content);
    return document;
  }
}
