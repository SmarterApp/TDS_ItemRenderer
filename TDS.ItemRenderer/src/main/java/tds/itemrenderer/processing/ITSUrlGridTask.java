/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import java.io.File;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.apache.commons.net.util.Base64;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

import tds.itemrenderer.data.ITSDocumentXml;
import tds.itemrenderer.data.ITSTypes.ITSContentType;
import tds.itemrenderer.data.ITSTypes.ITSContextType;
import AIR.Common.Utilities.Path;

/**
 * @author jmambo
 *
 */
public class ITSUrlGridTask extends TaskExecutor<String>
{

  private final String _xmlRootPath;

  public ITSUrlGridTask (String xmlFilePath) {
    _xmlRootPath = xmlFilePath.replace (Path.getFileName (xmlFilePath), "");
  }

  public ITSContentType getContentSupported () {
    return ITSContentType.Xml;
  }

  /**
   * Process element content
   * 
   * @param itsDocument
   * @param contentType
   * @param contextType
   * @param language
   * @param xml
   * @return
   */
  public String process (ITSDocumentXml itsDocument, ITSContentType contentType, ITSContextType contextType, String language, String xml) {
    NodeList imageElements = getImageElements (xml);

    if (imageElements != null) {
      for (int i = 0; i < imageElements.getLength (); i++) {
        Element imageElement = (Element) imageElements.item (i);
        if (imageElement.getNodeName ().equalsIgnoreCase ("FileSpec")) {
          processFileSpec (imageElement);
        }
        if (imageElement.getNodeName ().equalsIgnoreCase ("Image")) {
          processImage (imageElement);
        }
      }
    }

    return xml;
  }

  /**
   * Process FileSpec element
   * 
   * @param fileSpecElement
   */
  private void processFileSpec (Element fileSpecElement) {
    String imageFilePath = Path.combine (_xmlRootPath, fileSpecElement.getTextContent ());
    fileSpecElement.setTextContent (getBase64 (imageFilePath));
  }

  /**
   * Process image element
   * 
   * @param imageElement
   */
  private void processImage (Element imageElement) {
    String imgSrcAttrib = imageElement.getAttribute ("src");
    String imageFilePath = Path.combine (_xmlRootPath, imgSrcAttrib);
    imageElement.setAttribute ("src", getBase64 (imageFilePath));
  }

  /**
   * Convert to base 64
   * 
   * @param imageFilePath
   * @return
   */
  private String getBase64 (String imageFilePath) {
    // create data uri format
    String dataUriFormat = "data:image/%s;base64,";
    String imageExt = Path.getExtension (imageFilePath).replace (".", "");
    String dataUri = String.format (dataUriFormat, imageExt);

    // get base64 data
    byte[] imageBytes = null;
    try {
      imageBytes = FileUtils.readFileToByteArray (new File (imageFilePath));
    } catch (IOException e) {
      throw new ITSDocumentProcessingException (e);
    }
    String imageBase64 = Base64.encodeBase64String (imageBytes);

    // return data uri
    return dataUri + imageBase64;
  }

  /**
   * Get a list of all the image elements.
   * 
   * @param xml
   * @return
   */
  private NodeList getImageElements (String xml) {
    Document document = XmlUtils.createDocument (xml);
    return XmlUtils.getNodeListByPath (document, "//FileSpec|//Image");
  }

}
