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
package tds.blackbox.web;

import javax.servlet.ServletContextEvent;

import AIR.Common.Web.Session.BaseServletContextListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class BlackBoxApplication extends BaseServletContextListener
{
  private static final Logger _logger = LoggerFactory.getLogger (BlackBoxApplication.class);

  // / <summary>
  // / This is fired when the ASP.NET app starts, this will preload all tests.
  // / </summary>
  public void contextInitialized (ServletContextEvent sce) {
    super.contextInitialized (sce);
    // log app start and list out assemblies
    StringBuilder logBuilder = new StringBuilder ("BlackBox Application Started: ");

    try {
      // TODO Shiva log jar versions / names as we were doing in .NET
      // code.
      _logger.info (logBuilder.toString ());
    } catch (Exception ex) {
      _logger.error ("Error: ", ex);
    }

  }

  public void contextDestroyed (ServletContextEvent sce) {
    super.contextDestroyed (sce);
    // log app shutdown and the reason why
    try {
      _logger.info ("BlackBox Application Shutdown");
    } catch (Exception exp) {
      
    }
  }
}
