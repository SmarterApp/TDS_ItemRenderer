/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer;

import java.net.URI;

import org.apache.commons.lang3.StringUtils;

import tds.itemrenderer.apip.APIPMode;
import tds.itemrenderer.apip.APIPRuleGroup;
import tds.itemrenderer.apip.APIPRuleGroups;
import tds.itemrenderer.apip.APIPXmlProcessor;
import tds.itemrenderer.apip.BRFProcessor;
import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.AccProperties;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.ITSAttachment;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.ITSDocument;
import tds.itemrenderer.processing.ITSDocumentHelper;
import tds.itemrenderer.processing.ITSDocumentParser;
import tds.itemrenderer.processing.ITSHtmlSanitizeTask;
import tds.itemrenderer.processing.ITSProcessorApipTasks;
import tds.itemrenderer.processing.ITSProcessorTasks;
import tds.itemrenderer.processing.ITSUrlResolver;
import tds.itemrenderer.processing.ITSUrlTask;

/**
 * This is a simple public facade for loading ITS documents.
 * 
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */

public class ITSDocumentFactory
{

  /**
   * Get what the current APIP rendering mode is based on the accommodations.
   * 
   * @param accProperties
   * @return APIPMode
   */
  private static APIPMode getAPIPMode (AccProperties accProperties) {
    APIPMode apipMode = APIPMode.None;

    // check for braille accommodation
    if (accProperties.isBrailleEnabled ()) {
      // check for BRF accommodation
      apipMode = accProperties.isBRFEnabled () ? APIPMode.BRF : APIPMode.Braille;
    }
    // check for TTS accommodation
    else if (accProperties.isTTSStimulusEnabled () || accProperties.isTTSItemEnabled ()) {
      apipMode = APIPMode.TTS;
    }

    return apipMode;
  }

  private static APIPXmlProcessor createAPIPProcessor (APIPMode
      apipMode, String apipCode) {

    // get APIP rule group
    APIPRuleGroup apipRuleGroup = null;

    // try and load rules from APIP code
    if (!StringUtils.isEmpty (apipCode)) {
      apipRuleGroup = APIPRuleGroups.getGroup (apipCode);
    }

    // check if there are any APIP rules
    if (apipRuleGroup == null) {
      return null;
    }
    return new APIPXmlProcessor (apipMode, apipRuleGroup);
  }
   
  
  /**
   * Executes all the processing rules on a parsed ITS document based on
   * accommodations.
   * 
   * Note: You should not call this directly. But is left public in case you have to
   * manually create the ITS document.
   * 
   * @param itsDocument
   * @param accommodations
   * @param resolveUrls
   */
  public static void executeProcessing (ITSDocument itsDocument, AccLookup accommodations, boolean resolveUrls)  {
    // check if there are accommodations
    if (accommodations == null || accommodations == AccLookup.getNone ())
      return;

    AccProperties accProperties = new AccProperties (accommodations);
    String language = accProperties.getLanguage ();

    // create post processor
    ITSProcessorTasks processorTasks = new ITSProcessorTasks (language);

    // create xml based task container
    ITSProcessorApipTasks apipTasks = new ITSProcessorApipTasks ();

    // if this language has accessibility then add APIP task
    ITSContent content = itsDocument.getContent (language);

    // get APIP mode
    APIPMode apipMode = getAPIPMode (accProperties);


    // process APIP 
    if (content != null && content.getApip () != null &&  apipMode != APIPMode.None) { // create APIP processor if possible
       APIPXmlProcessor apipProcessor = createAPIPProcessor(apipMode, accProperties.getTTXBusinessRules ());
      
       if (apipProcessor != null) {
          apipTasks.registerTask(apipProcessor);
        } 
     }
      
      // process BRF 
      if (apipMode == APIPMode.BRF) { 
         apipTasks.registerTask(new BRFProcessor(accProperties.getTTXBusinessRules ()));
      }
         
      if (apipTasks.getCount () > 0) { 
         processorTasks.registerTask(apipTasks);
      }


    // add task for URL's
    if (resolveUrls && apipMode != APIPMode.BRF) {
      processorTasks.registerTask (new ITSUrlTask ());
    }
    
    // add task to sanitize the html output to fix up any undesirable artifacts in the items coming from ITS
    processorTasks.registerTask(new ITSHtmlSanitizeTask(accProperties));

    // execute tasks for specific language
    processorTasks.process (itsDocument);

    // resolve attachment url's
    // TODO: move into ITSProcessorTasks.cs and ITSUrlTask.cs in 2013
    if (content != null && content.getAttachments () != null && content.getAttachments ().size () > 0)  {
      ITSUrlResolver resolver = new ITSUrlResolver (itsDocument.getBaseUri ());

      for (ITSAttachment attachment : content.getAttachments ()) {
        attachment.setUrl (resolver.resolveUrl (attachment.getFile ()));
      }
    }
  }

  /**
   * Create and load ITS XML document.
   * 
   * @param filePath
   * @param accommodations
   * @param resolveUrls
   * @return ITSDocument
   */
  public static IITSDocument load (String filePath, AccLookup accommodations, boolean resolveUrls) {
    // create parser
    ITSDocumentParser<ITSDocument> itsParser = new ITSDocumentParser<ITSDocument> ();

    // parse xml
    filePath = ITSDocumentHelper.getReplacementPath (filePath);
    ITSDocument itsDocument = itsParser.load (filePath, ITSDocument.class);

    // check if valid xml
    if (!itsDocument.getValidated ()) {
      throw new RuntimeException ("The XML schema was not valid for the file \"" + filePath + "\"");
    }

    // run any processing
    executeProcessing (itsDocument, accommodations, resolveUrls);

    return itsDocument;
  }

  public static IITSDocument load (String filePath, String language, boolean resolveUrls) {
    AccLookup accommodations = new AccLookup ();
    accommodations.add ("Language", language);

    return load (filePath, accommodations, resolveUrls);
  }

  /**
   * Create and load ITS XML document.
   * 
   * @param filePath
   * @param accommodations
   * @param resolveUrls
   * @return ITSDocument
   */
  public static IITSDocument loadUri (String filePath, AccLookup accommodations, boolean resolveUrls) {
    // get uri
    URI uri = ITSDocumentHelper.createUri (filePath);

    // create parser and load xml
    ITSDocumentParser<ITSDocument> itsParser = new ITSDocumentParser<ITSDocument> ();
    ITSDocument itsDocument = itsParser.loadUri (uri, ITSDocument.class);

    if (itsDocument.getValidated ()) {
      // run any processing
      executeProcessing (itsDocument, accommodations, resolveUrls);
    }

    return itsDocument;
  }

  /**
   * Create and load ITS document object with xml.
   * 
   * Note: This should replace LoadUri as it will load the right parser required.
   * 
   * @param filePath
   * @param accommodations
   * @param resolveUrls
   * @return
   */
  public static IITSDocument loadUri2 (String filePath, AccLookup accommodations, boolean isResolveUrls)  {
    // get uri
    URI uri = ITSDocumentHelper.createUri (filePath);

    ITSDocument itsDocument = new ITSDocument ();
    itsDocument.setBaseUri (ITSDocumentHelper.getUriOriginalString (uri));
    String fileType = ITSDocumentHelper.getRootElementName (uri);

    if (fileType.equals ("itemrelease")) {
      ITSDocumentParser<ITSDocument> itsParser = new ITSDocumentParser<ITSDocument> ();
      itsParser.loadFromItemRelease (itsDocument);
    }

    if (itsDocument != null && itsDocument.getValidated ())   {
      // run any processing
      executeProcessing (itsDocument, accommodations, isResolveUrls);
    }
    return itsDocument;
  }
  
}
