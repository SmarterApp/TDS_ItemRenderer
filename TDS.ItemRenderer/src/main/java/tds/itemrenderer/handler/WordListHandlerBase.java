/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.handler;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import tds.itemrenderer.data.xml.wordlist.Html;
import tds.itemrenderer.data.xml.wordlist.Itemrelease;
import tds.itemrenderer.data.xml.wordlist.Keyword;
import tds.itemrenderer.processing.ITSDocumentProcessingException;
import tds.itemrenderer.processing.ITSUrlResolver2;
import AIR.Common.Json.JsonHelper;
import AIR.Common.Utilities.SpringApplicationContext;
import AIR.Common.Utilities.TDSStringUtils;
import AIR.Common.Web.FileFtpHandler;
import AIR.Common.Web.FtpResourceException;
import TDS.Shared.Exceptions.ReturnStatusException;
import TDS.Shared.Exceptions.TDSHttpException;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.databind.JsonMappingException;

/**
 * @author jmambo
 * 
 *         Handle requests for definitions of words in the item, retrieve them
 *         and send the response back to the client
 * 
 */
public abstract class WordListHandlerBase
{

  private static final Logger      _logger       = LoggerFactory.getLogger (WordListHandlerBase.class);

  public static final String       BANK_KEY_NAME = "bankKey";
  public static final String       ITEM_KEY_NAME = "itemKey";
  public static final String       INDEX_NAME    = "index";
  public static final String       ACCS_NAME     = "TDS_ACCS";
  private List<String>             _accommodationsList;

  private static final JAXBContext _jaxbContext  = getJaxbContext ();

  private Itemrelease              _itemRelease;

  /**
   * Gets JAXB context
   * 
   * @return JAXBContext
   */
  private static JAXBContext getJaxbContext () {
    try {
      return JAXBContext.newInstance (Itemrelease.class);
    } catch (JAXBException e) {
      _logger.error (e.getMessage (), e);
    }
    return null;
  }

  /**
   * An HTTP request has arrived to define a word. Handle it.
   * 
   * @throws ReturnStatusException
   * @throws TDSHttpException
   * @throws IOException
   * @throws JsonMappingException
   * @throws JsonGenerationException
   */
  @RequestMapping (value = "WordList.axd/resolve", produces = "application/json; charset=utf-8")
  @ResponseBody
  public String handleRequest (@RequestParam (value = BANK_KEY_NAME, required = false) long bankKey, @RequestParam (value = ITEM_KEY_NAME, required = false) long itemKey,
      @RequestParam (value = INDEX_NAME, required = false) List<String> itemIndex, @RequestParam (value = ACCS_NAME, required = false) List<String> accs) throws ReturnStatusException,
      TDSHttpException, JsonGenerationException, JsonMappingException, IOException {
    _accommodationsList = accs;

    // Look up the path to the word list item.
    String filePath = getItemPath (bankKey, itemKey);

    if (StringUtils.isEmpty (filePath)) {
      // item not found
      String message = TDSStringUtils.format ("Can't find item path: {0}-{1}", bankKey, itemKey);
      throw new TDSHttpException (HttpStatus.NOT_FOUND.value (), message);
    }

    List<JsonWordList> jsonResponse = new ArrayList<JsonWordList> ();
    parseXml (filePath);

    for (String item : itemIndex) {
      Map<String, String> htmlTabs = new HashMap<> ();
      try {
        getWordListEntry (htmlTabs, item, filePath);
      } catch (Exception exp) {
        String message = TDSStringUtils.format ("Error parsing item {0}-{1} index {2}", bankKey, itemKey, itemIndex);
        throw new TDSHttpException (HttpStatus.NOT_FOUND.value (), message);
      }
      String entryKey = bankKey + "-" + itemKey + "-" + item;
      JsonWordList jsonContent = jsonifyWordListTabs (entryKey, htmlTabs);
      jsonResponse.add (jsonContent);
    }

    return JsonHelper.serialize (jsonResponse);
  }

  /**
   * Derived class should implement this to get it from the correct place,
   * either database in TDS case or whatever ITS does (config file, hard code
   * etc.).
   * 
   * @param bankKey
   * @param itemKey
   * @return
   * @throws ReturnStatusException
   */
  protected abstract String getItemPath (long bankKey, long itemKey) throws ReturnStatusException;

  /**
   * 
   * We have a accommodation code from an item. See if it is in the
   * accommodation String for this test (as sent to us by the browser).
   * 
   * @param code
   * @return
   */
  private boolean isInAccList (String code) {
    if ((_accommodationsList == null) || (_accommodationsList.size () == 0)) {
      return false;
    }
    for (String acc : _accommodationsList) {
      if (acc.equalsIgnoreCase (code)) {
        return true;
      }
    }
    return false;
  }

  /**
   * XML parse a word list item file, and find the word we need.
   * 
   * @param htmlTabs
   * @param fs
   * @param reader
   * @param itemIndex
   */
  protected void getWordListEntry (Map<String, String> htmlTabs, String itemIndex, String fileName) {
    List<Keyword> keywords = _itemRelease.getItem ().getKeywordList ().getKeyword ();
    for (Keyword keyword : keywords) {
      if (StringUtils.isBlank (keyword.getIndex ()) || !keyword.getIndex ().equals (itemIndex)) {
        continue;
      }
      List<Html> htmls = keyword.getHtml ();
      for (Html html : htmls) {
        String wtype = html.getListType ();
        if (StringUtils.isBlank (wtype)) {
          continue;
        }
        String wacc = html.getListCode ();
        if (StringUtils.isBlank (wacc) || !isInAccList (wacc)) {
          continue;
        }
        if (!isBlankHtmlContent(html.getContent ())) {
          ITSUrlResolver2 resolver = new ITSUrlResolver2(fileName);
          String content=resolver.resolveResourceUrls (html.getContent ());
          htmlTabs.put (wtype, content);
        }
      }

    }

  }
  
  private boolean isBlankHtmlContent(String htmlContent) {
    if (StringUtils.isBlank (htmlContent)) {
      return true;
    }
    String tagPattern = "^<p[^>]*>(.+?)</p>$";
    Pattern pattern =  Pattern.compile(tagPattern);
    Matcher matcher = pattern.matcher(htmlContent.trim ());
    while (matcher.find()) {
      String tagContent = matcher.group(1).trim();   
      if (tagContent.equals ("") || tagContent.equals ("&#xA0;")) {
         return true;
      }
    }
    return false;
 }

  /**
   * Open an XML file and send it to the parser.
   * 
   * @param filePath
   * @param itemIndex
   * @return
   */
  protected Map<String, String> parseXml (String filePath) {
    Map<String, String> htmlTabs = new HashMap<> ();
    FileFtpHandler fileFtpHandler = SpringApplicationContext.getBean ("fileFtpHandler", FileFtpHandler.class);

    try {
      Unmarshaller jaxbUnmarshaller = _jaxbContext.createUnmarshaller ();
      if (fileFtpHandler.allowScheme (filePath)) {
        InputStream inputStream = null;
        try {
          inputStream = new ByteArrayInputStream (FileFtpHandler.getBytes (new URI (filePath.replace ("\\", "/"))));
        } catch (FtpResourceException | URISyntaxException e) {
          throw new ITSDocumentProcessingException (e);
        }
        _itemRelease = (Itemrelease) jaxbUnmarshaller.unmarshal (inputStream);
      } else {
        _itemRelease = (Itemrelease) jaxbUnmarshaller.unmarshal (new File (filePath));
      }
    } catch (JAXBException e) {
      String message = "The XML schema was not valid for the file \"" + filePath + "\"";
      throw new ITSDocumentProcessingException (message + " " + e.getMessage (), e);
    }

    return htmlTabs;
  }

  /**
   * We found the part of the word list item that we need. Format it for the
   * browser.
   * 
   * @param entryKey
   * @param htmlTabs
   * @return
   */
  public JsonWordList jsonifyWordListTabs (String entryKey, Map<String, String> htmlTabs) {
    Set<String> wlTypes = htmlTabs.keySet ();
    JsonWordList jsonWordList = new JsonWordList ();
    jsonWordList.setEntryKey (entryKey);
    if ((htmlTabs != null) && (htmlTabs.size () > 0)) {
      jsonWordList.setEntryFound (true);
      for (String wlType : wlTypes) {
        JsonEntry entry = new JsonEntry ();
        entry.setWlType (wlType);
        entry.setWlContent (htmlTabs.get (wlType));
        entry.setWlContent (entry.getWlContent ());
        jsonWordList.getEntries ().add (entry);
      }
    }
    return jsonWordList;
  }

}

class JsonEntry
{

  @JsonProperty ("wlType")
  private String _wlType;

  @JsonProperty ("wlContent")
  private String _wlContent;

  public String getWlContent () {
    return _wlContent;
  }

  public void setWlContent (String wlContent) {
    this._wlContent = wlContent;
  }

  public String getWlType () {
    return _wlType;
  }

  public void setWlType (String wlType) {
    this._wlType = wlType;
  }

}

class JsonWordList
{

  @JsonProperty ("Entries")
  private List<JsonEntry> _entries;

  @JsonProperty ("EntryFound")
  private boolean         _entryFound;

  @JsonProperty ("EntryKey")
  private String          _entryKey;

  public JsonWordList () {
    _entryFound = false;
    _entries = new ArrayList<JsonEntry> ();
  }

  public List<JsonEntry> getEntries () {
    return _entries;
  }

  public void setEntries (List<JsonEntry> entries) {
    this._entries = entries;
  }

  public boolean isEntryFound () {
    return _entryFound;
  }

  public void setEntryFound (boolean entryFound) {
    this._entryFound = entryFound;
  }

  public String getEntryKey () {
    return _entryKey;
  }

  public void setEntryKey (String entryKey) {
    this._entryKey = entryKey;
  }

}
