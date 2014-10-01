/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.handler;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;

import tds.itemrenderer.ITSDocumentFactory;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.processing.ITSDocumentHelper;
import AIR.Common.Utilities.Path;
import AIR.Common.Web.FileHttpHandler;
import TDS.Shared.Exceptions.TDSHttpException;

/**
 * @author mpatel
 *
 */
public abstract class SoundCueHandlerBase extends FileHttpHandler
{
  protected SoundCueHandlerBase() {
    
  }
  
  protected abstract String GetItemPath(long bankKey, long itemKey);
  
  protected void service (HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
    super.service (request, response);
  }

//  Pages/API/SoundCue.axd
  
  public String overrideExecuteUrlPath(HttpServletRequest request) throws TDSHttpException
  {
      String bankKeyValue = request.getParameter ("bankKey");
      String itemKeyValue = request.getParameter("itemKey");

      if (StringUtils.isEmpty (bankKeyValue) || StringUtils.isEmpty (itemKeyValue))
      {
          throw new TDSHttpException( HttpStatus.BAD_REQUEST.value (), "Missing or invalid parameters.");
      }

      long bankKey = Long.parseLong (bankKeyValue);
      long itemKey = Long.parseLong (itemKeyValue);

      if (bankKey <= 0 || itemKey <= 0)
      {
          throw new TDSHttpException(HttpStatus.BAD_REQUEST.value (), "Invalid parameters.");
      }

      // Language is hard coded to ENU for audio (NOTE: Not sure if this is correct though for the future)
      String language = "ENU";

      String xmlFile = GetItemPath(bankKey, itemKey);

      if (xmlFile == null)
      {
          throw new TDSHttpException(HttpStatus.BAD_REQUEST.value (),  "Missing sound cue.");
      }

      String xmlDir = Path.getDirectoryName(xmlFile);

      // load content for item (NOTE: do not resolve url's)
      IITSDocument itsDocument = ITSDocumentFactory.load(xmlFile, language, false);
      ITSContent itsContent = itsDocument.getContent(language);
      String stem = itsContent.getStem ();

      String soundCueFile = ScrapeLink(stem);

      //_context.Response.ContentType = "audio/ogg";
      //_context.Response.AddHeader("Content-Disposition", "filename=" + fileAudio);

      String soundCuePath = Path.combine(xmlDir, soundCueFile);
      soundCuePath = ITSDocumentHelper.getReplacementPath(soundCuePath);
      return soundCuePath;
  }

  /// <summary>
  /// Scrapes html and parses out the first link.
  /// </summary>
  public static String ScrapeLink(String html)
  {
      //set up the regex for finding the link urls
      StringBuilder hrefPattern = new StringBuilder();
      hrefPattern.append("<a[^>]+"); //start 'a' tag and anything that comes before 'href' tag
      hrefPattern.append("href\\s*=\\s*"); //start href property
      //three possibilities  for what href property --
      //(1) enclosed in double quotes
      //(2) enclosed in single quotes
      //(3) enclosed in spaces
      hrefPattern.append("(?:\"(?<href>[^\"]*)\"|'(?<href>[^']*)'|(?<href>[^\"'>\\s]+))");
      hrefPattern.append("[^>]*>.*?</a>"); //end of 'a' tag
      Pattern hrefRegex =  Pattern.compile (hrefPattern.toString (),Pattern.CASE_INSENSITIVE);

      //look for matches 
      Matcher hrefcheck = hrefRegex.matcher (html);
      
      while (hrefcheck.find ())
      {
          String href = hrefcheck.group ("href"); //link url
          return href;
      }
      
      return null;
  }
  
  public static void main (String[] args) {
    System.out.println (ScrapeLink ("<a href='http://www.w3schools.com'>Visit W3Schools</a>"));
  }

}
