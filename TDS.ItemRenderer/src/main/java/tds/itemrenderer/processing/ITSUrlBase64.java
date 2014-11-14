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
import AIR.Common.Utilities.Path;



/**
 * 
 * @author jmambo
 * 
 */

/**
 * Used for resolving img tags into base64.
 * 
 * Remark: This is just for testing and is not production ready.
 */
public class ITSUrlBase64 extends ITSUrlResolver
{
  
  public ITSUrlBase64 (String filePath)
  {
	  super(filePath);
  }
  
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
  @Override
  public String resolveResourceUrls (String content)
  {
    return replaceHtmlMatches (content, "img", "src");
  }

}
