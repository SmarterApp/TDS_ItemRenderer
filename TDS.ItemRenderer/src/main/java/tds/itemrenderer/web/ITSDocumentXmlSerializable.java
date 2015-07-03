/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.web;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.w3c.dom.Element;

import tds.itemrenderer.configuration.RendererSettings;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.IItemRender;
import tds.itemrenderer.data.ITSAttachment;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.ITSMachineRubric;
import tds.itemrenderer.data.ITSMachineRubric.ITSMachineRubricType;
import tds.itemrenderer.data.ITSOption;
import tds.itemrenderer.data.ITSResource;
import tds.itemrenderer.data.ItemRenderGroup;
import tds.itemrenderer.processing.ITSDocumentHelper;
import tds.itemrenderer.processing.ITSUrlResolver2;
import tds.itemrenderer.webcontrols.PageLayout;
import AIR.Common.Helpers._Ref;
import AIR.Common.Utilities.Path;
import AIR.Common.Web.EncryptionHelper;
import AIR.Common.Web.MimeMapping;

/**
 * @author jmambo
 *
 */
public class ITSDocumentXmlSerializable extends XmlSerializable
{
  private final PageLayout _pageLayout;
  private final ItemRenderGroup _itemRenderGroup;
  private final String _pageID;
  private final String _segmentID;
  private final String _layout;
  private final String _language;

  //If this is true include encrypted file paths.
  public boolean _includeFilePaths;

  // If this is true then include the rubric.
  public boolean _includeRubric;

  // If this is true then include the MC options.
  public boolean _includeOptionValue;
  
  public ITSDocumentXmlSerializable(PageLayout pageLayout)
  {
      _pageLayout = pageLayout;
      _itemRenderGroup = pageLayout.getItemRenderGroup ();

      // get data
      _pageID = _itemRenderGroup.getId ();
      _segmentID = _itemRenderGroup.getSegmentID ();
      _layout = _pageLayout.getLayoutName ();
      _language = _pageLayout.getLanguage ();

      // set default settings
      setIncludeFilePaths(true);
      setIncludeRubric(false);
  }

  public void writeXml(XmlWriter writer)
  {
      setWriter(writer);
      writeDocument(); // <document>
  }

  
  public boolean isIncludeFilePaths () {
    return _includeFilePaths;
  }

  public void setIncludeFilePaths (boolean includeFilePaths) {
    this._includeFilePaths = includeFilePaths;
  }

  public boolean isIncludeRubric () {
    return _includeRubric;
  }

  public void setIncludeRubric (boolean includeRubric) {
    this._includeRubric = includeRubric;
  }

  public boolean isIncludeOptionValue () {
    return _includeOptionValue;
  }

  public void setIncludeOptionValue (boolean includeOptionValue) {
    this._includeOptionValue = includeOptionValue;
  }
  
  
  private void writeDocument()
  {
      startElement("content");
      writeAttribute("groupID", _pageID);
      writeAttribute("segmentID", _segmentID);
      writeAttribute("layout", _layout);
      writeAttribute("language", _language);

      writeSoundCue(); // <soundCue>
      writePassage(); // <passage>
      writeItems(); // <items>
      writeHtml(); // <html>

      endElement(); // </content>
  }

  private void writeHtml()
  {
      writeCData("html", _pageLayout.getRenderToString ());
  }

  private boolean writeSoundCue()
  {
      for (IItemRender itemRender : _itemRenderGroup)  {
          IITSDocument item = itemRender.getItem ();

          if (item.getSoundCue() != null)
          {
              startElement("soundCue");
              writeAttribute("bankKey", item.getSoundCue().getBankKey());
              writeAttribute("itemKey", item.getSoundCue().getId ());
              endElement();

              return true;
          }
      }

      return false;
  }

  private boolean writePassage() 
  {
      if (!_itemRenderGroup.getHasPassage ()) {
        return false;
      }

      startElement("passage"); // <passage>
      
      writeAttribute("bankKey", _itemRenderGroup.getPassage().getBankKey());
      writeAttribute("itemKey", _itemRenderGroup.getPassage().getItemKey());
      writeAttribute("printed", _itemRenderGroup.getPrinted());
      writeResources(_itemRenderGroup.getPassage()); // <resources>
      writeAttachments(_itemRenderGroup.getPassage());
      writeElements(_itemRenderGroup.getPassage()); // generic elements

      // encrypted file path
      if (_includeFilePaths)
      {
          String filePath = EncryptionHelper.EncryptToBase64(_itemRenderGroup.getPassage().getBaseUri());
          writeElement("filePath", filePath);
      }

      writeMediaResources(_itemRenderGroup.getPassage());

      endElement(); // </passage>

      return true;
  }
  
  private void writeItems()  {
      startElement("items");

      for (IItemRender itemRender : _itemRenderGroup) {
          writeItem(itemRender);
      }
      endElement();
  }

  private void writeItem(IItemRender itemRender) {
      startElement("item"); // <item>

      // get item response type
      String responseType = itemRender.getItem().getResponseType();

      if (StringUtils.isEmpty(responseType) && _layout.contains("-"))
      {
          responseType = _layout.split("-")[1].trim();
      }

      // item info
      writeAttribute("bankKey", itemRender.getItem().getBankKey());
      writeAttribute("itemKey", itemRender.getItem().getItemKey());
      writeAttribute("subject", itemRender.getItem().getSubject());
      writeAttribute("grade", itemRender.getItem().getGrade());
      writeAttribute("format", itemRender.getItem().getFormat());
      writeAttribute("marked", itemRender.getMark());
      writeAttribute("disabled", itemRender.getDisabled ());
      writeAttribute("printable", itemRender.getPrintable());
      writeAttribute("printed", itemRender.getPrinted());
      writeAttribute("responseType", responseType);

      // test info
      writeAttribute("position", itemRender.getPosition());
      writeAttribute("positionOnPage", itemRender.getPositionOnPage());

      // encrypted file path
      if (_includeFilePaths)
      {
          String filePath = EncryptionHelper.EncryptToBase64(itemRender.getItem().getBaseUri ());
          writeElement("filePath", filePath);
      }

      writeTutorial(itemRender.getItem()); // <tutorial>
      writeResources(itemRender.getItem()); // <resources>
      writeAttachments(itemRender.getItem());
      writeRendererSpec(itemRender.getItem()); // <rendererSpec>
      writeItemContent(itemRender.getItem());
      writeElements(itemRender.getItem()); // generic elements

      writeCData("response", itemRender.getResponse()); // <response>

      if (_includeRubric) {
        writeMachineRubric(itemRender.getItem ());
      }

      writeMediaResources(itemRender.getItem ());

      endElement(); // </item>
  }

  private void writeMachineRubric(IITSDocument doc)
  {
      ITSMachineRubric machineRubric = parseMachineRubric(doc, _language);
      
      if (machineRubric != null)
      {
          startElement("rubric");
          writeAttribute("type", machineRubric.getType ());
          writeCData(machineRubric.getData ());
          endElement();
      }
  }

  public static ITSMachineRubric parseMachineRubric(IITSDocument itsDocument, String language)
  {
      // check if answer key is the rubric
      if ((itsDocument.getFormat().equalsIgnoreCase("MC") || itsDocument.getFormat().equalsIgnoreCase("MS") || itsDocument.getFormat().equalsIgnoreCase("ASI")) && itsDocument.getAnswerKey() != null)
      {
          return new ITSMachineRubric(ITSMachineRubricType.Text, itsDocument.getAnswerKey() + "|" + itsDocument.getMaxScore()); 
      }

      // check for item level rubric
      if (itsDocument.getMachineRubric() != null)
      {
          return itsDocument.getMachineRubric();
      }

      // check for content level rubric
      ITSContent itsContent = itsDocument.getContent(language);

      // make sure this item has a machine rubric
      if (itsContent != null && itsContent.getMachineRubric() != null)
      {
          return itsContent.getMachineRubric();
      }

      return null;
  }

  private boolean writeTutorial(IITSDocument doc)
  {
      if (doc.getTutorial() == null) {
        return false;
      }

      startElement("tutorial");
      writeAttribute("bankKey", doc.getTutorial().getBankKey());
      writeAttribute("itemKey", doc.getTutorial().getId());
      endElement();

      return true;
  }

  private void writeAttachments(IITSDocument doc)
  {
      ITSContent content = doc.getContent(_language);
      if ((content.getAttachments() != null) && (content.getAttachments().size() > 0))
      {
          startElement("attachments");
          for (ITSAttachment attachment : content.getAttachments())
          {
              startElement("attachment");
              writeAttribute("id", attachment.getId ());
              writeAttribute("type", attachment.getType());
              writeAttribute("subType", attachment.getSubType());
              writeAttribute("target", attachment.getTarget());                        
              writeAttribute("url", attachment.getUrl() != null ? attachment.getUrl() : "");
              endElement();
          }
          endElement();
      }
  }

  private boolean writeResources(IITSDocument document)
  {
      // resource list
      if (document.getResources() == null || document.getResources().size() == 0)  {
        return false;
      }

      startElement("resources");

      for (ITSResource resource : document.getResources())
      {
          startElement("resource");
          writeAttribute("type", resource.getType());
          writeAttribute("bankKey", resource.getBankKey());
          writeAttribute("itemKey", resource.getId());
          endElement();
      }

      endElement();

      return true;
  }

  private boolean writeRendererSpec(IITSDocument doc)
  {
      if (StringUtils.isEmpty(doc.getRendererSpec())) return false;
      writeCData("rendererSpec", doc.getRendererSpec());
      return true;
  }

  private boolean writeItemContent(IITSDocument doc)
  {
      // get content for the language
      ITSContent content = doc.getContent(_language); // ?? itemRender.Item.GetContentDefault();
      if (content == null) return false;

      // GRID
      String gridAnswerSpace = doc.getGridAnswerSpace() != null ? doc.getGridAnswerSpace() :  content.getGridAnswerSpace();
      
      if (!StringUtils.isEmpty(gridAnswerSpace))
      {
          writeCData("gridAnswerSpace", gridAnswerSpace);
      }

      // MC/MS
      writeMSOptions(content); // <options>

      // QTI
      writeQTI(content);

      return true;
  }

  private void writeQTI(ITSContent content)
  {
      if (content.getQti () == null) return;

      startElement("qti"); // <qti>
      writeAttribute("spec", content.getQti ().getSpecification());
      writeCData(content.getQti ().getXml ());
      endElement(); // </qti>
  }

  private boolean writeMSOptions(ITSContent content)
  {
      if (content.getOptions() == null) {
        return false;
      }

      startElement("options"); // <options>
      
      writeAttribute("minChoices", content.getOptions().getMinChoices ());
      writeAttribute("maxChoices", content.getOptions().getMaxChoices());
      
      for (ITSOption option : content.getOptions())
      {
          startElement("option"); // <option>
          writeAttribute("key", option.getKey());

          // include option value
          if (_includeOptionValue)
          {
              writeCData("value", option.getValue());
              writeCData("sound", option.getSound());
          }

          // include feedback
          if (RendererSettings.getIsFeedbackEnabled ().getValue ())
          {
              writeCData("feedback", option.getFeedback());
          }

          endElement(); // </option>
      }

      endElement(); // </options>

      return true;
  }
  
  /**
   * This writes out media data such as MathML, SVG and Base64.
   * 
   * @param doc
   */
  private void writeMediaResources(IITSDocument doc) 
  {
      // check if there are any media files to send down
      List<String> mediaFiles = doc.getMediaFiles();
      if (mediaFiles == null || mediaFiles.size() == 0) return;

      // build xml
      startElement("media");

      for (String mediaFilePath : mediaFiles)
      {
          String fileName = Path.getFileName(mediaFilePath);

          boolean foundMedia = false;

          // check if we allow MathML
          if (RendererSettings.getIsMathMLEnabled())
          {
              // get xml file path
              String mathMLFilePath = mediaFilePath.replace(fileName, Path.getFileNameWithoutExtension(fileName) + ".xml");
              _Ref<String> mathMLFilePathRef = new _Ref<String> (mathMLFilePath);

              // check if MathML exists
              if (ITSDocumentHelper.exists(mathMLFilePathRef))
              {
                  foundMedia = true;
                  mathMLFilePath = mathMLFilePathRef.get();

                  startElement("resource");
                  writeAttribute("type", "application/mathml+xml");
                  writeAttribute("file", fileName);

                  // write out image xml
                  writeCDataStart();
                  writeStream(ITSDocumentHelper.getStream(mathMLFilePath));
                  writeCDataEnd();

                  // WriteCData(File.ReadAllText(xmlPath));

                  endElement();
              }
          }

          // check if no media has been fond yet and base64 is enabled
          if (!foundMedia && RendererSettings.getIsBase64Enabled()) {
              String fileExt = Path.getExtension(fileName);

              // check for valid file extension
              if (fileExt == ".png" || fileExt == ".jpg")
              {
                  startElement("resource");
                  writeAttribute("type", MimeMapping.getMapping(fileName));
                  writeAttribute("file", fileName);

                  // write out image base64
                  writeCDataStart();
                  writeBase64FromStream(ITSDocumentHelper.getStream(mediaFilePath));
                  writeCDataEnd();

                  endElement();
              }
          }
      }

      endElement();
  }


  /**
  * Write out generic elements.
  */
  private void writeElements(IITSDocument doc)  {
      ITSContent content = doc.getContent(_language);
      if (content == null || 
          content.getGenericElements() == null || 
          content.getGenericElements().size() == 0)  {
        return;
      }
      for (Element element : content.getGenericElements()) {
         writeElement(element);
      }
   }

}
