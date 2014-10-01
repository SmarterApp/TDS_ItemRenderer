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
package tds.itempreview.web.application;

import javax.servlet.ServletContextEvent;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import AIR.Common.Web.Session.BaseServletContextListener;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class ItemPreviewApplication extends BaseServletContextListener
{
  
  private static final Logger _logger = LoggerFactory.getLogger (ItemPreviewApplication.class);
  
  // / <summary>
  // / This is fired when the ASP.NET app starts, this will preload all tests.
  // / </summary>
  public void contextInitialized (ServletContextEvent sce) {
    super.contextInitialized (sce);
    // log app start and list out assemblies
    StringBuilder logBuilder = new StringBuilder ("ItemPreview Application Started: ");
    String path = sce.getServletContext ().getRealPath (".");
    try {
      // TODO Shiva log jar versions / names as we were doing in .NET code.
     // TDSLogger.Application.getStart (logBuilder.toString ());
    } catch (Exception ex) {
      //TDSLogger.Application.getFatal (ex);
      _logger.error (ex.getMessage (), ex);
    }

  }

  public void contextDestroyed (ServletContextEvent sce) {
    super.contextDestroyed (sce);
    // log app shutdown and the reason why
    try {
     //TODO TDSLogger.Application.getStop ("ItemPreview application shutdown");
    } catch (Exception exp) {
      //TDSLogger.Application.getFatal (exp);
      _logger.error (exp.getMessage (), exp);
    }
  }
}
