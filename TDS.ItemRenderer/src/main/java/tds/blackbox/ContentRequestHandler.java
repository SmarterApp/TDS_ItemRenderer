/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/**
 * 
 */
package tds.blackbox;

import java.io.BufferedReader;
import java.io.FileReader;
import java.net.URL;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.xml.bind.JAXBException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import tds.itemrenderer.webcontrols.PageLayout;

import AIR.Common.Web.Session.HttpContext;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
@Scope ("prototype")
@Controller
public class ContentRequestHandler extends ContentRequestBase
{
  private static Logger _logger = LoggerFactory.getLogger (ContentRequestHandler.class);

  @RequestMapping (value = "testController", method = RequestMethod.GET)
  @ResponseBody
  public String testController () {
    return "Blackbox ContentRequestHandler is working.";
  }

  @RequestMapping (value = "load", produces = "application/xml")
  @ResponseBody
  private void Loadx (@RequestBody ContentRequest contentRequest, HttpServletResponse response) throws ContentRequestException {
    // TODO shiva
    /*
     * // CORS: https://developer.mozilla.org/en-US/docs/HTTP_access_control
     * CurrentContext.Response.AppendHeader("Access-Control-Allow-Origin", "*");
     * CurrentContext.Response.AppendHeader("Access-Control-Allow-Credentials",
     * "true");
     * CurrentContext.Response.AppendHeader("Access-Control-Allow-Headers",
     * "Content-Type");
     */

    // check if valid request
    if (contentRequest == null)
      throw new ContentRequestException ("Could not parse the content request JSON.");

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
   
    // render xml
    // TODO Shiva
    // Render (pageLayout);
    //return new ContentResponse ();
    
    //TODO shiva dummy content
    getDummyContent(response);
  }
  
  @RequestMapping (value = "loadx", produces = "application/xml")
  @ResponseBody
  private void Load (@RequestBody ContentRequest contentRequest, HttpServletResponse response) throws ContentRequestException {
    // TODO shiva
    /*
     * // CORS: https://developer.mozilla.org/en-US/docs/HTTP_access_control
     * CurrentContext.Response.AppendHeader("Access-Control-Allow-Origin", "*");
     * CurrentContext.Response.AppendHeader("Access-Control-Allow-Credentials",
     * "true");
     * CurrentContext.Response.AppendHeader("Access-Control-Allow-Headers",
     * "Content-Type");
     */

    // check if valid request
    if (contentRequest == null)
      throw new ContentRequestException ("Could not parse the content request JSON.");

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
    // get page layout
    PageLayout pageLayout = ContentRequestParser.CreatePageLayout (contentRequest);

    // render xml
    // TODO Shiva
    // Render (pageLayout);
    //return new ContentResponse ();
    
    //TODO shiva dummy content
    
  }

  @RequestMapping (value = "testContentRequest")
  @ResponseBody
  private ContentRequestItem Load () {
    return new ContentRequestItem ();
  }

  /*
   * (non-Javadoc)
   * 
   * @see AIR.Common.Web.HttpHandlerBase#onBeanFactoryInitialized()
   */
  @Override
  protected void onBeanFactoryInitialized () {
    // use the protected getBean() method to get access to an instance of a
    // bean.
  }

  // TODO shiva this is for testing blackbox web while itemrendering is under
  // development.
  private void getDummyContent (HttpServletResponse response) {
    try {
      URL contentXmlUrl = this.getClass ().getClassLoader ().getResource ("dummycontent.xml");
      BufferedReader bfr = new BufferedReader(new FileReader (contentXmlUrl.getFile ())); 
      StringBuffer output = new StringBuffer ();
      String line = null;
      while ((line = bfr.readLine ()) != null)
      {
        output.append (line);
      }
      bfr.close ();
      response.setContentType ("text/xml");
      response.getOutputStream ().write (output.toString ().getBytes ());
    } catch (Exception exp) {
      throw new ContentRequestException ("Error loading dummy data: " + exp.toString ());
    }
  }
}
