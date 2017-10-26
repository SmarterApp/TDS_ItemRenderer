/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.apip;

import static org.junit.Assert.*;

import java.net.URL;

import org.junit.Test;
import org.springframework.test.context.ContextConfiguration;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import AIR.test.framework.AbstractTest;
import tds.itemrenderer.ITSDocumentFactory;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.ITSTypes.ITSContentType;
import tds.itemrenderer.data.ITSTypes.ITSContextType;
import tds.itemrenderer.processing.XmlUtils;

/**
 * @author jmambo
 *
 */
@ContextConfiguration (locations = "/item-renderer-test-context.xml")
public class APIPXmlProcessorTest extends AbstractTest
{

  APIPRuleGroup _apipRuleGroup;
  ITSContent _content;
  IITSDocument _itsDocument;

  
  @Test
  public void testTemp() throws Exception {
    String itemFile = getClass().getClassLoader().getResource("items/item-187-666.xml").toURI().toASCIIString();
    String ttx = "TDS_TTX_A202";
 
    APIPCsvLoader.loadRules ();
    for (APIPRuleGroup apipRuleGroup  : APIPRuleGroups.getGroups ()) {
     if (apipRuleGroup.getCode ().equals (ttx)) {
        _apipRuleGroup = apipRuleGroup ;
        break;
      }
    }
     _itsDocument  = ITSDocumentFactory.loadUri2 (itemFile, null, false);
    String language = "ENU";
   _content = _itsDocument.getContent(language); 
   
    Document document = XmlUtils.createFragmentDocument (_content.getStem());
    APIPXmlProcessor processor =  new APIPXmlProcessor (APIPMode.TTS, _apipRuleGroup);
    Document resultDocument = processor.process (_itsDocument, ITSContentType.Html, ITSContextType.Stem, _content.getLanguage (), document );
    System.out.println(XmlUtils.getXml(resultDocument));
    //Attributes class ssml ssml_alias added to span element with id item_1689_TAG_9_BEGIN
    //<span class="TTS speakAs" id="item_1689_TAG_9_BEGIN" ssml="sub" ssml_alias=",">
    Element element = XmlUtils.getElementById (resultDocument, "item_1947_TAG_1_BEGIN");
  //  assertEquals("TTS speakAs", element.getAttribute ("class"));
  //  assertEquals("sub", element.getAttribute ("ssml"));
   // assertEquals(",", element.getAttribute ("ssml_alias"));
  }

  @Test
  public void testProcessForTtsWithA203() throws Exception {
    setup("/items/item-187-1689.xml", "TDS_TTX_A203"); //Regular
    Document document = XmlUtils.createFragmentDocument (_content.getStem());
    APIPXmlProcessor processor =  new APIPXmlProcessor (APIPMode.TTS, _apipRuleGroup);
    Document resultDocument = processor.process (_itsDocument, ITSContentType.Html, ITSContextType.Stem, _content.getLanguage (), document );
  //  System.out.println(XmlUtils.getXml(resultDocument));
    //Attributes class ssml ssml_alias added to span element with id item_1689_TAG_9_BEGIN
    //<span class="TTS speakAs" id="item_1689_TAG_9_BEGIN" ssml="sub" ssml_alias=",">
    Element element = XmlUtils.getElementById (resultDocument, "item_1689_TAG_9_BEGIN");
    assertEquals("TTS speakAs", element.getAttribute ("class"));
    assertEquals("sub", element.getAttribute ("ssml"));
    assertEquals(",", element.getAttribute ("ssml_alias"));
  }
    
  @Test
  public void testProcessForTtsWithA202() throws Exception {
    setup("/items/item-187-1059.xml", "TDS_TTX_A202"); //Accessibility
    Document document = XmlUtils.createFragmentDocument(_content.getStem());
    APIPXmlProcessor processor =  new APIPXmlProcessor (APIPMode.TTS, _apipRuleGroup);
    Document resultDocument = processor.process (_itsDocument, ITSContentType.Html, ITSContextType.Stem, _content.getLanguage (), document );
    NodeList elements = resultDocument.getElementsByTagName ("img");
    for (int i=0; i < elements.getLength (); i++) {
      Element element = (Element) elements.item (i);
      assertEquals("UNKNOWN", element.getAttribute ("alt"));
    }
  }
  
  @Test
  public void testProcessForBrailleWithA203() throws Exception {
    setup("/items/item-187-1689.xml", "TDS_TTX_A203");  //Regular
    Document document = XmlUtils.createFragmentDocument(_content.getStem());
    APIPXmlProcessor processor =  new APIPXmlProcessor (APIPMode.Braille, _apipRuleGroup);

    Document resultDocument = processor.process (_itsDocument, ITSContentType.Html, ITSContextType.Stem, _content.getLanguage (), document );
    Element element = XmlUtils.getElementById (resultDocument,"item_1689_TAG_9_BEGIN");
    assertEquals(",", element.getTextContent ());
  }
  
  @Test
  public void testProcessForBrailleWithA202() throws Exception {
    setup("/items/item-187-1689.xml", "TDS_TTX_A202");  //Accessibility
    Document document =  XmlUtils.createFragmentDocument(_content.getStem());
    APIPXmlProcessor processor =  new APIPXmlProcessor (APIPMode.Braille, _apipRuleGroup);

    Document resultDocument = processor.process (_itsDocument, ITSContentType.Html, ITSContextType.Stem, _content.getLanguage (), document );
    Element element =  XmlUtils.getElementById (resultDocument, "item_1689_TAG_9_BEGIN");
    assertEquals("br—", element.getTextContent ());
  }
  

  
  private void setup(String itemFile, String ttx) throws Exception {
    APIPCsvLoader.loadRules ();
    for (APIPRuleGroup apipRuleGroup  : APIPRuleGroups.getGroups ()) {
     if (apipRuleGroup.getCode ().equals (ttx)) {
        _apipRuleGroup = apipRuleGroup ;
        break;
      }
    }
    URL url = getClass ().getResource (itemFile);
    _itsDocument  = (IITSDocument) ITSDocumentFactory.loadUri2 (url.getFile (), null, false);
    String language = "ENU";
   _content = _itsDocument.getContent(language); 
  }
  
}
