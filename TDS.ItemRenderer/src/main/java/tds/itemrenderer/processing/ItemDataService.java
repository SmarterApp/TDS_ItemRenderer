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

package tds.itemrenderer.processing;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;

/**
 * Handles reading the item XML
 */
public interface ItemDataService {
  /**
   * Returns an item data XML string.
   *
   * @param uri uri to the xml
   * @return {@link java.io.InputStream}
   * @throws IOException if there is any issue accessing the data
   */
  String readData(final URI uri) throws IOException;

  /**
   * Returns an input stream of data for a TDS resource
   *
   * @param uri uri of the resource
   * @return The resource data as an input stream
   * @throws IOException if there is any issue accessing the data
   */
  InputStream readResourceData(final URI uri) throws IOException;

/**
 * Returns the existence of item data
 *
 * @param uri uri to the xml
 * @return {@link java.io.InputStream}
 * @throws IOException if there is any issue accessing the data
 */
  boolean dataExists(final URI uri) throws IOException;
}
