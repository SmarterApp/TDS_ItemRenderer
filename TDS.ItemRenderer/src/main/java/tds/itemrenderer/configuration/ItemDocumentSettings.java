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

package tds.itemrenderer.configuration;

/**
 * Contains settings for the document service
 */
public class ItemDocumentSettings {
  private boolean encryptionEnabled;

  /**
   * @return {@code true} if the
   */
  public boolean isEncryptionEnabled() {
    return encryptionEnabled;
  }

  public void setEncryptionEnabled(final boolean encryptionEnabled) {
    this.encryptionEnabled = encryptionEnabled;
  }
}
