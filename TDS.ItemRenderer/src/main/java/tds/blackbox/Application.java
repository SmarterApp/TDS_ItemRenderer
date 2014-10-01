/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox;

import java.util.List;

import javax.servlet.ServletContextEvent;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

//import tds.blackbox.ContentRequest.ContentRequestSetting;
import AIR.Common.Configuration.AppSettings;
import AIR.Common.Helpers._Ref;
import AIR.Common.Web.Session.BaseServletContextListener;
import AIR.Common.Web.Session.HttpContext;
import AIR.Common.Web.Session.Server;

// TODO Ayo/Shiva no HttpApplication defined
public class Application {/*extends BaseServletContextListener
{
  private static final Logger _logger = LoggerFactory.getLogger (Appendable.class);

  // / <summary>
  // / This is fired when the ASP.NET app starts, this will preload all tests.
  // / </summary>
  public void contextInitialized (ServletContextEvent sce) {
    super.contextInitialized (sce);

    String appPath = Server.mapPath ("~");

    // load apip rules CSV
    APIPCSVLoader.loadRules (Path.Combine (appPath, "apip.csv"));

    String brfTransformationRules = System.Configuration.ConfigurationManager.AppSettings["BRFStyleTransformationRules"];
    if (brfTransformationRules != null) {
      BRFProcessor.setBRFRulesFileNamePattern (Server.mapPath (brfTransformationRules));
    }

    // add settings handler
    AppSettings.setHandler (SettingsHandler);

    // log app start and list out assemblies
    StringBuilder logBuilder = new StringBuilder ("BlackBox application Started: ");
    // String path = sce.getServletContext ().getRealPath (".");
    _logger.info (logBuilder.toString ());
  }

  public void contextDestroyed (ServletContextEvent sce) {
    super.contextDestroyed (sce);
    // log app shutdown and the reason why
    _logger.info ("BlackBox application shutdown");
  }

  // TODO Ayo/Shiva replaced "out" with "_Ref" for method parameter named
  // 'value'
  private boolean settingsHandler (String name, _Ref<Object> value) {
    // TODO Ayo/Shiva replaced "as" with cast. No "Items" variable in
    // HttpContect class
    List<ContentRequestSetting> settings = (List<ContentRequestSetting>) HttpContext.getCurrentContext ().Items["settings"];

    if (settings != null) {
      for (ContentRequestSetting setting : settings) {
        if (StringUtils.equals (setting.getName (), name)) {
          value = (_Ref<Object>) AppSettings.parseString (setting.getType (), setting.getValue ());
          return true;
        }
      }
    }

    value = null;
    return false;
  }*/
}
