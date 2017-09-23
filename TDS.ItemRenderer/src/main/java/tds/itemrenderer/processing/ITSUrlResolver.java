/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import AIR.Common.Utilities.Path;
import AIR.Common.Web.EncryptionHelper;
import AIR.Common.Web.UrlHelper;
import TDS.Shared.Security.IEncryption;
import org.apache.commons.lang3.StringUtils;

import java.net.URI;
import java.net.URISyntaxException;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.List;

import tds.itemrenderer.configuration.ITSConfig;
import tds.itemrenderer.configuration.RendererSettings;

/**
 * @author jmambo
 * 
 */
public class ITSUrlResolver {
  protected final String _filePath;
  protected final String _baseUrl;
  private final List<String> _parsedFiles = new ArrayList<String>();
  private final boolean encryptionEnabled;
  private final IEncryption encryption;

  public ITSUrlResolver(final String filePath) {
    this(filePath, RendererSettings.getIsEncryptionEnabled());
  }

  public ITSUrlResolver(final String filePath, final boolean encryptionEnabled) {
    _filePath = filePath;
    this.encryptionEnabled = encryptionEnabled;
    _baseUrl = getUrl(getBaseUrl());
    encryption = null;
  }

  /**
   * Constructs an {@link tds.itemrenderer.processing.ITSUrlResolver} object
   *
   * @param filePath The filepath to resolve
   * @param encryptionEnabled flag indicating whether encryption is enabled
   * @param contextPath The path of the host calling the endpoint requiring url resolution
   * @param encryption (optional) encryption algorithm implementation
   */
  public ITSUrlResolver(final String filePath, final boolean encryptionEnabled, final String contextPath, final IEncryption encryption) {
    _filePath = filePath;
    this.encryptionEnabled = encryptionEnabled;
    this.encryption = encryption;
    _baseUrl = getUrl(getBaseUrl(contextPath));
  }

  /**
   * Add parsed media file
   *
   * @param fileName
   */
  protected void addParsedMediaFile(String fileName) {
    String basePath = _filePath.replace(Path.getFileName(_filePath), "");
    String filePath = Path.combine(basePath, fileName);

    if (!_parsedFiles.contains(fileName)) {
      _parsedFiles.add(filePath);
    }
  }

  /**
   * Gets parsed media files
   *
   * @return parsed files
   */
  public List<String> getParsedMediaFiles() {
    return _parsedFiles;
  }

  private String getBaseUrl() {
    // ITSConfig.ResourcePath: e.x., Resources?path={0}&amp;file=
    // TDS_Preview/Resources?path={0}&file=
    String urlPath = UrlHelper.resolveUrl(ITSConfig.getResourcePath());

    // check if should lower case path
    if(ITSConfig.getResourceFix()) {
      // this was some ITS request from a while ago
      urlPath = urlPath.toLowerCase();
    }
    return urlPath;
  }

  /**
   * Get the base URL path that is used to make HTTP request
   * 
   * @return base URL
   */
  private String getBaseUrl(String contextPath)
  {
    // ITSConfig.ResourcePath: e.x., Resources?path={0}&amp;file=
    // TDS_Preview/Resources?path={0}&file=
    String urlPath = resolveUrl (contextPath, ITSConfig.getResourcePath ());

    // check if should lower case path
    if (ITSConfig.getResourceFix ())
    {
      // this was some ITS request from a while ago
      urlPath = urlPath.toLowerCase ();
    }
    return urlPath;
  }

  /**
   * If the path is an absolute url, returns the path.
   * Otherwise, create a relative path given this webapp's context.
   * @see javax.servlet.ServletContext#getContextPath
   *
   * note: sanitizing path which may contain a leading tilda
  */
  private static String resolveUrl(final String contextPath, final String path) {
    try {
      final URI uri = new URI(path);
      if (uri.isAbsolute()) {
        return path;
      }
    } catch (URISyntaxException e) {}

    if (StringUtils.isBlank(path)) {
      return String.format("%s/", contextPath);
    } else {
      String relativePath = StringUtils.removeStart(path, "~/");
      relativePath = StringUtils.removeStart(relativePath, "/");

      return String.format("%s/%s", contextPath, relativePath);
    }
  }

  /**
   * Resolve file path
   * 
   * @return resolved file path
   */
  protected String resolveFilePath () {
    return resolveFilePath ("");
  }

  /**
   * Resolve a file name to the base path.
   * 
   * @param fileName
   * @return resolved file path
   */
  protected String resolveFilePath (String fileName) {
    // e.x., C:\TDS_Content\oaks\Bank-131\Items\Item-131-100174\
    return _filePath.replace (Path.getFileName (_filePath), fileName);
  }

  /**
   * Gets the base file path (encrypted) where the XML and resources reside.
   * 
   * @return base path
   */
  private String getBasePath () {
    // e.x., C:\TDS_Content\oaks\Bank-131\Items\Item-131-100174\
    String basePath = _filePath.replace (Path.getFileName (_filePath), "");

    // encrypt the basePath
    if (encryptionEnabled)
    {
      basePath = encryption == null
          ? EncryptionHelper.EncryptToBase64 (basePath)
          : EncryptionHelper.EncryptToBase64 (basePath, encryption);
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
   * @return URL
   */
  protected String getUrl (String baseUrl) {
    // if this is a url then return the base
    if (UrlHelper.IsHttpProtocol (_filePath))
    {
      String urlFile = Path.getFileName (_filePath);
      return _filePath.replace (urlFile, "");
    }


    // NOTE: The url can be NULL if we are not running this renderer in the
    // context of a web page
    if (StringUtils.isEmpty (baseUrl)) {
      return null;
    }

    // e.x.,
    // QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0
    String basePath = getBasePath ();

    // e.x.,
    // /TDS_Preview/Image.axd?path=QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0&file=
    return MessageFormat.format (baseUrl, basePath);
  }

  /**
   * Sets the URL for images and links (e.x., ELPA audio).
   * 
   * @param content
   *          HTML to fix
   * @return resolved resource URLs
   */
  public String resolveResourceUrls (String content) {
    // make sure there is HTML
    if (StringUtils.isEmpty (content))
      return content;

    // check for page object, without this there is no URL to resolve since we
    // aren't in the context of a website.
    if (StringUtils.isEmpty (_baseUrl))
      return content;

    // e.x., <img class="Image"
    // src="/TDS_Preview/Image.axd?path=QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0&file=item_100174_v2_graphics2_png16.png"
    // />

    // fix image path
    String fixedContent = content.replace ("src=\"\"", "src=\"\"" + _baseUrl);

    // add image class and onload variables
    // fixedContent = fixedContent.Replace("<img ",
    // "<img class=\"Image\" onload=\"this.state = 1;\" onabort=\"this.state = 2;\" onerror=\"this.state = 3;\" ");
    fixedContent = fixedContent.replace ("<img ", "<img class=\"Image\" ");

    // fix anchor path
    fixedContent = fixedContent.replace ("<a href=\"\"", "<a href=\"\"" + _baseUrl);

    return fixedContent;
  }

  /**
   * Resolve URL
   * 
   * e.g., "C:\temp\Stim-159-76\ASL_888_999_stem.mp4" becomes
   * "tds_2012/Pages/API/Resources.axd?path=QzpcVERTX0NvbnRlbnRcb2Frc1xCYW5rLTEzMVxJdGVtc1xJdGVtLTEzMS0xMDAxNzRc0&file=ASL_888_999_stem.mp4"
   * note that this one does not operate on the XML (since the file has already
   * been parsed). It expects the filename only.
   * 
   * @param filePath
   * @return resolved URL
   */
  public String resolveUrl (String filePath) {
    // make sure there is a file name there
    if (StringUtils.isEmpty (filePath)) {
      return filePath;
    }

    // Make sure we know the path of the file
    if (StringUtils.isEmpty (_baseUrl)) {
      return filePath;
    }

    // fix image path
    String fixedPath = _baseUrl + Path.getFileName (filePath);

    return fixedPath;
  }

  /**
   * Sets the URL for images for a grid item.
   * 
   * @param content
   *          FileSpec to fix
   * @param language
   *          Optional language (leave NULL if none)
   * @return resolved Grid XML URLs
   */
  public String resolveGridXmlUrls (String content, String language) {
    // make sure there is HTML
    if (StringUtils.isEmpty (content)) {
      return content;
    }

    // check for page object, without this there is no URL to resolve since we
    // aren't in the context of a website.
    if (StringUtils.isEmpty (_baseUrl)) {
      return content;
    }

    // make copy of url for modification
    String url = _baseUrl;

    // fix image path
    if (!url.contains ("&amp;")) {
      url = url.replace ("&", "&amp;");
    }
    // add language to url if it is not english
    if (!StringUtils.isEmpty (language) && language.toUpperCase () != "ENU")
    {
      url = url.replace ("path=", "tag=" + language + "&amp;path=");
    }

    String fixedContent = content.replace ("<FileSpec>", "<FileSpec>" + url); // background/palette
                                                                              // images
    fixedContent = fixedContent.replace ("<Image src=\"", "<Image src=\"" + url); // region
                                                                                  // images

    return fixedContent;
  }

  /**
   * Resolve Spec XML URLs
   * 
   * @param content
   * @param language
   * @return resolved Spec XML URLs
   */
  public String resolveSpecXmlUrls (String content, String language) {
    // make sure there is HTML
    if (StringUtils.isEmpty (content)) {
      return content;
    }

    // check for page object, without this there is no URL to resolve since we
    // aren't in the context of a website.
    if (StringUtils.isEmpty (_baseUrl)) {
      return content;
    }

    // make copy of url for modification
    String url = _baseUrl;

    // fix image path
    if (!url.contains ("&amp;")) {
      url = url.replace ("&", "&amp;");
    }
    // SPEC: simulator
    if (content.contains ("<simulationItem"))
    {
      // HACK: Check for QTI itemBody because for QTI we already processed src
      // attribute.
      if (!content.contains ("<itemBody"))
      {
        content = content.replace ("src=\"", "src=\"" + url);
      }

      content = content.replace ("image=\"", "image=\"" + url);
      content = content.replace ("deleteRowImage=\"", "deleteRowImage=\"" + url);
      content = content.replace ("flash=\"", "flash=\"" + url);
      content = content.replace ("altSrc=\"", "altSrc=\"" + url);
    }

    // SB-1128
    // https://bugz.airast.org/kiln/Review/K3631
    // SPEC: scratchpad
    else if (content.contains ("<scratchpad"))
    {
      content = content.replace ("<backgroundImage>", "<backgroundImage>" + url);
    }
    else if (content.contains ("<Question")) // SPEC: grid
    {
      content = resolveGridXmlUrls (content, language);
    }

    return content;
  }

  /**
   * 
   * Resolve QTI XML URLs
   * 
   * @param content
   * @param language
   * @return resolved QTI XML URLs
   */
  public String resolveQTIXmlUrls (String content, String language) {
    // make copy of url for modification
    String url = _baseUrl;

    // fix image path
    if (!url.contains ("&amp;")) {
      url = url.replace ("&", "&amp;");
    }

    // fix src attribute (images <img> and audio <source>)
    String fixedContent = content.replace (" src=\"", " src=\"" + url);
    return fixedContent;
  }

}
