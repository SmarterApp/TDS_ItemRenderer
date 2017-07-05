/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.ITSDocument2;

/**
 * @author jmambo
 *
 */
public class ITSDocumentFixture
{
  
  public static ITSDocument2 getITSDocument() {
    ITSDocument2 itsDocument = new ITSDocument2();
    ITSContent itsContent = new  ITSContent (); 
    String stem = "<p style=\"font-weight:normal; \">Which shows the fractions in the correct location on the number line?</p>";
    itsContent.setStem (stem);
    itsContent.setLanguage ("ENU");
    itsDocument.setGridAnswerSpace ("<Question id=\"540\" ITSVer=\"10\" ScoreEngineVer=\"1\" version=\"2.0\"><Description></Description><QuestionPart id=\"1\"><Options><ShowButtons></ShowButtons><GridColor>None</GridColor><GridSpacing>10,N</GridSpacing><CenterImage>true</CenterImage><ScaleImage>false</ScaleImage></Options><Text></Text><ObjectMenuIcons><IconSpec><FileSpec>item_540_v22_1_png16malpha.png</FileSpec><Label>1</Label></IconSpec><IconSpec><FileSpec>item_540_v22_2_png16malpha.png</FileSpec><Label>2</Label></IconSpec><IconSpec><FileSpec>item_540_v22_3_png16malpha.png</FileSpec><Label>3</Label></IconSpec><IconSpec><FileSpec>item_540_v22_4_png16malpha.png</FileSpec><Label>4</Label></IconSpec></ObjectMenuIcons><ImageSpec><FileSpec>item_540_v22_Background_png16malpha.png</FileSpec><Position>0,0</Position></ImageSpec></QuestionPart></Question>");  
    itsDocument.addContent (itsContent);
    return itsDocument;
  }

}
