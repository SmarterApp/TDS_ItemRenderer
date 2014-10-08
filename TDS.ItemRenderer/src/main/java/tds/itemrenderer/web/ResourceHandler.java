/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.web;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import AIR.Common.Configuration.ConfigurationSection;
import AIR.Common.Utilities.Path;
import AIR.Common.Utilities.SpringApplicationContext;
import AIR.Common.Web.EncryptionHelper;
import AIR.Common.Web.FileHttpHandler;
import TDS.Shared.Exceptions.TDSHttpException;

/**
 * @author mpatel
 *
 */

public class ResourceHandler extends FileHttpHandler
{
  private static Map<String, Boolean> _validExtensions = new HashMap<String, Boolean>();
  private static final Logger _logger = LoggerFactory.getLogger (ResourceHandler.class);
  private static  boolean _blackboxSecurity = false;

  @Autowired
  private static ConfigurationSection _appSettings;
  
  static
  {
      // set valid extensions (anything else will be rejected)
      // TODO: Add this to web.config
      
      // IMAGES:
      _validExtensions.put("png", true);
      _validExtensions.put("jpg", true);
      _validExtensions.put("gif", true);
      
      // AUDIO:
      _validExtensions.put("ogg", true); // Ogg Vorbis
      _validExtensions.put("mp3", true); // MP3
      _validExtensions.put("aac", true); // AAC 
      _validExtensions.put("m4a", true); // AAC

      // VIDEO:
      _validExtensions.put("swf", true); // Flash
      _validExtensions.put("flv", true); // Flash
      _validExtensions.put("mp4", true); // H.264 (video/mp4)
      _validExtensions.put("m4v", true); // H.264 (video/x-m4v)
      _validExtensions.put("mov", true); // H.264 (video/quicktime)
      _validExtensions.put("f4v", true); // H.264
      _validExtensions.put("3gp", true); // 3GPP
      _validExtensions.put("3g2", true); // 3GPP
      _validExtensions.put("webm", true); // VP8/WebM

      // APPLICATION:
      _validExtensions.put("rtf", true);
      _validExtensions.put("pdf", true);

      // HTML:
      _validExtensions.put("htm", true);
      _validExtensions.put("html", true);

      // check if blackbox security is enabled
      _appSettings = SpringApplicationContext.getBean ("appSettings",ConfigurationSection.class);
      String blackboxSecurity = _appSettings.get ("blackboxSecurity");
      _blackboxSecurity = (blackboxSecurity != null && blackboxSecurity.toUpperCase () == "TRUE");
  }

  public ResourceHandler()
  {
//      this._supportRanges = RendererSettings.getSupportHttpRanges ().getValue ();
        this._supportRanges =  _appSettings.getBoolean ("tds.itemRenderer.supportHttpRanges");
  }

  /// <summary>
  /// Is logging enabled
  /// </summary>
  protected boolean isLoggingEnabled()
  {
      boolean value = false;
      String stringValue = _appSettings.get ("DebugResourceHandler");
      if (!StringUtils.isEmpty (stringValue)) {
        value = Boolean.parseBoolean (stringValue);
      }
      return value;
  }

  /// <summary>
  /// Returns the phsyical file path for this resource.
  /// </summary>
  /// <remarks>
  /// You cannot use IIS since ITS files are outside of the virtual directory.
  /// </remarks>
  public String overrideExecuteUrlPath(HttpServletRequest request) throws TDSHttpException
  {
      // decode the path (e.x., "c:\content\")
      String pathEncoded = request.getParameter("path");
      
      if (StringUtils.isEmpty (pathEncoded))
      {
          throw new TDSHttpException(HttpStatus.BAD_REQUEST.value (), "Path name not found.");
      }
      
      String pathDecoded = EncryptionHelper.DecodeFromBase64(pathEncoded);

      // check if we were able to decode the path
      if (StringUtils.isEmpty(pathDecoded))
      {
          throw new TDSHttpException(HttpStatus.BAD_REQUEST.value (), "Path decoded is empty.");
      }
      
      // get file name (e.x., "Item_18_v4_graphic1_png256.png")
      String file = request.getParameter("file"); 

      // check if we have the file name
      if (StringUtils.isEmpty(file))
      {
          throw new TDSHttpException(HttpStatus.BAD_REQUEST.value (), "File name not found.");
      }

      // check if the file has a valid extension
      String fileExt = Path.getExtension(file);

      if (fileExt == null || !_validExtensions.containsKey(fileExt.toLowerCase ()))
      {
          throw new TDSHttpException( HttpStatus.UNSUPPORTED_MEDIA_TYPE.value (), "Unsupported file extension.");
      }

      // check if valid url
      if (_blackboxSecurity) ValidateSecurity();

      // now work on getting the full physical path that will be returned
      String phsyicalPath = null;

      // get generic alt tag (e.x., "ESN")
      String altTag = request.getParameter("tag");

      // check if the tag is valid (to be on safe side ignore /, \ and .)
      boolean validTag = (!StringUtils.isEmpty(altTag) && !altTag.contains("/") && !altTag.contains("\\") && !altTag.contains("."));
      
      // alternate tag? calculate the postfix to append to a filename and check if the file exists
      if (validTag)
      {
          // build alt path
          StringBuilder altPath = new StringBuilder();
          altPath.append(pathDecoded);
          altPath.append(Path.getFileNameWithoutExtension(file));
          altPath.append("_");
          altPath.append(altTag);
          altPath.append(Path.getExtension(file));

          // check if file exists (otherwise we will ignore this path)
          if (new File(altPath.toString()).exists ())
          {
              // alt tagged file exists we will use this
              phsyicalPath = altPath.toString();
          }
      }

      // if no path is currently set then use the file name as is
      if (StringUtils.isEmpty (phsyicalPath))
      {
          // get the full physical path
          phsyicalPath = pathDecoded + file;
      }

      _logger.info ("ResourceHandler: " + phsyicalPath);

      return phsyicalPath;
  }

  /// <summary>
  /// This function is for validating blackbox security
  /// </summary>
  private boolean ValidateSecurity()
  {
      return true;
  }

}
