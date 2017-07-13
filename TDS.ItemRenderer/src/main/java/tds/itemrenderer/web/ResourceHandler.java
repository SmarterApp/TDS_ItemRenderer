/*******************************************************************************
 * Educational Online Test Delivery System Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.web;

import java.io.File;
import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import AIR.Common.Web.FileFtpHandler;
import AIR.Common.Web.StaticFileHandler2;
import AIR.Common.Web.StaticFileHandler3;
import AIR.Common.Web.UrlHelper;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;

import tds.itemrenderer.configuration.RendererSettings;
import tds.itemrenderer.repository.ContentRepository;

import AIR.Common.Configuration.ConfigurationSection;
import AIR.Common.Utilities.Path;
import AIR.Common.Utilities.SpringApplicationContext;
import AIR.Common.Utilities.UrlEncoderDecoderUtils;
import AIR.Common.Web.EncryptionHelper;
import AIR.Common.Web.FileHttpHandler;
import AIR.Common.Web.Session.CaseInsensitiveFileNameFilter;
import TDS.Shared.Exceptions.TDSHttpException;
import org.springframework.web.context.support.SpringBeanAutowiringSupport;

/**
 * @author mpatel
 * 
 */

public class ResourceHandler extends FileHttpHandler
{
  private static Map<String, Boolean> _validExtensions  = new HashMap<String, Boolean> ();
  private static final Logger         _logger           = LoggerFactory.getLogger (ResourceHandler.class);
  private static boolean              _blackboxSecurity = false;

  @Autowired
  private static ConfigurationSection _appSettings;

  @Autowired
  private ContentRepository contentRepository;

  @Override
  public void init() throws ServletException {
    SpringBeanAutowiringSupport.processInjectionBasedOnCurrentContext (this);
  }

  static {
    // set valid extensions (anything else will be rejected)
    // TODO: Add this to web.config

    // IMAGES:
    _validExtensions.put ("png", true);
    _validExtensions.put ("jpg", true);
    _validExtensions.put ("gif", true);
    _validExtensions.put ("svg", true);

    // AUDIO:
    _validExtensions.put ("ogg", true); // Ogg Vorbis
    _validExtensions.put ("mp3", true); // MP3
    _validExtensions.put ("aac", true); // AAC
    _validExtensions.put ("m4a", true); // AAC

    // VIDEO:
    _validExtensions.put ("swf", true); // Flash
    _validExtensions.put ("flv", true); // Flash
    _validExtensions.put ("mp4", true); // H.264 (video/mp4)
    _validExtensions.put ("m4v", true); // H.264 (video/x-m4v)
    _validExtensions.put ("mov", true); // H.264 (video/quicktime)
    _validExtensions.put ("f4v", true); // H.264
    _validExtensions.put ("3gp", true); // 3GPP
    _validExtensions.put ("3g2", true); // 3GPP
    _validExtensions.put ("webm", true); // VP8/WebM

    // Closed Captions
    _validExtensions.put ("vtt", true); // WebVTT

    // APPLICATION:
    _validExtensions.put ("rtf", true);
    _validExtensions.put ("pdf", true);

    // HTML:
    _validExtensions.put ("htm", true);
    _validExtensions.put ("html", true);

    // check if blackbox security is enabled
    _appSettings = SpringApplicationContext.getBean ("appSettings", ConfigurationSection.class);
    String blackboxSecurity = _appSettings.get ("blackboxSecurity");
    _blackboxSecurity = (blackboxSecurity != null && blackboxSecurity.toUpperCase () == "TRUE");
  }

  public ResourceHandler () {
    // this._supportRanges = RendererSettings.getSupportHttpRanges ().getValue
    // ();
    this._supportRanges = _appSettings.getBoolean ("tds.itemRenderer.supportHttpRanges");
  }

  @Override
  public void staticFileHandler(HttpServletRequest request, HttpServletResponse response) throws TDSHttpException, IOException
  {
    String physicalPath = overrideExecuteUrlPath(request);
    if (_supportRanges) {
      byte[] bytes = contentRepository.findResource(physicalPath);

      // In order to display SVG files in an <img> tag, the browser needs to know the content type, where this isn't needed for other types
      if (physicalPath != null && physicalPath.toLowerCase().endsWith(".svg")) {
        response.setHeader("Content-Type", "image/svg+xml");
      }

      response.getOutputStream().write(bytes);
    } else {
      StaticFileHandler2.ProcessRequestInternal(request, response, physicalPath);
    }

  }

  // / <summary>
  // / Is logging enabled
  // / </summary>
  protected boolean isLoggingEnabled () {
    boolean value = false;
    String stringValue = _appSettings.get ("DebugResourceHandler");
    if (!StringUtils.isEmpty (stringValue)) {
      value = Boolean.parseBoolean (stringValue);
    }
    return value;
  }

  // / <summary>
  // / Returns the phsyical file path for this resource.
  // / </summary>
  // / <remarks>
  // / You cannot use IIS since ITS files are outside of the virtual directory.
  // / </remarks>
  public String overrideExecuteUrlPath (HttpServletRequest request) throws TDSHttpException {
    // decode the path (e.x., "c:\content\")
    String pathEncoded = request.getParameter ("path");

    // Start Hack: Path! Sajib/Shiva: At this point the path is already decoded
    // as the
    // decoding is implicitly handled
    // by the ServletContainer. Our EncryptionHelper.DecryptFromBase64 on the
    // other hand expects a
    // encoded string. So as to keep logic intact in EncryptionHelper as that is
    // used by other classes
    // we will just go ahead and encoded the String again.
    /*
     * paths that have a"+" are a problem as Tomcat is interpreting that as a
     * space. I do not know if .NET is doing the same thing but obviously this
     * is not a problem with .NET. For example the path parameter from
     * "http://localhost:8081/frontendmerge/Pages/API/Resources.axd?path=avWcDZSH6J6NOoooA99UzLIk2lm9BeVn+PYXkv2cxmuyiCCvR3EF4QrR4ACTpAotcZupvJZXL7niEwVXxjNjjw==&file=passage_3735_v5_3735_audio1.ogg"
     * gets a whitespace in between.
     * 
     * I am going to put in a "+" for every whitespace I see before encoding. I
     * need to do it before encoding as a whitespace will get translated to %20,
     * thus changing its meaning.
     * 
     * This fix may not work in all cases and we will need to revisit this.
     */
    pathEncoded = pathEncoded.replace (' ', '+');
    pathEncoded = UrlEncoderDecoderUtils.encode (pathEncoded);
    // End Hack: Path

    if (StringUtils.isEmpty (pathEncoded)) {
      throw new TDSHttpException (HttpStatus.BAD_REQUEST.value (), "Path name not found.");
    }
    String pathDecoded;
    if (RendererSettings.getIsEncryptionEnabled ()) {
      pathDecoded = EncryptionHelper.DecryptFromBase64 (pathEncoded);
    } else {
      pathDecoded = EncryptionHelper.DecodeFromBase64 (pathEncoded);
    }

    // check if we were able to decode the path
    if (StringUtils.isEmpty (pathDecoded)) {
      throw new TDSHttpException (HttpStatus.BAD_REQUEST.value (), "Path decoded is empty.");
    }

    // get file name (e.x., "Item_18_v4_graphic1_png256.png")
    String file = request.getParameter ("file");

    // check if we have the file name
    if (StringUtils.isEmpty (file)) {
      throw new TDSHttpException (HttpStatus.BAD_REQUEST.value (), "File name not found.");
    }

    // check if the file has a valid extension
    String fileExt = Path.getExtension (file);

    if (fileExt == null || !_validExtensions.containsKey (fileExt.toLowerCase ())) {
      throw new TDSHttpException (HttpStatus.UNSUPPORTED_MEDIA_TYPE.value (), "Unsupported file extension.");
    }

    // check if valid url
    if (_blackboxSecurity)
      ValidateSecurity ();

    // now work on getting the full physical path that will be returned
    String physicalPath = null;

    // get generic alt tag (e.x., "ESN")
    String altTag = request.getParameter ("tag");

    // check if the tag is valid (to be on safe side ignore /, \ and .)
    boolean validTag = (!StringUtils.isEmpty (altTag) && !altTag.contains ("/") && !altTag.contains ("\\") && !altTag.contains ("."));

    // alternate tag? calculate the postfix to append to a filename and check if
    // the file exists
    if (validTag) {
      // build alt path
      StringBuilder altPath = new StringBuilder ();
      altPath.append (Path.getFileNameWithoutExtension (file));
      altPath.append ("_");
      altPath.append (altTag);
      altPath.append ("." + Path.getExtension (file));
      String fixedPath = CaseInsensitiveFileNameFilter.getFile (pathDecoded, altPath.toString ());
      // check if file exists (otherwise we will ignore this path)
      if (new File (pathDecoded + fixedPath).exists ()) {
        physicalPath = pathDecoded + fixedPath;
      }
    }

    if (StringUtils.isEmpty (physicalPath))
    {
      file = CaseInsensitiveFileNameFilter.getFile (pathDecoded, file);
      physicalPath = pathDecoded + file;
    }
    _logger.info ("ResourceHandler: " + physicalPath);
    return physicalPath;
  }

  // / <summary>
  // / This function is for validating blackbox security
  // / </summary>
  private boolean ValidateSecurity () {
    return true;
  }

}
