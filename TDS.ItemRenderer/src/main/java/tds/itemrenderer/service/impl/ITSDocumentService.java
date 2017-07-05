/***************************************************************************************************
 * Educational Online Test Delivery System
 * Copyright (c) 2017 Regents of the University of California
 *
 * Distributed under the AIR Open Source License, Version 1.0
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 *
 * SmarterApp Open Source Assessment Software Project: http://smarterapp.org
 * Developed by Fairway Technologies, Inc. (http://fairwaytech.com)
 * for the Smarter Balanced Assessment Consortium (http://smarterbalanced.org)
 **************************************************************************************************/

package tds.itemrenderer.service.impl;

import java.net.URI;

import tds.itemrenderer.ITSDocumentFactory;
import tds.itemrenderer.apip.APIPMode;
import tds.itemrenderer.apip.APIPXmlProcessor;
import tds.itemrenderer.apip.BRFProcessor;
import tds.itemrenderer.configuration.ItemDocumentSettings;
import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.AccProperties;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.ITSAttachment;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.ITSDocument2;
import tds.itemrenderer.processing.ITSDocumentParser;
import tds.itemrenderer.processing.ITSHtmlSanitizeTask;
import tds.itemrenderer.processing.ITSProcessorApipTasks;
import tds.itemrenderer.processing.ITSProcessorTasks;
import tds.itemrenderer.processing.ITSUrlResolver;
import tds.itemrenderer.processing.ITSUrlTask;
import tds.itemrenderer.processing.ItemDataService;
import tds.itemrenderer.service.ItemDocumentService;

public class ITSDocumentService implements ItemDocumentService {
  private final ItemDataService itemDataService;
  private final ItemDocumentSettings settings;
  private final ITSDocumentParser<ITSDocument2> documentParser;

  public ITSDocumentService(final ItemDataService itemDataService,
                            final ITSDocumentParser<ITSDocument2> documentParser,
                            final ItemDocumentSettings settings) {
    this.itemDataService = itemDataService;
    this.settings = settings;
    this.documentParser = documentParser;
  }

  @Override
  public IITSDocument loadItemDocument(URI uri, AccLookup accommodations, boolean resolveUrls) {

    // parse xml
    ITSDocument2 itsDocument = documentParser.load(uri, ITSDocument2.class, itemDataService);

    // check if valid xml
    if (!itsDocument.getValidated()) {
      throw new RuntimeException(String.format("The XML schema was not valid for the file \"%s\"", uri.toString()));
    }

    // run any processing
    executeProcessing(itsDocument, accommodations, resolveUrls);

    return itsDocument;
  }

  private void executeProcessing(ITSDocument2 itsDocument, AccLookup accommodations, boolean resolveUrls) {
    // check if there are accommodations
    if (accommodations == null || accommodations == AccLookup.getNone())
      return;

    AccProperties accProperties = new AccProperties(accommodations);
    String language = accProperties.getLanguage();

    // create post processor
    ITSProcessorTasks processorTasks = new ITSProcessorTasks(language);

    // create xml based task container
    ITSProcessorApipTasks apipTasks = new ITSProcessorApipTasks();

    // if this language has accessibility then add APIP task
    ITSContent content = itsDocument.getContent(language);

    // get APIP mode
    APIPMode apipMode = ITSDocumentFactory.getAPIPMode(accProperties);

    // process APIP
    if (content != null && content.getApip() != null && apipMode != APIPMode.None) { // create APIP processor if possible
      APIPXmlProcessor apipProcessor = ITSDocumentFactory.createAPIPProcessor(apipMode, accProperties.getTTXBusinessRules());

      if (apipProcessor != null) {
        apipTasks.registerTask(apipProcessor);
      }
    }

    // process BRF
    if (apipMode == APIPMode.BRF) {
      apipTasks.registerTask(new BRFProcessor(accProperties.getTTXBusinessRules()));
    }

    if (apipTasks.getCount() > 0) {
      processorTasks.registerTask(apipTasks);
    }

    ITSUrlResolver resolver = new ITSUrlResolver(itsDocument.getBaseUri(), settings.isEncryptionEnabled());

    // add task for URL's
    if (resolveUrls && apipMode != APIPMode.BRF) {
      processorTasks.registerTask(new ITSUrlTask(resolver));
    }

    // add task to sanitize the html output to fix up any undesirable artifacts in the items coming from ITS
    processorTasks.registerTask(new ITSHtmlSanitizeTask(accProperties));

    // execute tasks for specific language
    processorTasks.process(itsDocument);

    // resolve attachment url's
    // TODO: move into ITSProcessorTasks.cs and ITSUrlTask.cs in 2013
    if (content != null && content.getAttachments() != null && content.getAttachments().size() > 0) {
      for (ITSAttachment attachment : content.getAttachments()) {
        attachment.setUrl(resolver.resolveUrl(attachment.getFile()));
      }
    }
  }
}
