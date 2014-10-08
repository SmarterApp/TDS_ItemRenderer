/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang3.StringUtils;

import tds.itemrenderer.configuration.ITSConfig;
import AIR.Common.Utilities.Path;
import AIR.Common.Web.EncryptionHelper;
import AIR.Common.Web.UrlHelper;

/**
 * @author jmambo
 *
 */
public class ITSUrlResolver
{

  protected final String _filePath;
  protected  final String _baseUrl;
  private boolean _enableEncryption;
  private String _additionalParameters;
  private final List<String> _parsedFiles = new ArrayList<String>();

  public ITSUrlResolver(String filePath)
  {
      _filePath = filePath;
      _baseUrl = getUrl();
  }

  /**
   * Add parsed media file
   * 
   * @param fileName
   */
  protected void addParsedMediaFile(String fileName)  {
      String basePath = _filePath.replace(Path.getFileName(_filePath), "");
      String filePath = Path.combine(basePath, fileName);

      if (!_parsedFiles.contains(fileName))
      {
          _parsedFiles.add(filePath);
      }
  }

  /**
   * Gets parsed media files
   * 
   * @return parsed files
   */
  public List<String> getParsedMediaFiles()  {
      return _parsedFiles;
  } 

  /**
   * Get the base URL path that is used to make HTTP request
   * 
   * @return base URL
   */
  private String getBaseUrl()
  {

      // ITSConfig.ResourcePath: e.x., Resources?path={0}&amp;file=
       //TDS_Preview/Resources?path={0}&file=
      String urlPath = UrlHelper.resolveUrl(ITSConfig.getResourcePath ());
     

      // check if should lower case path
      if (ITSConfig.getResourceFix ())
      {
          // this was some ITS request from a while ago
          urlPath = urlPath.toLowerCase(); 
      }

      // check if should add additional querystring paramters
      if (!StringUtils.isEmpty(_additionalParameters))
      {
          int idx = urlPath.indexOf('?');
          
          if (idx > 0)
          {
              // make sure ends with &
              if (!_additionalParameters.endsWith("&"))
              {
                _additionalParameters = _additionalParameters + "&";
              }
              
              // insert addition querystring parameters
             // urlPath = urlPath.Insert(idx + 1, _additionalParameters);
              urlPath =  new StringBuilder(urlPath).insert(idx + 1, _additionalParameters).toString();
          }
      }

      // MATHML: Need to use html entity for '&'
      /*
      if (urlPath.Contains("&file"))
      {
          urlPath = urlPath.Replace("&file", "&amp;file");
      }
      */

      return urlPath;
  }

  /**
   * Resolve file path
   * 
   * @return resolved file path
   */
  protected String resolveFilePath() {
     return resolveFilePath("");
  }

  /**
   * Resolve a file name to the base path.
   * 
   * @param fileName
   * @return resolved file path
   */
  protected String resolveFilePath(String fileName)  {
      // e.x., C:\TDS_Content\oaks\Bank-131\Items\Item-131-100174\
      return _filePath.replace(Path.getFileName(_filePath), fileName);
  }

  /**
   * Gets the base file path (encrypted) where the XML and resources reside.
   * 
   * @return base path
   */
  private String getBasePath()  {
      // e.x., C:\TDS_Content\oaks\Bank-131\Items\Item-131-100174\
      String basePath = _filePath.replace(Path.getFileName(_filePath), "");

      // encrypt the basePath
      if (_enableEncryption)
      {
          basePath = EncryptionHelper.EncryptToBase64(basePath);
      }
      else
      {
          basePath = EncryptionHelper.EncodeToBase64(basePath);
      }
      
      // e.x., QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0
      return basePath;
  }

  /**
   * Gets the fully formatted URL ready to assign a file to the end of it.
   * 
   * @return URL
   */
  protected String getUrl()  {
      // if this is a url then return the base
      if (UrlHelper.IsHttpProtocol(_filePath))
      {
          String urlFile = Path.getFileName(_filePath);
          return _filePath.replace(urlFile, "");
      }

      // e.x., /TDS_Preview/Image.axd?path={0}&file=
      String baseUrl = getBaseUrl();

      // NOTE: The url can be NULL if we are not running this renderer in the context of a web page
      if (StringUtils.isEmpty(baseUrl)) return null;
      
      // e.x., QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0
      String basePath = getBasePath();

      // e.x., /TDS_Preview/Image.axd?path=QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0&file=
      return MessageFormat.format(baseUrl, basePath);
  }

  /**
   * Sets the URL for images and links (e.x., ELPA audio).
   * 
   * @param content HTML to fix
   * @return resolved resource URLs
   */
  public String resolveResourceUrls(String content)  {
      // make sure there is HTML
      if (StringUtils.isEmpty(content)) return content;

      // check for page object, without this there is no URL to resolve since we aren't in the context of a website.
      if (StringUtils.isEmpty(_baseUrl)) return content;

      // e.x., <img class="Image" src="/TDS_Preview/Image.axd?path=QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0&file=item_100174_v2_graphics2_png16.png" />

      // fix image path
      String fixedContent = content.replace("src=\"\"", "src=\"\"" + _baseUrl);

      // add image class and onload variables
      // fixedContent = fixedContent.Replace("<img ", "<img class=\"Image\" onload=\"this.state = 1;\" onabort=\"this.state = 2;\" onerror=\"this.state = 3;\" ");
      fixedContent = fixedContent.replace("<img ", "<img class=\"Image\" ");

      // fix anchor path
      fixedContent = fixedContent.replace("<a href=\"\"", "<a href=\"\"" + _baseUrl);

      return fixedContent;
  }

  /**
   * Resolve URL
   * 
   * e.g., "C:\temp\Stim-159-76\ASL_888_999_stem.mp4"
   * becomes "tds_2012/Pages/API/Resources.axd?path=QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0&file=ASL_888_999_stem.mp4"
   * note that this one does not operate on the XML (since the file has 
   * already been parsed).  It expects the filename only.
   * 
   * @param filePath
   * @return resolved URL
   */
  public String resolveUrl(String filePath)  {
      // make sure there is a file name there
      if (StringUtils.isEmpty(filePath)) return filePath;

      // Make sure we know the path of the file
      if (StringUtils.isEmpty(_baseUrl)) return filePath;

      // fix image path
      String fixedPath = _baseUrl + Path.getFileName(filePath);

      return fixedPath;
  }

  /**
   * Sets the URL for images for a grid item.
   * 
   * @param content FileSpec to fix
   * @param language Optional language (leave NULL if none)
   * @return resolved Grid XML URLs
   */
  public String resolveGridXmlUrls(String content, String language)  {
      // make sure there is HTML
      if (StringUtils.isEmpty(content)) return content;

      // check for page object, without this there is no URL to resolve since we aren't in the context of a website.
      if (StringUtils.isEmpty(_baseUrl)) return content;

      // make copy of url for modification
      String url = _baseUrl;

      // fix image path
      if (!url.contains("&amp;")) {
          url = url.replace("&", "&amp;");
      }
      // add language to url if it is not english
      if (!StringUtils.isEmpty(language) && language.toUpperCase () != "ENU")
      {
          url = url.replace("path=", "tag=" + language + "&amp;path=");
      }

      String fixedContent = content.replace("<FileSpec>", "<FileSpec>" + url); // background/palette images
      fixedContent = fixedContent.replace("<Image src=\"", "<Image src=\"" + url); // region images

      return fixedContent;
  }

  /**
   * Resolve Spec XML URLs
   * 
   * @param content
   * @param language
   * @return resolved Spec XML URLs
   */
  public String resolveSpecXmlUrls(String content, String language)  {
      // make sure there is HTML
      if (StringUtils.isEmpty(content)) return content;

      // check for page object, without this there is no URL to resolve since we aren't in the context of a website.
      if (StringUtils.isEmpty(_baseUrl)) return content;

      // make copy of url for modification
      String url = _baseUrl;

      // fix image path
       if (!url.contains("&amp;")) {
         url = url.replace("&", "&amp;");
      }

      String fixedContent = content.replace("src=\"", "src=\"" + url);
      fixedContent = fixedContent.replace("image=\"", "image=\"" + url);
      fixedContent = fixedContent.replace("deleteRowImage=\"", "deleteRowImage=\"" + url);
      fixedContent = fixedContent.replace("flash=\"", "flash=\"" + url);
      fixedContent = fixedContent.replace("altSrc=\"", "altSrc=\"" + url);
      
      // SPEC: scratchpad
      fixedContent = fixedContent.replace("<backgroundImage>", "<backgroundImage>" + url);
      
      return fixedContent;
  }
 

  /**
   * 
   * Resolve QTI XML URLs
   *  
   * @param content
   * @param language
   * @return resolved QTI XML URLs
   */
  public String resolveQTIXmlUrls(String content, String language)  {
      // make copy of url for modification
     String url = _baseUrl;

      // fix image path
     if (!url.contains("&amp;")) {
        url = url.replace("&", "&amp;");
    }

      // fix src attribute (images <img> and audio <source>)
      String fixedContent = content.replace(" src=\"", " src=\"" + url);
      return fixedContent;
  }

  /**
   * Is Encryption enabled
   * 
   * @return true if encryption is enabled
   */
  public boolean isEnableEncryption () {
    return _enableEncryption;
  }

  /**
   * Sets enable encryption
   * 
   * @param enableEncryption
   */
  public void setEnableEncryption (boolean enableEncryption) {
    _enableEncryption = enableEncryption;
  }

  /**
   * Gets additional parameters
   * 
   * @return additional parameters
   */
  public String getAdditionalParameters () {
    return _additionalParameters;
  }

  /**
   * Sets additional Parameters
   * 
   * @param additionalParameters
   */
  public void setAdditionalParameters (String additionalParameters) {
    _additionalParameters = additionalParameters;
  }
  
}
