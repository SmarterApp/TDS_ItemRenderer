/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tds.itemrenderer.configuration.RendererSettings;
import tds.itemrenderer.data.ITSAttachment;
import tds.itemrenderer.data.ITSAttribute;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.ITSDocumentXml;
import tds.itemrenderer.data.ITSKeyboard;
import tds.itemrenderer.data.ITSKeyboardKey;
import tds.itemrenderer.data.ITSKeyboardRow;
import tds.itemrenderer.data.ITSMachineRubric;
import tds.itemrenderer.data.ITSMachineRubric.ITSMachineRubricType;
import tds.itemrenderer.data.ITSOption;
import tds.itemrenderer.data.ITSOptionList;
import tds.itemrenderer.data.ITSQTI;
import tds.itemrenderer.data.ITSResource;
import tds.itemrenderer.data.ITSSoundCue;
import tds.itemrenderer.data.ITSTutorial;
import tds.itemrenderer.data.ITSTypes.ITSEntityType;
import tds.itemrenderer.data.apip.APIPAccessElement;
import tds.itemrenderer.data.apip.APIPBraille;
import tds.itemrenderer.data.apip.APIPBrailleCode;
import tds.itemrenderer.data.apip.APIPContentLinkInfo;
import tds.itemrenderer.data.apip.APIPReadAloud;
import tds.itemrenderer.data.apip.APIPRelatedElementInfo;
import tds.itemrenderer.data.apip.APIPXml;
import tds.itemrenderer.data.xml.itemrelease.AccessElement;
import tds.itemrenderer.data.xml.itemrelease.ApipAccessibility;
import tds.itemrenderer.data.xml.itemrelease.Attachment;
import tds.itemrenderer.data.xml.itemrelease.Attrib;
import tds.itemrenderer.data.xml.itemrelease.BrailleCode;
import tds.itemrenderer.data.xml.itemrelease.Content;
import tds.itemrenderer.data.xml.itemrelease.ContentLinkInfo;
import tds.itemrenderer.data.xml.itemrelease.ItemPassage;
import tds.itemrenderer.data.xml.itemrelease.Itemrelease;
import tds.itemrenderer.data.xml.itemrelease.Key;
import tds.itemrenderer.data.xml.itemrelease.Keyboard;
import tds.itemrenderer.data.xml.itemrelease.KeyboardRow;
import tds.itemrenderer.data.xml.itemrelease.MachineRubric;
import tds.itemrenderer.data.xml.itemrelease.Option;
import tds.itemrenderer.data.xml.itemrelease.Optionlist;
import tds.itemrenderer.data.xml.itemrelease.Passage;
import tds.itemrenderer.data.xml.itemrelease.Qti;
import tds.itemrenderer.data.xml.itemrelease.RelatedElementInfo;
import tds.itemrenderer.data.xml.itemrelease.Resource;
import AIR.Common.Utilities.Path;
import AIR.Common.Utilities.SpringApplicationContext;
import AIR.Common.Web.FileFtpHandler;
import AIR.Common.Web.FtpResourceException;

/**
 * Used for parsing the raw ITS Document XML into a ITS Document object.
 * 
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class ITSDocumentParser<T extends ITSDocumentXml>
{

  private static final Logger      _logger      = LoggerFactory.getLogger (ITSDocumentParser.class);

  private static final JAXBContext _jaxbContext = getJaxbContext ();
  
  private T                        _document;

  private Itemrelease              _itemRelease;
  

  public ITSDocumentParser () {
  }

  /**
   * Gets JAXB context
   * 
   * @return JAXBContext
   */
  private static JAXBContext getJaxbContext () {
    try {
      return JAXBContext.newInstance (Itemrelease.class);
    } catch (JAXBException e) {
      _logger.error (e.getMessage (), e);
    }
    return null;
  }

  /**
   * Loads and parses the XML into the ITS document.
   * 
   * @param filePath
   * @param itsDocumentXmlType
   * @return ITS Document
   */
  public T load (String filePath, Class<T> itsDocumentXmlType) {
    _document = ITSDocumentXmlFactory.create (itsDocumentXmlType);
    _document.setBaseUri (filePath);
    return loadDocument();
  }

  /**
   * Loads and parses the XML into the ITS document.
   * 
   * @param uri
   * @param itsDocumentXmlType
   * @return ITS Document
   */
  public T loadUri (URI uri, Class<T> itsDocumentXmlType) {
    if (RendererSettings.getDenyExternalContent () && uri.getScheme () != "file") {
      throw new UnauthorizedAccessException ("Cannot load external content.");
    }
    _document = ITSDocumentXmlFactory.create (itsDocumentXmlType);
    _document.setBaseUri (ITSDocumentHelper.getUriOriginalString (uri));
    return loadDocument();
  }

  /**
   * loads document with XML data
   * @return T  ITSDocumentXml
   */
  public T loadDocument() {
    FileFtpHandler fileFtpHandler = SpringApplicationContext.getBean ("fileFtpHandler", FileFtpHandler.class);
    if (fileFtpHandler.allowScheme (_document.getBaseUri ()))   {
      parseXml (true); // load from ftp site
    }
    else  {
      parseXml (false); // load from local drive
    }
    readMain ();
    _document.setIsLoaded (true);
    return _document;
  }

  /**
   * Loads and parses the XML into the ITS document.
   * 
   * @param itsDoc
   */
  public void loadFromItemRelease (T itsDocument) {
    _document = itsDocument;
    parseXml (false);
    readMain ();
    _document.setIsLoaded (true);
  }

  /**
   * Parse XML and store results in the classes in
   * {@code tds.itemrenderer.data.xml.itemrelease} package
   * 
   * @param isFtp if getting XML from FTP
   * 
   */
  private void parseXml (boolean isFtp) {
    try {
      Unmarshaller jaxbUnmarshaller = _jaxbContext.createUnmarshaller ();
      if (isFtp) {
        InputStream inputStream = null;
        try {
          _document.setBaseUri (_document.getBaseUri ().replace ("\\", "/"));
          inputStream = new ByteArrayInputStream (FileFtpHandler.getBytes (new URI (_document.getBaseUri ())));
        } catch (FtpResourceException | URISyntaxException e) {
          throw new ITSDocumentProcessingException (e);
        }
        _itemRelease = (Itemrelease) jaxbUnmarshaller.unmarshal (inputStream);
      } else {
        _itemRelease = (Itemrelease) jaxbUnmarshaller.unmarshal (new File (_document.getBaseUri ()));
      }
      _document.setValidated (true);
    } catch (JAXBException e) {
      String message = "The XML schema was not valid for the file \"" + _document.getBaseUri () + "\"";
      throw new ITSDocumentProcessingException (message + " " + e.getMessage (), e);
    }
  }

  /**
   * The main mapper that reads contents from
   * {@code tds.itemrenderer.data.xml.itemrelease} package classes, process
   * the contents and store them in {@code tds.itemrenderer.data} package
   * classes
   */
  private void readMain () {

    if (_itemRelease.getVersion () != null) {
      _document.setVersion (Double.parseDouble (_itemRelease.getVersion ().trim ()));
    } else {
      _document.setVersion (1.0);
    }

    if (_document.getVersion () == 0) {
      return;
    }

    if (_itemRelease.getItemPassage () != null) {
      if (_itemRelease.getItemPassage ().getClass () == Passage.class) {
        _document.setType (ITSEntityType.Passage);
      } else {
        _document.setType (ITSEntityType.Item);
      }
    }

    // make sure the document was defined as either an item or passage
    if (_document.getType () == ITSEntityType.Unknown) {
      return;
    }

    // get item/passage info
    ItemPassage item = _itemRelease.getItemPassage ();
    _document.setFormat (item.getFormat ());
    if (item.getId () != null) {
      _document.setId (Long.parseLong (item.getId ().trim ()));
    }
    if (item.getBankkey () != null) {
      _document.setBankKey (Long.parseLong (item.getBankkey ().trim ()));
    }
    if (item.getVersion () != null) {
      _document.setApprovedVersion (Integer.parseInt (item.getVersion ().trim ()));
    }

    if (item.getAttriblist () != null) {
      readAttributes ();
    }
    if (item.getTutorial () != null) {
      ITSTutorial itsTutorial = new ITSTutorial ();
      _document.setTutorial (itsTutorial);
      if (item.getTutorial ().getId () != null) {
        itsTutorial.setId (Long.parseLong (item.getTutorial ().getId ().trim ()));
      }
      if (item.getTutorial ().getBankkey () != null) {
        itsTutorial.setBankKey (Long.parseLong (item.getTutorial ().getBankkey ().trim ()));
      }
    }

    if (item.getSoundcue () != null) {
      ITSSoundCue itsSoundCue = new ITSSoundCue ();
      _document.setSoundCue (itsSoundCue);
      if (item.getSoundcue ().getId () != null) {
        itsSoundCue.setId (Long.parseLong (item.getSoundcue ().getId ().trim ()));
      }
      if (item.getSoundcue ().getBankkey () != null) {
        itsSoundCue.setBankKey (Long.parseLong (item.getSoundcue ().getBankkey ().trim ()));
      }
    }
    if (item.getRendererSpec () != null) {
      _document.setRendererSpec (readRendererSpec ());
    }

    if (item.getMachineRubric () != null) {
      _document.setMachineRubric (readMachineRubric ());
    }
    if (item.getGridanswerspace () != null) {
      _document.setGridAnswerSpace (item.getGridanswerspace ().trim ());
    }
    readContents ();
    readResources ();

  }

  /**
   * Reads RendererSpec contents and process them
   * 
   * @return processed RendererSpec contents
   */
  private String readRendererSpec () {
    String rendererSpec = null;
    if (_itemRelease.getItemPassage ().getRendererSpec () != null) {
      String fileName = _itemRelease.getItemPassage ().getRendererSpec ().getFilename ();
      if (fileName != null) {
        fileName = fileName.trim ();

        String rendererSpecPath = _document.getBaseUri ().replace (Path.getFileName (_document.getBaseUri ()), "");
        rendererSpecPath += fileName;

        URI rendererSpecUri = ITSDocumentHelper.createUri(rendererSpecPath);
        rendererSpec = ITSDocumentHelper.getContents (rendererSpecUri);
      } else {
        rendererSpec = _itemRelease.getItemPassage ().getRendererSpec ().getValue ();
      }
    }
    return rendererSpec;
  }

  /**
   * Populates ITSMachineRubric from MachineRubric
   * 
   * @return populated ITSMachineRubric
   * 
   */
  private ITSMachineRubric readMachineRubric () {
    MachineRubric machineRubric = _itemRelease.getItemPassage ().getMachineRubric ();
    ITSMachineRubric itsMachineRubric = new ITSMachineRubric ();
    if (_itemRelease.getItemPassage ().getMachineRubric () != null) {
      String fileName = _itemRelease.getItemPassage ().getMachineRubric ().getFilename ();
      if (fileName != null) {
        itsMachineRubric.setType (ITSMachineRubricType.Uri);
        fileName = fileName.trim ();

        // combine the current xmls path with the file name
        // machineRubric.Data =
        // Path.Combine(Path.GetDirectoryName(_document.BaseUri), fileName);

        String baseUri = _document.getBaseUri ();
        if (!baseUri.startsWith ("file:/") && !baseUri.startsWith ("ftp:/")) {
          baseUri = new File (baseUri).toURI ().toString();
        } 
      
        itsMachineRubric.setData (baseUri.replace (Path.getFileName (baseUri), fileName));
      }
      else
      {
        itsMachineRubric.setType (ITSMachineRubricType.Text);

        // get the machine rubric String
        itsMachineRubric.setData (machineRubric.getValue ());
      }
    }
   return itsMachineRubric;
  }

  /**
   * Populates ITSAttribute from Attrib
   * 
   */
  private void readAttributes () {
    ItemPassage item = _itemRelease.getItemPassage ();
    for (Attrib attrib : item.getAttriblist ().getAttrib ()) {
      ITSAttribute attib = new ITSAttribute ();
      attib.setId (attrib.getAttid ());
      attib.setName (attrib.getName ().trim ());
      attib.setId (attrib.getAttid ());
      attib.setDescription (attrib.getDesc ().trim ());
      attib.setValue (attrib.getVal ().trim ());
      _document.addAttribute (attib);
    }
  }

  /**
   * Populates ITSResource from Resource
   * 
   */
  private void readResources () {
    if (_itemRelease.getItemPassage ().getResourceslist () != null) {
      List<Resource> resources = _itemRelease.getItemPassage ().getResourceslist ().getResource ();
      if (resources != null && resources.size () > 0) {
        for (Resource resource : resources) {
          ITSResource itsResource = new ITSResource ();
          itsResource.setType (resource.getType ());
          if (resource.getId () != null) {
            itsResource.setId (Long.parseLong (resource.getId ().trim ()));
          }
          if (resource.getBankkey () != null) {
            itsResource.setBankKey (Long.parseLong (resource.getBankkey ().trim ()));
          }
          _document.getResources ().add (itsResource);
        }
      }
    }
  }

  /**
   * 
   * Populates ITSContent from Content
   * 
   */
  private void readContents () {
    ItemPassage item = _itemRelease.getItemPassage ();
    for (Content content : item.getContent ()) {
      ITSContent itsContent = new ITSContent ();
      itsContent.setLanguage (content.getLanguage ());
      if (content.getQti () != null) {
        itsContent.setQti (readQti (content.getQti ()));
      }
      if (content.getIllustration () != null) {
        itsContent.setIllustration (content.getIllustration ());
      }
      if (content.getIllustrationTts () != null) {
        itsContent.setIllustrationTTS (content.getIllustrationTts ());
      }
      if (content.getStem () != null) {
        itsContent.setStem (content.getStem ());
      }
      if (content.getStemTts () != null) {
        itsContent.setStemTTS (content.getStemTts ());
      }
      if (content.getTitle () != null) {
        itsContent.setTitle (content.getTitle ());
      }
      if (content.getOptionlist () != null) {
        itsContent.setOptions (readOptions (content.getOptionlist ()));
      }
      if (content.getKeyboard () != null) {
        itsContent.setKeyboard (readKeyboard (content.getKeyboard ()));
      }
      if (content.getApipAccessibility () != null) {
        itsContent.setApip (readApip (content.getApipAccessibility ()));
      }
      if (content.getAttachmentlist () != null) {
        itsContent.setAttachments (readAttachments (content.getAttachmentlist ().getAttachment ()));
      }
      processGenericElements(itsContent, content);
      _document.addContent (itsContent);
    }

  }

  /**
   * 
   * @param qti
   * @return
   */
  private ITSQTI readQti (Qti qti) {

    ITSQTI itsQti = new ITSQTI ();
    if (qti.getSpec () != null) {
      // get the qti specification ("itemBody" or "assessmentItem")
      itsQti.setSpecification (qti.getSpec ());
    }

    if (qti.getContent () != null) {
      itsQti.setXml (qti.getContent ().trim ());
    }
    // read the xml (TODO: support file name)
    // HACK: If we are using itemBody spec and there is no <itemBody> root
    // then
    // add it
    if (itsQti.getSpecification () != null && itsQti.getSpecification ().equals ("itemBody") && itsQti.getXml () != null && !itsQti.getXml ().startsWith ("<itemBody>")) {
      itsQti.setXml (String.format ("<itemBody>%s</itemBody>", itsQti.getXml ()));
    }

    return itsQti;
  }

  /**
   * Read and process the {@code keyboard} element
   * 
   * @param keyboard
   * @return
   */
  private ITSKeyboard readKeyboard (Keyboard keyboard) {
    ITSKeyboard itsKeyboard = new ITSKeyboard ();

    if (keyboard.getKeyboardRow () != null && keyboard.getKeyboardRow ().size () > 0) {
      itsKeyboard.setRows (new ArrayList<ITSKeyboardRow> ());

      for (KeyboardRow keyboardRow : keyboard.getKeyboardRow ()) {
        ITSKeyboardRow itsKeyboardRow = new ITSKeyboardRow ();
        itsKeyboardRow.setId (keyboardRow.getId ());
        itsKeyboard.getRows ().add (itsKeyboardRow);
        if (keyboardRow.getKey () != null && keyboardRow.getKey ().size () > 0) {

          List<ITSKeyboardKey> itsKeyboardKeys = new ArrayList<ITSKeyboardKey> ();
          itsKeyboardRow.setKeys (itsKeyboardKeys);
          for (Key key : keyboardRow.getKey ()) {
            ITSKeyboardKey itsKeyboardKey = new ITSKeyboardKey ();
            itsKeyboardKey.setId (key.getId ());
            itsKeyboardKey.setType (key.getValue ());
            itsKeyboardKey.setValue (key.getValue ());
            itsKeyboardKey.setDisplay (key.getDisplay ());
            itsKeyboardKeys.add (itsKeyboardKey);

          }
        }
      }
    }
    return itsKeyboard;
  }

  /**
   * 
   * @param options
   * @return
   */
  private ITSOptionList readOptions (Optionlist optionlist) {
    List<Option> options = optionlist.getOption ();
    ITSOptionList itsOptionList = new ITSOptionList ();
    if (!StringUtils.isBlank (optionlist.getMinChoices ())) {
       itsOptionList.setMinChoices (Integer.parseInt (optionlist.getMinChoices ()));
    } 
    if (!StringUtils.isBlank (optionlist.getMaxChoices ())) {
       itsOptionList.setMaxChoices (Integer.parseInt (optionlist.getMaxChoices ()));
    }
    if (options != null && options.size () > 0) {
      for (Option option : options) {
        itsOptionList.add (readOption (option));
      }
    }
    return itsOptionList;
  }

  /**
   * 
   * @param option
   * @return
   */
  private ITSOption readOption (Option option) {
    // right now we are on <option>
    ITSOption itsOption = new ITSOption ();
    String name = option.getName ().trim ();

    if (StringUtils.containsIgnoreCase (_document.getFormat (), "SI")) {
      // e.g., <name>Option NR</name>
      itsOption.setKey (name.replaceAll("\\u00a0"," ").split (" ")[1]);
    } else {
      // e.g., <name>Option A</name>
      itsOption.setKey (name.substring (name.length () - 1));
    }
    itsOption.setValue (option.getVal ());
    itsOption.setSound (option.getSound ());
    itsOption.setFeedback (option.getFeedback ());
    itsOption.setTts (option.getTts ());

    return itsOption;
  }

  /**
   * Gets the base path for this xml file.
   * 
   * @return
   */
  private String getFilePath ()
  {
    return _document.getBaseUri ().replace (Path.getFileName (_document.getBaseUri ()), "");
  }

  /**
   * 
   * @param attachments
   * @return
   */
  private List<ITSAttachment> readAttachments (List<Attachment> attachments) {
    List<ITSAttachment> itsAttachments = new ArrayList<ITSAttachment> ();

    if (attachments != null && attachments.size () > 0) {

      for (Attachment attachment : attachments) {
        ITSAttachment itsAttachment = new ITSAttachment ();
        itsAttachment.setId (attachment.getId ());
        itsAttachment.setType (attachment.getType ());
        itsAttachment.setSubType (attachment.getSubtype ());
        itsAttachment.setFile (attachment.getFile ());

        if (!StringUtils.isEmpty (itsAttachment.getFile ()))  {
          itsAttachment.setFile (getFilePath () + itsAttachment.getFile ());
        }

        itsAttachments.add (itsAttachment);
      }
    }
    return itsAttachments;
  }

  /**
   * 
   * @param apipAccessibility
   * @return
   */
  private APIPXml readApip (ApipAccessibility apipAccessibility) {
    APIPXml apipXml = null;
    if (apipAccessibility.getAccessibilityInfo () != null && apipAccessibility.getAccessibilityInfo ().getAccessElement () != null) {
      List<AccessElement> accessElements = apipAccessibility.getAccessibilityInfo ().getAccessElement ();
      if (accessElements != null && accessElements.size () > 0) {
        apipXml = new APIPXml ();
        for (AccessElement accessElement : accessElements) {
          apipXml.addAccessElement (getApipAccessElement (accessElement));
        }
      }
    }
    return apipXml;
  }

  /**
   * 
   * @param accessElement
   * @return
   */
  private APIPAccessElement getApipAccessElement (AccessElement accessElement) {
    APIPAccessElement apipAccessElement = new APIPAccessElement ();
    apipAccessElement.setIdentifier (accessElement.getIdentifier ());
    ContentLinkInfo contentLinkInfo = accessElement.getContentLinkInfo ();
    if (contentLinkInfo != null)
    {
      APIPContentLinkInfo apipContentLinkInfo = new APIPContentLinkInfo ();
      apipContentLinkInfo.setItsLinkIdentifierRef (contentLinkInfo.getItsLinkIdentifierRef ());
      apipContentLinkInfo.setType (contentLinkInfo.getType ());
      apipContentLinkInfo.setSubType (contentLinkInfo.getSubtype ());
      apipAccessElement.setContentLinkInfo (apipContentLinkInfo);
    }

    RelatedElementInfo relatedElementInfo = accessElement.getRelatedElementInfo ();
    if (relatedElementInfo != null) {
      apipAccessElement.setRelatedElementInfo (getApipRelatedElementInfo (relatedElementInfo));
    } // </relatedElementInfo>
    return apipAccessElement;
  }

  /**
   * 
   * @param relatedElementInfo
   * @return
   */
  private APIPRelatedElementInfo getApipRelatedElementInfo (RelatedElementInfo relatedElementInfo)
  {
    APIPRelatedElementInfo apipRelatedElementInfo = new APIPRelatedElementInfo ();

    if (relatedElementInfo.getReadAloud () != null)
    {
      APIPReadAloud apipReadAloud = new APIPReadAloud ();
      apipRelatedElementInfo.setReadAloud (apipReadAloud);
      apipReadAloud.setAudioText (relatedElementInfo.getReadAloud ().getAudioText ());
      apipReadAloud.setAudioShortDesc (relatedElementInfo.getReadAloud ().getAudioShortDesc ());
      apipReadAloud.setAudioLongDesc (relatedElementInfo.getReadAloud ().getAudioLongDesc ());
      apipReadAloud.setTtsPronunciation (relatedElementInfo.getReadAloud ().getTextToSpeechPronunciation ());
      //TODO: assumption that either AudioShortDesc or TextToSpeechPronunciationAlternate XML tags should be used 
      if (StringUtils.isBlank (relatedElementInfo.getReadAloud ().getAudioShortDesc ())) {
        apipReadAloud.setAudioShortDesc (relatedElementInfo.getReadAloud ().getTextToSpeechPronunciationAlternate ());
      }
    }
    if (relatedElementInfo.getBrailleText () != null) {
      apipRelatedElementInfo.setBraille (new APIPBraille ());
      apipRelatedElementInfo.getBraille ().setText (relatedElementInfo.getBrailleText ().getBrailleTextString ());
      if (relatedElementInfo.getBrailleText ().getBrailleCode () != null) {
        apipRelatedElementInfo.getBraille ().setText (relatedElementInfo.getBrailleText ().getBrailleTextString ());
        BrailleCode brailleCode = relatedElementInfo.getBrailleText ().getBrailleCode ();
        APIPBrailleCode apipBrailleCode = new APIPBrailleCode (brailleCode.getType (), brailleCode.getContent ());
        apipRelatedElementInfo.getBraille ().getBrailleCodes ().add (apipBrailleCode);
      }
    }
    return apipRelatedElementInfo;
  }

  /**
   * Generic elements are constraints, search
   * 
   * @param itsContent
   * @param content
   */
  private void processGenericElements (ITSContent itsContent, Content content) {
    if (content.getConstraints () != null) {
      itsContent.getGenericElements ().add (content.getConstraints () );
    }
    if (content.getSearch () != null) {
      itsContent.getGenericElements ().add (content.getSearch () );
    }
  }
}
