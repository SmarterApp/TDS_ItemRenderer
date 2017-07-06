/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/**
 * 
 */
package tds.itempreview.content;

import org.apache.commons.lang.StringUtils;

import AIR.Common.Utilities.Path;
import AIR.Common.Utilities.TDSStringUtils;
import tds.itemrenderer.data.ITSDocument;
import tds.itemrenderer.data.ITSTypes.ITSEntityType;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class ITSDocumentExtensions
{
  public static String getID (ITSDocument document) {
    String prefix = (document.getType () == ITSEntityType.Passage) ? "G" : "I";
    return TDSStringUtils.format ("{0}-{1}-{2}", prefix, document.getBankKey (), document.getItemKey ());
  }


  public static String[] getBaseUriDirSegments (ITSDocument document) {
    String baseUri = document.getBaseUri();
    String baseDirectory = Path.getDirectoryName (baseUri);

    String delim = "/\\";
    return StringUtils.split (baseDirectory, delim);
  }

  public static String getFolderName (ITSDocument itsDocument) {
    String[] segments = getBaseUriDirSegments (itsDocument);
    String segment = segments[segments.length - 1];
    return segment;
  }

  public static String getParentFolderName (ITSDocument itsDocument) {
    String[] segments = getBaseUriDirSegments (itsDocument);
    String segment = segments[segments.length - 2];
    return segment;
  }
}
