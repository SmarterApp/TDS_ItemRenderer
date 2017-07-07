/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols.rendererservlet.testcontent;

import java.util.ArrayList;

import tds.itemrenderer.data.ITSDocument;
import tds.itemrenderer.data.ITSAttachment;
import tds.itemrenderer.data.ITSAttribute;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.ITSOption;
import tds.itemrenderer.data.ITSOptionList;
import tds.itemrenderer.data.ITSResource;
import tds.itemrenderer.data.ITSTutorial;
import tds.itemrenderer.data.ITSTypes.ITSEntityType;
import tds.itemrenderer.data.ItemRender;
import tds.itemrenderer.data.ItemRenderGroup;

public class DummyItsContentGenerator
{
  private static int ITSDocumentID = 0;

  public static ItemRenderGroup getDummyContent ()
  {
    ItemRenderGroup group = new ItemRenderGroup ("I-74-97", "HSA-Mathematics-5", "ENU");
    group.setPassage (createDummyItsPassage ());
    group.setPrinted (false);
    group.add (createItem());
    return group;
  }
  
  private static ITSDocument createDummyItsPassage () {
    ITSDocument doc = new ITSDocument();
    doc.setApprovedVersion (66);
    doc.setBankKey (176);
    doc.setBaseUri ("C:\\WorkSpace\\TDSCore\\AppsCurrent\\ItemPreview\\TDS.ItemPreview.Web\\Content\\SBAC_Stim\\Passage_4007_v5.xml");
    doc.setFormat ("");
    doc.setGridAnswerSpace (null);
    doc.setId (4007);
    doc.setIsLoaded (true);
    doc.setMachineRubric (null);
    doc.setResources (new ArrayList<ITSResource> ());
    doc.setRendererSpec (null);
    doc.setSoundCue (null);
    doc.setType (ITSEntityType.Passage);
    doc.setValidated (true);
    doc.setVersion (2.0);

    // set attributes.
    doc.addAttribute (createAttribute ("itm_item_id", "Item: ITS ID", "4007"));
    doc.addAttribute (createAttribute ("itm_item_subject", "Item: Subject", "ELA"));
    doc.addAttribute (createAttribute ("stm_pass_desc", "Stim: Description", "G9 ELA Digital Age"));

    doc.addContent (createPassage ());

    doc.setTutorial (null);

    return doc;
  }
  
  private static ITSContent createPassage () {
    ITSContent content = new ITSContent ();
    content.setApip (null);

    content.setAttachments (new ArrayList<ITSAttachment> ());
    content.getAttachments ().add (createAttachment3 ());

    content.setGridAnswerSpace (null);
    content.setIllustration (null);
    content.setIllustrationTTS (null);
    content.setKeyboard (null);
    content.setLanguage ("ENU");
    content.setMachineRubric (null);
    content.setQti (null);
    content
        .setStem ("<p style=\"text-align:center; font-weight:bold; \">Digital Age Argumentative Performance Task</p><p style=\"font-weight:bold; \">&#xA0;</p><p style=\"font-weight:bold; \">Issue:</p><p style=\"\">&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;Though the Internet has been around for as long as you have been alive, it is still a relatively young technology. Not long before you were born, it did not exist. Yet in its short history (just two decades), the Internet has had a profound effect on the daily life of many people in the world. Among its influences, the Internet is a place where many people spend much of their time, time that they used to spend doing other things. Moreover, the Internet represents a new way to read text. Before the Internet, text was delivered to readers only on paper: in books, newspapers, and magazines. </p><p style=\"\">&#xA0;</p><p style=\"\">&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;The growth of the Internet has been controversial, and one of its most debated aspects has been its effect on reading, particularly for young people who are still in the process of developing their reading skills. Some people say that the Internet has had a positive influence on young readers. Others say that it has been detrimental to the development of their reading skills.</p><p style=\"\">&#xA0;</p><p style=\"\">&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;You will conduct some research on how the Internet is affecting the reading skills and habits of young people like you. </p><p style=\"\">&#xA0;</p><p style=\"\">&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;After you have reviewed the sources, you will answer some questions about them. Briefly scan the sources and the three questions that follow. Then, go back and read the sources carefully to gain the information you will need to answer the questions and write an argumentative letter.</p><p style=\"\">&#xA0;</p><p style=\"\">&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;In Part 2, you will write an argumentative letter on a topic related to the sources.</p><p style=\"\">&#xA0;</p><p style=\"font-weight:bold; \">Directions for beginning:</p><p style=\"\">&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;You will now review and evaluate the sources that came up in your Internet search and summarize their arguments. You can re-examine any of the sources as often as you like.</p><p style=\"\">&#xA0;</p><p style=\"font-weight:bold; \">Research Questions:</p><p style=\"\">&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;After examining the research sources, use the remaining time in Part 1 to answer three questions about them. Your answers to these questions will be scored. Also, your answers will help you think about the research sources you have read and viewed, which should help you write your argumentative letter.</p><p style=\"\">&#xA0;</p><p style=\"\">&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;&#xA0;You may click on the appropriate buttons to refer to the sources when you think it would be helpful. You may also refer to your notes. Answer the questions in the spaces provided below them.</p><p style=\"\">&#xA0;</p><p style=\"font-weight:bold; \">Part 1</p><p style=\"font-weight:bold; \">&#xA0;</p><p style=\"font-weight:bold; \">Sources for Performance Task</p><p style=\"font-weight:bold; \">&#xA0;</p>\n\t  \n\t  <iframe src=\"/blackbox/resources.axd?path=QwA6AFwAVwBvAHIAawBTAHAAYQBjAGUAXABUAEQAUwBDAG8AcgBlAFwAQQBwAHAAcwBDAHUAcgByAGUAbgB0AFwASQB0AGUAbQBQAHIAZQB2AGkAZQB3AFwAVABEAFMALgBJAHQAZQBtAFAAcgBlAHYAaQBlAHcALgBXAGUAYgBcAEMAbwBuAHQAZQBuAHQAXABTAEIAQQBDAF8AUwB0AGkAbQBcAA2&amp;file=Passage_4007_PassageIndex.html\" height=\"900px\" width=\"100%\"></iframe>\n\n\t  \n\t  <p style=\"\">&#xA0;</p>");
    content.setStemTTS (null);
    content.setTitle ("Student Directions<p style=\"\">&#xA0;</p>");

    content.setOptions (new ITSOptionList());

    return content;
  }
  
  private static ITSDocument createDummyItsDocument3 () {
    ITSDocument doc = new ITSDocument();
    doc.setApprovedVersion (66);
    doc.setBankKey (176);
    doc.setBaseUri ("C:\\WorkSpace\\TDSCore\\AppsCurrent\\ItemPreview\\TDS.ItemPreview.Web\\Content\\SBAC_Stim\\Item_55601_v2.xml");
    doc.setFormat ("NL");
    doc.setGridAnswerSpace (null);
    doc.setId (55601);
    doc.setIsLoaded (true);
    doc.setMachineRubric (null);
    doc.setResources (new ArrayList<ITSResource> ());
    doc.setRendererSpec (null);
    doc.setSoundCue (null);
    doc.setType (ITSEntityType.Item);
    doc.setValidated (true);
    doc.setVersion (2.0);

    // set attributes.
    doc.addAttribute (createAttribute ("itm_item_id", "Item: ITS ID", "55601"));
    doc.addAttribute (createAttribute ("itm_item_subject", "Item: Subject", "ELA"));
    doc.addAttribute (createAttribute ("itm_item_desc", "Item: Item Description", "ELA.09.C4.T2.DigitalAge.PT.01_PartA"));
    doc.addAttribute (createAttribute ("itm_FTUse", "Fieldtest Use", ""));
    doc.addAttribute (createAttribute ("itm_OPUse", "Operational Use", ""));
    doc.addAttribute (createAttribute ("itm_att_Answer Key", "Item: Answer Key", "NL"));
    doc.addAttribute (createAttribute ("itm_att_Grade", "Item: Grade", "9"));
    doc.addAttribute (createAttribute ("itm_att_Item Format", "Item: Item Format", "NL"));
    doc.addAttribute (createAttribute ("itm_att_Page Layout", "Item: Page Layout", "21"));
    doc.addAttribute (createAttribute ("itm_att_Response Type", "Item: Response Type", "PlainText"));
    doc.addAttribute (createAttribute ("itm_att_Item Point", "Item: Item Point", "1 pt."));
    doc.addAttribute (createAttribute ("stm_pass_id", "Stim: ITS ID", "4007"));

    doc.addContent (createContent3 ());

    doc.setTutorial (createTutorial1 ());

    return doc;
  }
  
  private static ITSContent createContent3 () {
    ITSContent content = new ITSContent ();
    content.setApip (null);

    content.setAttachments (new ArrayList<ITSAttachment> ());
    content.getAttachments ().add (createAttachment3 ());

    content.setGridAnswerSpace (null);
    content.setIllustration (null);
    content.setIllustrationTTS (null);
    content.setKeyboard (null);
    content.setLanguage ("ENU");
    content.setMachineRubric (null);
    content.setQti (null);
    content
        .setStem ("<p style=\"font-style:italic; font-weight:bold; \">Part B</p><p style=\"\">What is a proven finding of the research study from the Pew Research Center, and what is only suggested by the study but not proven?</p><p style=\"\">&#xA0;</p><p style=\"\">Type your answer in the space provided.</p>");
    content.setStemTTS (null);
    content.setTitle (null);

    content.setOptions (new ITSOptionList());

    return content;
  }

  private static ITSAttachment createAttachment3 () {
    ITSAttachment attachment = new ITSAttachment ();
    attachment.setId ("file1");
    attachment.setFile ("ftp://airwspro%5Csbehera:Thummit1234!@38.118.83.22/tds2_airws_org/sandlot/TDSCore_2012-2013/Bank-74\\Items\\Item-74-97\\item_97_enu_nemeth.brf");
    attachment.setSubType ("nemeth");
    attachment.setType ("BRF");
    attachment
        .setUrl ("/student/Pages/API/Resources.axd?path=ZgB0AHAAOgAvAC8AYQBpAHIAdwBzAHAAcgBvACUANQBDAHMAYgBlAGgAZQByAGEAOgBUAGgAdQBtAG0AaQB0ADEAMgAzADQAIQBAADMAOAAuADEAMQA4AC4AOAAzAC4AMgAyAC8AdABkAHMAMgBfAGEAaQByAHcAcwBfAG8AcgBnAC8AcwBhAG4AZABsAG8AdAAvAFQARABTAEMAbwByAGUAXwAyADAAMQAyAC0AMgAwADEAMwAvAEIAYQBuAGsALQA3ADQAXABJAHQAZQBtAHMAXABJAHQAZQBtAC0ANwA0AC0AOQA3AFwA0&file=item_97_enu_nemeth.brf");
    return attachment;
  }

  // //////////////////////////////////
  private static ItemRender createItem2 () {
    ItemRender render = new ItemRender (createDummyItsDocument2 (), 1);
    render.setDisabled (false);
    render.setIsFirst (false);
    render.setIsLast (false);
    render.setLabel ("55556");
    render.setMark (false);
    render.setPosition (55556);
    render.setPositionOnPage (1);
    render.setPrintable (false);
    render.setResponse (null);
    render.setSelected (false);
    return render;
  }

  private static ITSDocument createDummyItsDocument2 () {
    ITSDocument doc = new ITSDocument();
    doc.setApprovedVersion (66);
    doc.setBankKey (176);
    doc.setBaseUri ("C:\\WorkSpace\\TDSCore\\AppsCurrent\\ItemPreview\\TDS.ItemPreview.Web\\Content\\SBAC_Stim\\Item_55556_v2.xml");
    doc.setFormat ("NL");
    doc.setGridAnswerSpace (null);
    doc.setId (55556);
    doc.setIsLoaded (true);
    doc.setMachineRubric (null);
    doc.setResources (new ArrayList<ITSResource> ());
    doc.setRendererSpec (null);
    doc.setSoundCue (null);
    doc.setType (ITSEntityType.Item);
    doc.setValidated (true);
    doc.setVersion (2.0);

    // set attributes.
    doc.addAttribute (createAttribute ("itm_item_id", "Item: ITS ID", "55556"));
    doc.addAttribute (createAttribute ("itm_item_subject", "Item: Subject", "ELA"));
    doc.addAttribute (createAttribute ("itm_item_desc", "Item: Item Description", "ELA.09.C4.T2.DigitalAge.PT.01_PartA"));
    doc.addAttribute (createAttribute ("itm_FTUse", "Fieldtest Use", ""));
    doc.addAttribute (createAttribute ("itm_OPUse", "Operational Use", ""));
    doc.addAttribute (createAttribute ("itm_att_Answer Key", "Item: Answer Key", "NL"));
    doc.addAttribute (createAttribute ("itm_att_Grade", "Item: Grade", "9"));
    doc.addAttribute (createAttribute ("itm_att_Item Format", "Item: Item Format", "NL"));
    doc.addAttribute (createAttribute ("itm_att_Page Layout", "Item: Page Layout", "21"));
    doc.addAttribute (createAttribute ("itm_att_Response Type", "Item: Response Type", "PlainText"));
    doc.addAttribute (createAttribute ("itm_att_Item Point", "Item: Item Point", "1 pt."));
    doc.addAttribute (createAttribute ("stm_pass_id", "Stim: ITS ID", "4007"));

    doc.addContent (createContent2 ());

    doc.setTutorial (createTutorial1 ());

    return doc;
  }

  private static ITSContent createContent2 () {
    ITSContent content = new ITSContent ();
    content.setApip (null);

    content.setAttachments (new ArrayList<ITSAttachment> ());
    content.getAttachments ().add (createAttachment2 ());

    content.setGridAnswerSpace (null);
    content.setIllustration (null);
    content.setIllustrationTTS (null);
    content.setKeyboard (null);
    content.setLanguage ("ENU");
    content.setMachineRubric (null);
    content.setQti (null);
    content
        .setStem ("<p style=\"font-style:italic; font-weight:bold; \">Part A</p><p style=\"\">Summarize what the sources tell you is the difference between how a person reads a printed text and how a person reads text that is on the Internet.</p><p style=\"\">&#xA0;</p><p style=\"\">Type your answer in the space provided.</p>");
    content.setStemTTS (null);
    content.setTitle (null);

    content.setOptions (new ITSOptionList());

    return content;
  }

  private static ITSAttachment createAttachment2 () {
    ITSAttachment attachment = new ITSAttachment ();
    attachment.setId ("file1");
    attachment.setFile ("ftp://airwspro%5Csbehera:Thummit1234!@38.118.83.22/tds2_airws_org/sandlot/TDSCore_2012-2013/Bank-74\\Items\\Item-74-97\\item_97_enu_nemeth.brf");
    attachment.setSubType ("nemeth");
    attachment.setType ("BRF");
    attachment
        .setUrl ("/student/Pages/API/Resources.axd?path=ZgB0AHAAOgAvAC8AYQBpAHIAdwBzAHAAcgBvACUANQBDAHMAYgBlAGgAZQByAGEAOgBUAGgAdQBtAG0AaQB0ADEAMgAzADQAIQBAADMAOAAuADEAMQA4AC4AOAAzAC4AMgAyAC8AdABkAHMAMgBfAGEAaQByAHcAcwBfAG8AcgBnAC8AcwBhAG4AZABsAG8AdAAvAFQARABTAEMAbwByAGUAXwAyADAAMQAyAC0AMgAwADEAMwAvAEIAYQBuAGsALQA3ADQAXABJAHQAZQBtAHMAXABJAHQAZQBtAC0ANwA0AC0AOQA3AFwA0&file=item_97_enu_nemeth.brf");
    return attachment;
  }

  // //////////////////////////////////

  private static ItemRender createItem1 () {
    ItemRender render = new ItemRender (createDummyItsDocument1 (), 1);
    render.setDisabled (false);
    render.setIsFirst (true);
    render.setIsLast (false);
    render.setLabel ("55553");
    render.setMark (false);
    render.setPosition (55553);
    render.setPositionOnPage (1);
    render.setPrintable (false);
    render.setResponse (null);
    render.setSelected (false);
    return render;
  }

  private static ITSDocument createDummyItsDocument1 () {
    ITSDocument doc = new ITSDocument();
    doc.setApprovedVersion (66);
    doc.setBankKey (176);
    doc.setBaseUri ("C:\\WorkSpace\\TDSCore\\AppsCurrent\\ItemPreview\\TDS.ItemPreview.Web\\Content\\SBAC_Stim\\Item_55553_v3.xml");
    doc.setFormat ("NL");
    doc.setGridAnswerSpace (null);
    doc.setId (55553);
    doc.setIsLoaded (true);
    doc.setMachineRubric (null);
    doc.setResources (new ArrayList<ITSResource> ());
    doc.setRendererSpec (null);
    doc.setSoundCue (null);
    doc.setType (ITSEntityType.Item);
    doc.setValidated (true);
    doc.setVersion (2.0);

    // set attributes.
    doc.addAttribute (createAttribute ("itm_item_id", "Item: ITS ID", "55553"));
    doc.addAttribute (createAttribute ("itm_item_subject", "Item: Subject", "ELA"));
    doc.addAttribute (createAttribute ("itm_item_desc", "Item: Item Description", "ELA.09.C4.T2.DigitalAge.PT.01_PartA"));
    doc.addAttribute (createAttribute ("itm_FTUse", "Fieldtest Use", ""));
    doc.addAttribute (createAttribute ("itm_OPUse", "Operational Use", ""));
    doc.addAttribute (createAttribute ("itm_att_Answer Key", "Item: Answer Key", "NL"));
    doc.addAttribute (createAttribute ("itm_att_Grade", "Item: Grade", "9"));
    doc.addAttribute (createAttribute ("itm_att_Item Format", "Item: Item Format", "NL"));
    doc.addAttribute (createAttribute ("itm_att_Page Layout", "Item: Page Layout", "21"));
    doc.addAttribute (createAttribute ("itm_att_Response Type", "Item: Response Type", "PlainText"));
    doc.addAttribute (createAttribute ("itm_att_Item Point", "Item: Item Point", "1 pt."));
    doc.addAttribute (createAttribute ("stm_pass_id", "Stim: ITS ID", "4007"));

    doc.addContent (createContent1 ());

    doc.setTutorial (createTutorial1 ());

    return doc;
  }

  private static ITSContent createContent1 () {
    ITSContent content = new ITSContent ();
    content.setApip (null);

    content.setAttachments (new ArrayList<ITSAttachment> ());
    content.getAttachments ().add (createAttachment1 ());

    content.setGridAnswerSpace (null);
    content.setIllustration (null);
    content.setIllustrationTTS (null);
    content.setKeyboard (null);
    content.setLanguage ("ENU");
    content.setMachineRubric (null);
    content.setQti (null);
    content
        .setStem ("<p style=\"\">Across the four sources you have reviewed, many claims are made both in support of and in opposition to the Internet’s influence on reading skills.</p><p style=\"\">&#xA0;</p><p style=\"font-style:italic; font-weight:bold; \">Part A</p><p style=\"\">Identify four sentences that express the possible benefits of Internet reading. Draw your sentences from at least two different sources.</p><p style=\"\">&#xA0;</p><p style=\"\">Type your answer in the space provided.</p>");
    content.setStemTTS (null);
    content.setTitle (null);

    content.setOptions (new ITSOptionList());

    return content;
  }

  private static ITSAttachment createAttachment1 () {
    ITSAttachment attachment = new ITSAttachment ();
    attachment.setId ("file1");
    attachment.setFile ("ftp://airwspro%5Csbehera:Thummit1234!@38.118.83.22/tds2_airws_org/sandlot/TDSCore_2012-2013/Bank-74\\Items\\Item-74-97\\item_97_enu_nemeth.brf");
    attachment.setSubType ("nemeth");
    attachment.setType ("BRF");
    attachment
        .setUrl ("/student/Pages/API/Resources.axd?path=ZgB0AHAAOgAvAC8AYQBpAHIAdwBzAHAAcgBvACUANQBDAHMAYgBlAGgAZQByAGEAOgBUAGgAdQBtAG0AaQB0ADEAMgAzADQAIQBAADMAOAAuADEAMQA4AC4AOAAzAC4AMgAyAC8AdABkAHMAMgBfAGEAaQByAHcAcwBfAG8AcgBnAC8AcwBhAG4AZABsAG8AdAAvAFQARABTAEMAbwByAGUAXwAyADAAMQAyAC0AMgAwADEAMwAvAEIAYQBuAGsALQA3ADQAXABJAHQAZQBtAHMAXABJAHQAZQBtAC0ANwA0AC0AOQA3AFwA0&file=item_97_enu_nemeth.brf");
    return attachment;
  }

  private static ITSTutorial createTutorial1 () {
    ITSTutorial tutorial = new ITSTutorial ();
    tutorial.setBankKey (176);
    tutorial.setId (55577);
    return tutorial;
  }
  
  // //////////////////////////////////
  private static ItemRender createItem3 () {
    ItemRender render = new ItemRender (createDummyItsDocument3 (), 1);
    render.setDisabled (false);
    render.setIsFirst (false);
    render.setIsLast (false);
    render.setLabel ("55601");
    render.setMark (false);
    render.setPosition (55601);
    render.setPositionOnPage (3);
    render.setPrintable (false);
    render.setResponse (null);
    render.setSelected (false);
    return render;
  }

  
  private static ItemRender createItem()
  {
    ItemRender render = new ItemRender (createDummyItsDocument (), 1);
    return render;
  }
 
  private static ITSDocument createDummyItsDocument()
  {
    ITSDocument doc = new ITSDocument();
    doc.setApprovedVersion (66);
    doc.setBankKey (74);
    doc.setBaseUri ("ftp://airwspro%5Csbehera:Thummit1234!@38.118.83.22/tds2_airws_org/sandlot/TDSCore_2012-2013/Bank-74/Items/Item-74-97/item-74-97.xml");
    doc.setFormat ("MC");
    doc.setGridAnswerSpace (null);
    doc.setId (97);
    doc.setIsLoaded (true);
    doc.setMachineRubric (null);
    doc.setResources (new ArrayList<ITSResource>());
    doc.setRendererSpec (null);
    doc.setSoundCue (null);
    doc.setTutorial (createTutorial ());
    doc.setType (ITSEntityType.Item);
    doc.setValidated (true);
    doc.setVersion (2.0);
    
    //set attributes.
    doc.addAttribute (createAttribute ("itm_item_id", "Item: ITS ID", "97"));
    doc.addAttribute (createAttribute ("itm_item_subject", "Item: Subject", "Mathematics"));
    doc.addAttribute (createAttribute ("itm_item_desc", "Item: Item Description", "Glass tank volume"));
    doc.addAttribute (createAttribute ("itm_FTUse", "Fieldtest Use", ""));
    doc.addAttribute (createAttribute ("itm_OPUse", "Operational Use", "NewTraining::G5M::FA11 (1); Training::G5MTTB::FA11 (1);"));
    doc.addAttribute (createAttribute ("itm_att_Answer Key", "Item: Answer Key", "C"));
    doc.addAttribute (createAttribute ("itm_att_Grade", "Item: Grade", "5"));
    doc.addAttribute (createAttribute ("itm_att_Item Format", "Item: Item Format", "MC"));
/*    doc.addAttribute (createAttribute ("itm_att_Page Layout", "Item: Page Layout", "8"));
    doc.addAttribute (createAttribute ("itm_att_Response Type", "Item: Response Type", "Vertical"));*/
    //following code to Test Layout_1 with Horizontal Response.
    doc.addAttribute (createAttribute ("itm_att_Page Layout", "Item: Page Layout", "1"));
    doc.addAttribute (createAttribute ("itm_att_Response Type", "Item: Response Type", "Horizontal"));
    doc.addAttribute (createAttribute ("itm_att_Item Point", "Item: Item Point", "1 pt."));
    doc.addAttribute (createAttribute ("itm_att_Strand", "Item: Strand", "Meas"));
   
    doc.addContent (createContent ());
    
    return doc;
  }

  private static ITSContent createContent()
  {
    ITSContent content = new ITSContent ();
    content.setApip (null);
    content.setGridAnswerSpace (null);
    content.setIllustration (null);
    content.setIllustrationTTS (null);
    content.setKeyboard (null);
    content.setLanguage ("ENU");
    content.setMachineRubric (null);
    content.setQti(null);
    content.setStem ("\n        <p style=\"\">Sandy measured the dimensions of a glass fish tank. The tank is 3 feet long, 2 feet wide, and 2 feet tall.</p>\n        <p style=\"\">&#xA0;</p>\n        <p style=\"\">What is the volume of the tank?</p>\n      ");
    content.setStemTTS (null);
    content.setTitle (null);
    
    content.setAttachments (new ArrayList<ITSAttachment>());
    content.getAttachments ().add(createAttachment ());
    
    content.setOptions (new ITSOptionList());
    content.getOptions().add(createOption ("A", "\n        <p style=\"\">\n          &#xA0;&#xA0;6 cubic feet &#xA0;&#xA0;&#xA0;</p>\n      "));
    content.getOptions ().add (createOption("B", "\n        <p style=\"\">\n          &#xA0;&#xA0;7 cubic feet &#xA0;&#xA0;</p>\n      "));
    content.getOptions().add(createOption("C", "\n        <p style=\"\">12 cubic feet &#xA0;&#xA0;&#xA0;</p>\n      "));
    content.getOptions().add(createOption("D", "\n        <p style=\"\">32 cubic feet &#xA0;&#xA0;</p>\n      "));
  
    return content;
  }
 
  private static ITSOption createOption(String optionKey, String optionaValue)
  {
    ITSOption option = new ITSOption (optionKey, optionaValue);
    option.setFeedback (null);
    option.setSound (null);
    option.setTts (null);
    return option;
  }
  
  private static ITSAttachment createAttachment()
  {
    ITSAttachment attachment = new ITSAttachment ();
    attachment.setId ("file1");
    attachment.setFile ("ftp://airwspro%5Csbehera:Thummit1234!@38.118.83.22/tds2_airws_org/sandlot/TDSCore_2012-2013/Bank-74\\Items\\Item-74-97\\item_97_enu_nemeth.brf");
    attachment.setSubType ("nemeth");
    attachment.setType ("BRF");
    attachment.setUrl ("/student/Pages/API/Resources.axd?path=ZgB0AHAAOgAvAC8AYQBpAHIAdwBzAHAAcgBvACUANQBDAHMAYgBlAGgAZQByAGEAOgBUAGgAdQBtAG0AaQB0ADEAMgAzADQAIQBAADMAOAAuADEAMQA4AC4AOAAzAC4AMgAyAC8AdABkAHMAMgBfAGEAaQByAHcAcwBfAG8AcgBnAC8AcwBhAG4AZABsAG8AdAAvAFQARABTAEMAbwByAGUAXwAyADAAMQAyAC0AMgAwADEAMwAvAEIAYQBuAGsALQA3ADQAXABJAHQAZQBtAHMAXABJAHQAZQBtAC0ANwA0AC0AOQA3AFwA0&file=item_97_enu_nemeth.brf");
    return attachment;
  }
  
  private static ITSTutorial createTutorial()
  {
    ITSTutorial tutorial = new ITSTutorial ();
    tutorial.setBankKey (74);
    tutorial.setId (17704);
    return tutorial;
  }
  
  private static ITSAttribute createAttribute(String id, String name, String value)
  {
    ITSAttribute attr = new ITSAttribute (id, value);
    attr.setName (name);
    return attr;
  }

}
