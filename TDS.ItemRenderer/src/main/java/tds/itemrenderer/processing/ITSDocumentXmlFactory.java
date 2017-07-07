/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import java.lang.reflect.InvocationTargetException;

import tds.itemrenderer.data.ITSDocumentXml;

/**
 * Creates ITSDocumentXML instance
 * 
 * @author jmambo
 *
 */
public class ITSDocumentXmlFactory
{

  /**
   * Creates ITSDocumentXML instance
   * 
   * @param itsDocumentXmlType ITSDocumentXML class type
   * @return ITSDocumentXML instance
   */
  public static <T extends  ITSDocumentXml> T create(Class<T> itsDocumentXmlType) {
    try {
        return itsDocumentXmlType.getDeclaredConstructor ().newInstance ();
    } catch (InstantiationException | IllegalAccessException | IllegalArgumentException | InvocationTargetException | NoSuchMethodException | SecurityException e) {
      throw new ITSDocumentProcessingException(e);
    }
  }
  
}
