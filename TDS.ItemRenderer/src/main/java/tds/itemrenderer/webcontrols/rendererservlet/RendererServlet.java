/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols.rendererservlet;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.Servlet;
import javax.servlet.ServletConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

// Shiva: heavily tied to MyFaces implementation
import javax.faces.webapp.FacesServlet;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import tds.itemrenderer.webcontrols.PageLayout;

import AIR.Common.Utilities.SpringApplicationContext;
import AIR.Common.Web.Session.Server;

/*
 * Shiva: From what it seems in the docs tomcat allows only one servlet instance
 * for each named servlet. some other containers however, may create multiple
 * instances.
 */
public class RendererServlet implements Servlet
{

  // logger.
  private static final Logger    logger    = LoggerFactory.getLogger (RendererServlet.class);

  private FacesServlet           _rendererServlet;
  private ServletConfig          _servletConfig;

  private static RendererServlet Singleton = null;

  public RendererServlet () {
    _rendererServlet = new FacesServlet ();
  }

  @Override
  public void init (ServletConfig config) throws ServletException {
    _servletConfig = config;
    _rendererServlet.init (config);
    Singleton = this;
  }

  @Override
  public ServletConfig getServletConfig () {
    return _servletConfig;
  }

  @Override
  public void service (ServletRequest request, ServletResponse response) throws ServletException, IOException {
    HttpServletResponse httpResponse = (HttpServletResponse) response;
    PrintWriter prn = new PrintWriter (httpResponse.getOutputStream ());
    prn.println ("This servlet is for internal use only.");
  }

  @Override
  public String getServletInfo () {
    return "Renderer servlet to be used only for item renderering.";
  }

  @Override
  public void destroy () {
    _servletConfig = null;
    _rendererServlet.destroy ();
  }

  public static String getRenderedOutput (PageLayout pageLayout) throws ContentRenderingException {
    final String path = "/render.xhtml";
    try {
      MockHttpServletResponse response = new MockHttpServletResponse ();
      response.setOutputStreamAccessAllowed (true);

      MockHttpServletRequest request = new MockHttpServletRequest ();
      request.setPathInfo (path);

      Singleton._rendererServlet.service (request, response);
      String generatedResponse = response.getContentAsString ();

      // extract only the content.
      final String beginingMarker = "<!-- Placeholder starts here -->";
      final String endMarker = "<!-- Placeholder ends here -->";

      int beginingMarkerStartPosition = generatedResponse.indexOf (beginingMarker);
      if (beginingMarkerStartPosition > 0) {
        int indexStart = beginingMarkerStartPosition + beginingMarker.length ();
        int indexEnd = generatedResponse.indexOf (endMarker);

        pageLayout.setRenderToString (generatedResponse.substring (indexStart, indexEnd));
      } else {
        // TODO Shiva: remove this else block and the corresponding if condition
        // but keep the contents of the if clause.
        pageLayout.setRenderToString ("ERROR: \n" + generatedResponse);
      }
    } catch (Exception exp) {
      exp.printStackTrace ();
      // TODO log these exceptions
      throw new ContentRenderingException (exp);
    }
    return pageLayout.getRenderToString ();
  }
}
