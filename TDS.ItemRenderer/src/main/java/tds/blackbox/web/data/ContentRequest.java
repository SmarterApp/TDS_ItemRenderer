/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox.web.data;

import AIR.Common.Json.JsonHelper;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import tds.blackbox.ContentRequestException;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

public class ContentRequest
{
  private static final Logger      _logger = LoggerFactory.getLogger (ContentRequest.class);
  private ContentRequestPassage    _passage;
  private List<ContentRequestItem> _items;
  private String                   _layout;

  @JsonProperty ("layout")
  public String getLayout () {
    return _layout;
  }

  public void setLayout (String value) {
    _layout = value;
  }

  @JsonProperty ("passage")
  public ContentRequestPassage getPassage () {
    return _passage;
  }

  public void setPassage (ContentRequestPassage value) {
    _passage = value;
  }

  @JsonProperty ("items")
  public List<ContentRequestItem> getItems () {
    return _items;
  }

  public void setItems (List<ContentRequestItem> value) {
    _items = value;
  }

  public static ContentRequest getContentRequest (InputStream inputStream) throws ContentRequestException {
    try {
      BufferedReader bufferedReader = new BufferedReader (new InputStreamReader (inputStream));
      String line = null;
      StringBuilder builder = new StringBuilder ();
      while ((line = bufferedReader.readLine ()) != null) {
        builder.append (line);
      }
      return JsonHelper.deserialize (builder.toString (), ContentRequest.class);
    } catch (Exception exp) {
      _logger.error ("Error deserializing ContentRequest from JSON", exp);
      throw new ContentRequestException("Error deserializing ContentRequest from JSON. " + exp.getMessage ());
    }
  }

  public static void main (String[] args) {
    try {
      ContentRequest request = new ContentRequest()
      {
        {
          this.setItems (new ArrayList<ContentRequestItem> ()
          {
            {
              this.add (new ContentRequestItem()
              {
                {
                  setId ("I-187-1383");
                  setResponse ("<response><math xmlns=\"http://www.w3.org/1998/Math/MathML\" title=\"12\"><mstyle><mn>12</mn></mstyle></math></response>");
                }
              });
            }
          });
        }
      };

      System.err.println (JsonHelper.serialize (request));
    } catch (Exception exp) {
      exp.printStackTrace ();
    }
  }
}
