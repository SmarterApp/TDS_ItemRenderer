/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import AIR.Common.Utilities.Path;
import AIR.Common.Utilities.SpringApplicationContext;
import AIR.Common.Web.FileFtpHandler;
import AIR.Common.Web.FtpResourceException;
import org.apache.commons.io.Charsets;
import org.apache.commons.io.input.XmlStreamReader;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.xml.sax.InputSource;
import org.xml.sax.XMLReader;
import tds.itemrenderer.configuration.RendererSettings;
import tds.itemrenderer.data.ITSAttachment;
import tds.itemrenderer.data.ITSAttribute;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.ITSDocument;

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

import javax.annotation.Nullable;
import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;
import java.io.BufferedReader;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringBufferInputStream;
import java.io.StringReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.List;

import static org.apache.commons.io.Charsets.UTF_8;

/**
 * Used for parsing the raw ITS Document XML into a ITS Document object.
 * NOTE: This class makes additional resource calls to saturate an ITS Document
 * with referenced resources.
 * 
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class ITSDocumentParser<T extends ITSDocument> {

  private static final Logger _logger = LoggerFactory.getLogger(ITSDocumentParser.class);

  private static final JAXBContext _jaxbContext = getJaxbContext();

  @Nullable
  private final RendererSpecService rendererSpecService;

  /**
   * Constructor
   */
  public ITSDocumentParser() {
    this(null);
  }

  /**
   * Constructor
   *
   * @param rendererSpecService A renderer spec reader
   */
  public ITSDocumentParser(@Nullable final RendererSpecService rendererSpecService) {
    this.rendererSpecService = rendererSpecService;
  }

  /**
   * Gets JAXB context
   *
   * @return JAXBContext
   */
  private static JAXBContext getJaxbContext() {
    try {
      return JAXBContext.newInstance(Itemrelease.class);
    } catch (final JAXBException e) {
      _logger.error(e.getMessage(), e);
      throw new IllegalStateException("Cannot initialize JaxbContext", e);
    }
  }

  /**
   * Loads and parses the XML into the ITS document.
   *
   * @param filePath
   * @param itsDocumentXmlType
   * @return ITS Document
   */
  public T load(String filePath, Class<T> itsDocumentXmlType) {
    final T document = ITSDocumentXmlFactory.create(itsDocumentXmlType);
    document.setBaseUri(filePath);
    return loadDocument(document);
  }

  /**
   * Loads and parses the item XML data
   *
   * @param uri                URI to the data
   * @param itsDocumentXmlType The document xml type
   * @param itemDataService     {@link ItemDataService} used to read data
   * @return T the loaded item
   */
  public T load(final URI uri, final Class<T> itsDocumentXmlType, final ItemDataService itemDataService) {
    final T document = ITSDocumentXmlFactory.create(itsDocumentXmlType);
    document.setBaseUri(uri.toString());
    final Itemrelease itemrelease = parseDocument(document, uri, itemDataService);
    readMain(document, itemrelease);
    document.setIsLoaded(true);
    return document;
  }

  /**
   * Loads and parses the XML into the ITS document.
   *
   * @param uri
   * @param itsDocumentXmlType
   * @return ITS Document
   */
  public T loadUri(final URI uri, final Class<T> itsDocumentXmlType) {
    if (RendererSettings.getDenyExternalContent() && uri.getScheme() != "file") {
      throw new UnauthorizedAccessException("Cannot load external content.");
    }
    final T document = ITSDocumentXmlFactory.create(itsDocumentXmlType);
    document.setBaseUri(ITSDocumentHelper.getUriOriginalString(uri));
    return loadDocument(document);
  }

  /**
   * Loads and parses the XML into the ITS document.
   *
   * @param itsDocument the document
   */
  public void loadFromItemRelease(T itsDocument) {
    final Itemrelease itemrelease = parseXml(itsDocument, false);
    readMain(itsDocument, itemrelease);
    itsDocument.setIsLoaded(true);
  }

  /**
   * loads document with XML data
   *
   * @return T  ITSDocumentXml
   */
  private T loadDocument(final T document) {
    final FileFtpHandler fileFtpHandler = SpringApplicationContext.getBean("fileFtpHandler", FileFtpHandler.class);
    final Itemrelease itemrelease;
    if (fileFtpHandler.allowScheme(document.getBaseUri())) {
      itemrelease = parseXml(document, true); // load from ftp site
    } else {
      itemrelease = parseXml(document, false); // load from local drive
    }
    readMain(document, itemrelease);
    document.setIsLoaded(true);
    return document;
  }

  /**
   * Parse XML and store results in the classes in
   * {@code tds.itemrenderer.data.xml.itemrelease} package
   *
   * @param document  The target document
   * @param isFtp if getting XML from FTP
   */
  private Itemrelease parseXml(final T document, final boolean isFtp) {
    try {
      final Unmarshaller jaxbUnmarshaller = _jaxbContext.createUnmarshaller();
      final Itemrelease itemrelease;
      if (isFtp) {
        InputStream inputStream = null;
        try {
          document.setBaseUri(document.getBaseUri().replace("\\", "/"));
          inputStream = new ByteArrayInputStream(FileFtpHandler.getBytes(new URI(document.getBaseUri())));
        } catch (FtpResourceException | URISyntaxException e) {
          throw new ITSDocumentProcessingException(e);
        }
        itemrelease = (Itemrelease) jaxbUnmarshaller.unmarshal(inputStream);
      } else {
        itemrelease = (Itemrelease) jaxbUnmarshaller.unmarshal(new File(document.getBaseUri()));
      }
      document.setValidated(true);
      return itemrelease;
    } catch (final JAXBException e) {
      final String message = "The XML schema was not valid for the file \"" + document.getBaseUri() + "\"";
      throw new ITSDocumentProcessingException(message + " " + e.getMessage(), e);
    }
  }

  private Itemrelease parseDocument(final T document, final URI uri, final ItemDataService itemDataService) {
    try (final InputStream xmlStream = new ByteArrayInputStream(itemDataService.readData(uri).getBytes(UTF_8))) {
      Unmarshaller jaxbUnmarshaller = _jaxbContext.createUnmarshaller();
      final Itemrelease itemrelease = (Itemrelease) jaxbUnmarshaller.unmarshal(xmlStream);
      document.setValidated(true);
      return itemrelease;
    } catch (IOException ioException) {
      throw new ITSDocumentProcessingException(ioException);
    } catch (JAXBException e) {
      String message = "The XML schema was not valid for the file \"" + document.getBaseUri () + "\"";
      throw new ITSDocumentProcessingException (message + " " + e.getMessage (), e);
    }
  }

  /**
   * The main mapper that reads contents from
   * {@code tds.itemrenderer.data.xml.itemrelease} package classes, process
   * the contents and store them in {@code tds.itemrenderer.data} package
   * classes
   */
  private void readMain (final T document, final Itemrelease itemrelease) {

    if (itemrelease.getVersion () != null) {
      document.setVersion (Double.parseDouble (itemrelease.getVersion ().trim ()));
    } else {
      document.setVersion (1.0);
    }

    if (document.getVersion () == 0) {
      return;
    }

    if (itemrelease.getItemPassage () != null) {
      if (itemrelease.getItemPassage ().getClass () == Passage.class) {
        document.setType (ITSEntityType.Passage);
      } else {
        document.setType (ITSEntityType.Item);
      }
    }

    // make sure the document was defined as either an item or passage
    if (document.getType () == ITSEntityType.Unknown) {
      return;
    }

    // get item/passage info
    ItemPassage item = itemrelease.getItemPassage ();
    document.setFormat (item.getFormat ());
    if (item.getId () != null) {
      document.setId (Long.parseLong (item.getId ().trim ()));
    }
    if (item.getBankkey () != null) {
      document.setBankKey (Long.parseLong (item.getBankkey ().trim ()));
    }
    if (item.getVersion () != null) {
      document.setApprovedVersion (Integer.parseInt (item.getVersion ().trim ()));
    }

    if (item.getAttriblist () != null) {
      readAttributes (document, itemrelease);
    }
    if (item.getTutorial () != null) {
      ITSTutorial itsTutorial = new ITSTutorial ();
      document.setTutorial (itsTutorial);
      if (item.getTutorial ().getId () != null) {
        itsTutorial.setId (Long.parseLong (item.getTutorial ().getId ().trim ()));
      }
      if (item.getTutorial ().getBankkey () != null) {
        itsTutorial.setBankKey (Long.parseLong (item.getTutorial ().getBankkey ().trim ()));
      }
    }

    if (item.getSoundcue () != null) {
      ITSSoundCue itsSoundCue = new ITSSoundCue ();
      document.setSoundCue (itsSoundCue);
      if (item.getSoundcue ().getId () != null) {
        itsSoundCue.setId (Long.parseLong (item.getSoundcue ().getId ().trim ()));
      }
      if (item.getSoundcue ().getBankkey () != null) {
        itsSoundCue.setBankKey (Long.parseLong (item.getSoundcue ().getBankkey ().trim ()));
      }
    }
    if (item.getRendererSpec () != null) {
      document.setRendererSpec (readRendererSpec (document, itemrelease));
    }

    if (item.getMachineRubric () != null) {
      document.setMachineRubric (readMachineRubric (document, itemrelease));
    }
    if (item.getGridanswerspace () != null) {
      document.setGridAnswerSpace (item.getGridanswerspace ().trim ());
    }
    readContents (document, itemrelease);
    readResources (document, itemrelease);

  }

  /**
   * Reads RendererSpec contents and process them
   * 
   * @return processed RendererSpec contents
   */
  private String readRendererSpec (final T document, final Itemrelease itemrelease) {
    if (itemrelease.getItemPassage ().getRendererSpec () == null) {
      return null;
    }

    String fileName = itemrelease.getItemPassage ().getRendererSpec ().getFilename ();
    if (fileName == null) {
      return itemrelease.getItemPassage().getRendererSpec().getValue();
    }

    fileName = fileName.trim ();

    String rendererSpecPath = document.getBaseUri ().replace (Path.getFileName (document.getBaseUri ()), "");
    rendererSpecPath += fileName;

    if (rendererSpecService != null) {
      try {
        return rendererSpecService.findOne(rendererSpecPath);
      } catch (final IOException e) {
        throw new ITSDocumentProcessingException("Problem reading Renderer Spec", e);
      }
    }

    URI rendererSpecUri = ITSDocumentHelper.createUri(rendererSpecPath);
    return ITSDocumentHelper.getContents (rendererSpecUri);
  }

  /**
   * Populates ITSMachineRubric from MachineRubric
   * 
   * @return populated ITSMachineRubric
   * 
   */
  private ITSMachineRubric readMachineRubric (final T document, final Itemrelease itemrelease) {
    MachineRubric machineRubric = itemrelease.getItemPassage ().getMachineRubric ();
    ITSMachineRubric itsMachineRubric = new ITSMachineRubric ();
    if (itemrelease.getItemPassage ().getMachineRubric () != null) {
      String fileName = itemrelease.getItemPassage ().getMachineRubric ().getFilename ();
      if (fileName != null) {
        itsMachineRubric.setType (ITSMachineRubricType.Uri);
        fileName = fileName.trim ();

        // combine the current xmls path with the file name
        // machineRubric.Data =
        // Path.Combine(Path.GetDirectoryName(_document.BaseUri), fileName);

        String baseUri = document.getBaseUri ();
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
  private void readAttributes (final T document, final Itemrelease itemrelease) {
    ItemPassage item = itemrelease.getItemPassage ();
    for (Attrib attrib : item.getAttriblist ().getAttrib ()) {
      ITSAttribute attib = new ITSAttribute ();
      attib.setId (attrib.getAttid ());
      attib.setName (attrib.getName ().trim ());
      attib.setId (attrib.getAttid ());
      attib.setDescription (attrib.getDesc ().trim ());
      attib.setValue (attrib.getVal ().trim ());
      document.addAttribute (attib);
    }
  }

  /**
   * Populates ITSResource from Resource
   * 
   */
  private void readResources (final T document, final Itemrelease itemrelease) {
    if (itemrelease.getItemPassage ().getResourceslist () != null) {
      List<Resource> resources = itemrelease.getItemPassage ().getResourceslist ().getResource ();
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
          document.getResources ().add (itsResource);
        }
      }
    }
  }

  /**
   * 
   * Populates ITSContent from Content
   * 
   */
  private void readContents (final T document, final Itemrelease itemrelease) {
    ItemPassage item = itemrelease.getItemPassage ();
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
        itsContent.setOptions (readOptions (document, content.getOptionlist ()));
      }
      if (content.getKeyboard () != null) {
        itsContent.setKeyboard (readKeyboard (content.getKeyboard ()));
      }
      if (content.getApipAccessibility () != null) {
        itsContent.setApip (readApip (content.getApipAccessibility ()));
      }
      if (content.getAttachmentlist () != null) {
        itsContent.setAttachments (readAttachments (document, content.getAttachmentlist ().getAttachment ()));
      }
      processGenericElements(itsContent, content);
      document.addContent (itsContent);
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

  private ITSOptionList readOptions (final T document, final Optionlist optionlist) {
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
        itsOptionList.add (readOption (document, option));
      }
    }
    return itsOptionList;
  }

  /**
   * 
   * @param option
   * @return
   */
  private ITSOption readOption (final T document, final Option option) {
    // right now we are on <option>
    ITSOption itsOption = new ITSOption ();
    String name = option.getName ().trim ();

    if (StringUtils.containsIgnoreCase (document.getFormat (), "SI")) {
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
  private String getFilePath (final T document)
  {
    return document.getBaseUri ().replace (Path.getFileName (document.getBaseUri ()), "");
  }

  /**
   * 
   * @param attachments
   * @return
   */
  private List<ITSAttachment> readAttachments (final T document, final List<Attachment> attachments) {
    List<ITSAttachment> itsAttachments = new ArrayList<ITSAttachment> ();

    if (attachments != null && attachments.size () > 0) {

      for (Attachment attachment : attachments) {
        ITSAttachment itsAttachment = new ITSAttachment ();
        itsAttachment.setId (attachment.getId ());
        itsAttachment.setType (attachment.getType ());
        itsAttachment.setSubType (attachment.getSubtype ());
        itsAttachment.setFile (attachment.getFile ());

        if (!StringUtils.isEmpty (itsAttachment.getFile ()))  {
          itsAttachment.setFile (getFilePath (document) + itsAttachment.getFile ());
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
