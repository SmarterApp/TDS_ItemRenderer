/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox.web.handlers;

import AIR.Common.Json.JsonHelper;
import AIR.Common.Web.Session.HttpContext;
import TDS.Shared.Exceptions.ReturnStatusException;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.InputStreamReader;

import tds.blackbox.ContentRequest;
import tds.blackbox.ContentRequestException;
import tds.blackbox.ContentRequestParser;
import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.ItemRenderGroup;
import tds.itemrenderer.repository.ContentRepository;
import tds.itemrenderer.webcontrols.rendererservlet.ContentRenderingException;

@Scope ("prototype")
@Controller
public class BlackBoxRequestHandler extends BaseContentRendererController
{
  private static final Logger _logger = LoggerFactory.getLogger (BlackBoxRequestHandler.class);

  @Autowired
  private ContentRepository contentRepository;


  // Controller starts here
  @RequestMapping (value = "ContentRequest.axd/load", produces = "application/xml")
  @ResponseBody
  public void loadContentRequest2 (HttpServletRequest request, HttpServletResponse response) throws ContentRequestException, ReturnStatusException  {
    loadContentRequest (request, response);
  }

  // Controller starts here
  @RequestMapping (value = "Blackbox.axd/loadContentRequest", produces = "application/xml")
  @ResponseBody
  public void loadContentRequest (HttpServletRequest request, HttpServletResponse response) throws ContentRequestException, ReturnStatusException {
    ContentRequest contentRequest = getContentRequest (request);
    // check if valid request
    if (contentRequest == null)
      throw new ContentRequestException("Could not parse the content request JSON.");

    // keep settings around for this request
    if (contentRequest.getSettings () != null) {
      HttpContext.getCurrentContext ().getRequest ().setAttribute ("settings", contentRequest.getSettings ());
    }

    // set default language if none provided
    if (contentRequest.getLanguage () == null)
      contentRequest.setLanguage ("ENU");

    // check if paths are encrypted
    if (contentRequest.getEncrypted ()) {
      ContentRequestParser.decryptPaths (contentRequest);
    }
    AccLookup accLookup = ContentRequestParser.createAccommodations (contentRequest);

    ItemRenderGroup itemRenderGroup = ContentRequestParser.createPageLayout(contentRepository, contentRequest);

    // Shiva: This is where our implementation differs from .NET.
    // In .NET the IRIS method of populating PageLayout is different than the
    // student way - the controllers are different.
    // In our case we intend to keep one single point of entry. Only IRiS allows
    // overriding of layout.
    // we will implement it by overriding the layout in the first item.
    if (!StringUtils.isEmpty (contentRequest.getLayoutName ()))
      itemRenderGroup.setLayout (contentRequest.getLayoutName ());
    
    renderGroup (itemRenderGroup, accLookup, response);
  }

  /*
   * (non-Javadoc)
   * 
   * @see AIR.Common.Web.HttpHandlerBase#onBeanFactoryInitialized()
   */
  @Override
  protected void onBeanFactoryInitialized () {
    super.onBeanFactoryInitialized ();
    // TODOO anything else goes after this.
  }

  private ContentRequest getContentRequest (HttpServletRequest request) throws ContentRequestException {
    try {
      BufferedReader bufferedReader = new BufferedReader (new InputStreamReader (request.getInputStream ()));
      String line = null;
      StringBuilder builder = new StringBuilder ();
      while ((line = bufferedReader.readLine ()) != null) {
        builder.append (line);
      }
      return JsonHelper.deserialize (builder.toString (), ContentRequest.class);
    } catch (Exception exp) {
      _logger.error ("Error deserializing ContentRequest from JSON", exp);
      throw new ContentRenderingException(exp);
    }
  }
}
