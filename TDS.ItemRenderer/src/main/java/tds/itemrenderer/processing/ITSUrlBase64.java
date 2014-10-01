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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.bind.DatatypeConverter;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;

import tds.itemrenderer.configuration.ITSConfig;
import AIR.Common.Utilities.Path;
import AIR.Common.Web.EncryptionHelper;
import AIR.Common.Web.UrlHelper;

/**
 * 
 * @author jmambo
 * 
 */
public class ITSUrlBase64 extends IITSResolver
{

  private final String _filePath;
  private final String _baseUrl;
  private boolean      _enableEncryption;
  private String       _additionalParameters;

  public ITSUrlBase64 (String filePath)
  {
    _filePath = filePath;
    _baseUrl = getUrl ();
  }

  /**
   * Gets the base URL path that is used to make HTTP request
   * 
   * @return base URL
   */
  private String getBaseUrl ()
  {
    
    // ITSConfig.ImagePath: e.x., Image?path={0}&amp;file=

    // e.x., /TDS_Preview/Image?path={0}&file=
    String urlPath = UrlHelper.resolveUrl (ITSConfig.getResourcePath ());

    // check if should lower case path
    if (ITSConfig.getResourceFix ())
    {
      // this was some ITS request from a while ago
      urlPath = urlPath.toLowerCase ();
    }

    // check if should add additional queryString parameters
    if (!StringUtils.isEmpty (_additionalParameters))
    {
      int idx = urlPath.indexOf ('?');

      if (idx > 0)
      {
        // make sure ends with &
        if (!_additionalParameters.endsWith ("&"))
        {
          _additionalParameters = _additionalParameters + "&";
        }

        // insert addition queryString parameters
        urlPath = new StringBuilder (urlPath).insert (idx + 1, _additionalParameters).toString ();
      }
    }

    // MATHML: Need to use html entity for '&'
    /*
     * if (urlPath.Contains("&file")) { urlPath = urlPath.Replace("&file",
     * "&amp;file"); }
     */

    return urlPath;
  }

  /**
   * Gets the base file path (encrypted) where the XML and resources reside.
   * 
   * @return base path
   */
  private String getBasePath ()
  {
    // e.x., C:\TDS_Content\oaks\Bank-131\Items\Item-131-100174\
    String basePath = _filePath.replace (Path.getFileName (_filePath), "");

    // encrypt the basePath
    if (_enableEncryption)
    {
      basePath = EncryptionHelper.EncryptToBase64 (basePath);
    }
    else
    {
      basePath = EncryptionHelper.EncodeToBase64 (basePath);
    }

    // e.x.,
    // QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0
    return basePath;
  }

  /**
   * Gets the fully formatted URL ready to assign a file to the end of it.
   * 
   * @return formatted URL
   */
  private String getUrl ()
  {
    // e.x., /TDS_Preview/Image.axd?path={0}&file=
    String baseUrl = getBaseUrl ();

    // NOTE: The url can be NULL if we are not running this renderer in the
    // context of a web page
    if (StringUtils.isEmpty (baseUrl))
      return null;

    // e.x.,
    // QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0
    String basePath = getBasePath ();

    // e.x.,
    // /TDS_Preview/Image.axd?path=QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0&file=
    return String.format (baseUrl, basePath);
  }

  /**
   * 
   * @param matcher
   * @return
   */
  private String replaceHtmlMatch (Matcher matcher)
  {
    String basePath = _filePath.replace (Path.getFileName (_filePath), "");
    String imageFile = matcher.group ("src");
    String imagePath = Path.combine (basePath, imageFile);

    byte[] binaryData = null;
    try {
      binaryData = FileUtils.readFileToByteArray (new File (imagePath));
    } catch (IOException e) {
       throw new ITSDocumentProcessingException (e);
    }

    final String base64Format = "data:image/%s;base64,%s";
    String extension = Path.getExtension (imageFile).replace (".", "");
    String base64 = String.format (base64Format, extension, DatatypeConverter.printBase64Binary (binaryData));

    String imageTag = matcher.group ("img");

    Matcher matcher2 = matcher.pattern ().matcher (imageTag);
    StringBuilder sb = new StringBuilder (imageTag);
    matcher2.find ();
    return sb.replace (matcher2.start (2), matcher2.end (2), base64).toString ();

  }

  /**
   * Return the images links in a given URL as an array of Strings.
   * 
   * @param html
   * @param tag
   * @param attribute
   * @return String array of all images on a page
   */
  private String replaceHtmlMatches (String html, String tag, String attribute)
  {
    final String tagPattern = "(?s)(?<" + tag + "><" + tag + "\\s[^>]*?" + attribute + "\\s*=\\s*['\\\"](?<" + attribute + ">[^'\\\"]*?)['\\\"][^>]*?>)";
    Pattern pattern = Pattern.compile (tagPattern, Pattern.CASE_INSENSITIVE);
    Matcher matcher = pattern.matcher (html);
    StringBuffer sb = new StringBuffer ();
    while (matcher.find ()) {
      matcher.appendReplacement (sb, replaceHtmlMatch (matcher));
    }
    matcher.appendTail (sb);

    return sb.toString ();

  }

  /**
   * Sets the URL for images and links (e.x., ELPA audio).
   * 
   * @param content
   *          HTML to fix
   */
  public String resolveResourceUrls (String content)
  {
    return replaceHtmlMatches (content, "img", "src");
  }

  /**
   * Sets the URL for images for a grid item.
   * 
   * @param content
   *          FileSpec to fix
   * @param language
   *          Optional language (leave NULL if none)
   * 
   */
  public String resolveGridXmlUrls (String content, String language)
  {
    // make sure there is HTML
    if (StringUtils.isEmpty (content))
      return content;

    // check for page object, without this there is no URL to resolve since we
    // aren't in the context of a website.
    if (StringUtils.isEmpty (_baseUrl))
      return content;

    String url = _baseUrl;

    // fix image path
    if (!url.contains("&amp;")) { 
       url = url.replace ("&", "&amp;");
    }
    // add language to url if it is not english
    if (!StringUtils.isEmpty (language) && language.toUpperCase () != "ENU")
    {
      url = url.replace ("path=", "tag=" + language + "&amp;path=");
    }

    String fixedContent = content.replace ("<FileSpec>", "<FileSpec>" + url);

    return fixedContent;
  }

}
