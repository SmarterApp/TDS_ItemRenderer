/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;

import javax.xml.stream.XMLEventReader;
import javax.xml.stream.XMLInputFactory;
import javax.xml.stream.XMLStreamException;
import javax.xml.stream.events.XMLEvent;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tds.itemrenderer.configuration.ITSConfig;
import tds.itemrenderer.configuration.ReplacementPathElement;
import AIR.Common.Helpers._Ref;
import AIR.Common.Utilities.Path;
import AIR.Common.Web.FileFtpHandler;
import AIR.Common.xml.TdsXmlInputFactory;

/**
 * 
 * Static helper functions for dealing with ITS documents.
 * 
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class ITSDocumentHelper
{
  private static Logger _logger = LoggerFactory.getLogger (ITSDocumentHelper.class);

  /**
   * Get manual path replacement (used mostly for local dev work)
   * 
   * @param filePath
   * @return
   */
  public static String getReplacementPath (String filePath) {
    ReplacementPathElement replacementPath = ITSConfig.getReplacementPath ();

    if (replacementPath != null && !StringUtils.isEmpty (replacementPath.getMatch ()) && !StringUtils.isEmpty (replacementPath.getReplacement ())) {
      // replace only in the begining. this works because we are using
      // replaceOnce
      if (filePath.startsWith (replacementPath.getMatch ()))
        filePath = StringUtils.replaceOnce (filePath, replacementPath.getMatch (), replacementPath.getReplacement ());
    }

    return filePath;
  }

  /**
   * Create a URI from a url String.
   * 
   * @param uriString
   * @return URI
   * @throws ITSDocumentProcessingException
   */
  public static URI createUri (String uriString) throws ITSDocumentProcessingException {
    uriString = getReplacementPath (uriString);
    try {
      if (uriString.startsWith ("file:/") || uriString.startsWith ("ftp:/")) {
        return new URI (uriString);
      } else {
        return new File (uriString).toURI ();
      }
    } catch (URISyntaxException e) {
      throw new ITSDocumentProcessingException (e);
    }
  }

  /**
   * Gets contents from specified URI
   * 
   * @param uri
   * @return contents as InputStream
   * @throws IOException
   */
  public static InputStream getStream (URI uri) throws IOException {
    // check if ftp
    if ("ftp".equals (uri.getScheme ())) {
      return new ByteArrayInputStream (FileFtpHandler.getBytes (uri));
    }
    // otherwise file
    return new ByteArrayInputStream (FileUtils.readFileToByteArray (new File (uri.getPath ())));

  }

  /**
   * Gets contents from specified URI string
   * 
   * @param uriString
   * @return contents as InputStream
   * @throws IOException
   */
  public static InputStream getStream (String uriString) {
    URI uri = createUri (uriString);
    try {
      return getStream (uri);
    } catch (IOException e) {
      throw new ITSDocumentProcessingException (e);
    }
  }

  /**
   * Gets contents from specified URI string
   * 
   * @param uriString
   * @return contents as String
   * @throws IOException
   */
  public static String getContents (URI uri) {
    if ("ftp".equals (uri.getScheme ())) {
      return new String (FileFtpHandler.getBytes (uri), StandardCharsets.UTF_8);
    }
    // otherwise file
    try {
      return FileUtils.readFileToString (new File (uri.getPath ()));
    } catch (IOException e) {
      throw new ITSDocumentProcessingException (e);
    }
  }

  /**
   * Get the original Uri String from Uri object.
   * 
   * @param uri
   * @return
   */
  public static String getUriOriginalString (URI uri) {
    String orgStr = null;
    if (StringUtils.equalsIgnoreCase ("file", uri.getScheme ())) {
      orgStr = uri.getPath ();
    } else {
      orgStr = uri.toString ();
    }
    if (orgStr.toLowerCase ().startsWith ("/c") || orgStr.startsWith ("\\c")) {
      orgStr = orgStr.substring (1);
    }
    _logger.info ("getUriOriginalString(): in-" + uri.toString () + ", out-" + orgStr);
    return orgStr;
  }

  /**
   * check if URI scheme is ftp
   * 
   * @param uri
   * @return true if URL schemr is FTP
   */
  public static boolean isFtp (URI uri) {
    // check if ftp
    if ("ftp".equals (uri.getScheme ())) {
      return true;
    }
    return false;
  }

  /**
   * Check if a file exists.
   * 
   * @param path
   * @return true if file exist
   */
  public static boolean exists (_Ref<String> path) {
    URI uri = createUri (path.get ());

    // check if ftp
    if ("ftp".equals (uri.getScheme ())) {
      return FileFtpHandler.exists (uri);
    }

    if (Path.exists (path.get ()))
      return true;

    // SB-372 Remove after case sensitivity is fixed in content
    String dirName = Paths.get (path.get ()).getParent ().toString ();
    String fileName = Paths.get (path.get ()).getFileName ().toString ();
    File fileDir = new File (dirName);

    if (fileDir.list() != null && fileDir.list().length > 0) {
      for (String fileInDir : fileDir.list ()) {
        if (fileInDir.equalsIgnoreCase (fileName)) {
          path.set (path.get ().replace (fileName, fileInDir));
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Gets the root element of XML
   * 
   * @param uri
   * @return xml root element
   * @throws FileNotFoundException
   * @throws UnsupportedEncodingException
   * @throws XMLStreamException
   */
  public static String getRootElementName (URI uri) {
    XMLInputFactory inputFactory = TdsXmlInputFactory.newInstance ();
    try {
      InputStream input = null;
      String uriPath = getUriOriginalString (uri);
      if (isFtp (uri)) {
        input = new ByteArrayInputStream (FileFtpHandler.getBytes (uri));
      } else {
        input = new FileInputStream (uriPath);
      }
      XMLEventReader inputEventReader = inputFactory.createXMLEventReader (input);
      while (inputEventReader.hasNext ()) {
        XMLEvent event = inputEventReader.nextEvent ();
        if (event.isStartElement ()) {
          return event.asStartElement ().getName ().getLocalPart ();
        }
      }
    } catch (FileNotFoundException | XMLStreamException e) {
      throw new ITSDocumentProcessingException (e);
    }
    return null;
  }

}
