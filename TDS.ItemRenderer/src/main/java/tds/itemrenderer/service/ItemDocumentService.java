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

package tds.itemrenderer.service;

import java.net.URI;

import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.IITSDocument;

/**
 * Handles loading the Item Documents for display
 */
public interface ItemDocumentService {
  /**
   * Loads the {@link tds.itemrenderer.data.IITSDocument} representing item document
   *
   * @param uri            the URI to the document
   * @param accommodations the {@link tds.itemrenderer.data.AccLookup} associated with the document
   * @param resolveUrls    whether to resolve urls
   * @return {@link tds.itemrenderer.data.IITSDocument}
   */
  IITSDocument loadItemDocument(URI uri, AccLookup accommodations, boolean resolveUrls);
}
