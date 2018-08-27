/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import TDS.Shared.Security.IEncryption;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import AIR.Common.Helpers._Ref;
import AIR.Common.Utilities.Path;
import AIR.Common.Web.BrowserParser;
import AIR.Common.Web.UrlHelper;

/**
 * @author jmambo
 *
 */
public class ITSUrlResolver2 extends ITSUrlResolver
{
  private static final Pattern _imgRegex;
  private static final Pattern _audioRegex;
  private static final Pattern _trackRegex;
  private static final Pattern _frameRegex;
  private static final Pattern _linkRegex;

  static {
      _imgRegex = createTagRegEx("img", "src");
      _audioRegex = createTagRegEx("source", "src");
      _trackRegex = createTagRegEx("track", "src");
      _frameRegex = createTagRegEx("iframe", "src");
      _linkRegex = createTagRegEx("a", "href");
  }

  private static Logger _logger = LoggerFactory.getLogger (ITSUrlResolver2.class);
  
  /**
   * Constructor
   * 
   * @param filePath
   */
  public ITSUrlResolver2(String filePath)  {
    super(filePath);
  }

    /**
     * Constructs an {@link tds.itemrenderer.processing.ITSUrlResolver2} object
     *
     * @param filePath The filepath to resolve
     * @param encryptionEnabled flag indicating whether encryption is enabled
     * @param contextPath The path of the host calling the endpoint requiring url resolution
     * @param encryption (optional) encryption algorithm implementation
     */
  public ITSUrlResolver2 (final String filePath, final boolean encryptionEnabled, final String contextPath, final IEncryption encryption) {
    super(filePath, encryptionEnabled, contextPath, encryption);
  }

  /**
   * Creates regular expression for tag
   * 
   * @param tagName
   * @param attribName
   * @return
   */
  private static Pattern createTagRegEx(String tagName, String attribName)
  {
      String tagPattern = "(?s)(<" + tagName + "\\s.*?" + attribName  +  "=\\\")([^\\\"]*)((?=\\\".*?((/>)|(>.*</" + tagName  + "))))";
      return Pattern.compile(tagPattern);
  }
 
  @Override
  public String resolveResourceUrls(String content) {
    // make sure there is HTML
    if (StringUtils.isEmpty(content)) return content;

    // check for page object, without this there is no URL to resolve since we aren't in the context of a website.
    if (StringUtils.isEmpty(_baseUrl)) return content;

    // replace resource url's
    content = resolveTag(content, _imgRegex.matcher(content), "img");
    content = resolveTag(content, _frameRegex.matcher(content), "iframe");
    content = resolveTag(content, _trackRegex.matcher(content), "track");
    content = resolveTag(content, _audioRegex.matcher(content), "source");
    content = resolveTag(content, _linkRegex.matcher(content), "a");

    return content;
  }

  private String resolveTag(String content, Matcher matcher, String tag) {
      StringBuffer sb = new StringBuffer ();
      while (matcher.find ()) {
         matcher.appendReplacement (sb, matcher.group(1) + fileMatch (tag, matcher.group(2)));
      }
      matcher.appendTail (sb);
      return sb.toString ();
  }

  /**
   * 
   * @param tagName
   * @param match
   * @return
   */
  protected String fileMatch(String tagName, String match)  {
      String fileName = match;

      // if already a http url then leave as is
      if (UrlHelper.IsHttpProtocol(fileName))
      {
          return fileName;
      }

      // HACK: replace ogg with m4a on some platforms
      if ("a".equalsIgnoreCase(tagName) && "ogg".equalsIgnoreCase(Path.getExtension(fileName)))
      {
          // uses user-agent detection
          fileName = audioSwapHack(fileName);
      }

      // add url to captured resources collection
      addParsedMediaFile(fileName);

      // return the base url along with the file name
      if (!_baseUrl.contains("&amp;")) { 
        String baseUrl = _baseUrl.replace("&", "&amp;");
        return baseUrl + fileName;
      } else {
        return _baseUrl + fileName;
      }
  }

  /**
   *  Try and replace an .ogg file with .mp4;
   *
   *  note:
   *  BrowserParser calls HttpContext.getCurrentContext().getUserAgent().
   *  ITSUrlResolver2 may not be running in a webapp with a user agent.
   * @param fileName
   * @return sound.m4a if file is found, otherwise the original sound.ogg name.
   */
  protected String audioSwapHack(String fileName)  {
      BrowserParser browser = new BrowserParser();

      // check if the browser does not support ogg
      if (!browser.isSupportsOggAudio())
      {
          String audioFile = Path.getFileNameWithoutExtension(fileName) + ".m4a";
          String audioFilePath = resolveFilePath(audioFile);
          _Ref<String> audioFilePathRef = new _Ref<String> (audioFilePath);

          if (ITSDocumentHelper.exists(audioFilePathRef))
          {
              audioFilePath = audioFilePathRef.get();
              audioFile = Paths.get(audioFilePath).getFileName().toString();
              return audioFile;
          }
      }

      return fileName;
  }
}
