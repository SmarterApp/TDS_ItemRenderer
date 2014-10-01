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
package tds.itempreview.web.backing;

import javax.faces.bean.ManagedBean;
import javax.faces.bean.ManagedProperty;
import javax.faces.bean.RequestScoped;

import org.apache.commons.lang.StringUtils;

import TDS.Shared.Web.BasePage;
//TODO
//import tds.blackbox.ContentManagerRenderer;

import tds.itempreview.dummy.ContentManagerRenderer;
import AIR.Common.Configuration.ConfigurationManager;
import AIR.Common.Utilities.TDSStringUtils;
import AIR.Common.Web.WebHelper;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
@ManagedBean
@RequestScoped
public abstract class AbstractPage extends BasePage
{
  private boolean              _debug                = false;

  @ManagedProperty (value = "#{configurationManager}")
  private ConfigurationManager _configurationManager = null;

  public boolean getDebug () {
    return _debug;
  }

  public void setDebug (boolean value) {
    _debug = value;
  }

  public String getItemScoringServerUrl () {
    return _configurationManager.getAppSettings ().get ("ItemScoringServerUrl");
  }

  public String getBlackboxUrl (String path, Object... args) {
    path = TDSStringUtils.format (path, args);
    return getBlackboxUrl (path, false);
  }

  public String getBlackboxUrl (String path, boolean includeParams) {
    // get url from web.config
    StringBuilder urlBuilder = new StringBuilder ();

    urlBuilder.append (_configurationManager.getAppSettings ().get ("blackboxUrl"));

    // add file path
    if (path != null)
      urlBuilder.append (path);

    // add querystring
    if (includeParams)
      urlBuilder.append (getBlackboxParams ());

    return urlBuilder.toString ();
  }

  private String getBlackboxParams () {
    StringBuilder paramsBuilder = new StringBuilder ();

    // get renderer type
    String rendererValue = WebHelper.getQueryString ("renderer");
    ContentManagerRenderer renderer = ContentManagerRenderer.MultiFrame;

    // parse renderer type
    if (!StringUtils.isEmpty (rendererValue)) {
      try {
        renderer = ContentManagerRenderer.valueOf (rendererValue);
      } catch (Exception ex) {
      }
    }

    paramsBuilder.append (TDSStringUtils.format ("?renderer={0}", renderer.toString ().toLowerCase ()));

    // add client
    String clientValue = WebHelper.getQueryString ("client");
    if (!StringUtils.isEmpty (clientValue))
      paramsBuilder.append (TDSStringUtils.format ("&client={0}", clientValue));

    // add accommodations
    String accommodations = WebHelper.getQueryString ("accommodations");
    if (!StringUtils.isEmpty (accommodations))
      paramsBuilder.append (TDSStringUtils.format ("&accommodations={0}", accommodations));

    // set the grid version
    int gridVersion = WebHelper.getQueryValueInt ("gridVersion");
    if (gridVersion > 0)
      paramsBuilder.append (TDSStringUtils.format ("&gridVersion={0}", gridVersion));

    // layout folder
    String layoutFolder = WebHelper.getQueryString ("layoutFolder");
    if (layoutFolder != null)
      paramsBuilder.append (TDSStringUtils.format ("&layoutFolder={0}", layoutFolder));

    return paramsBuilder.toString ();
  }

  
  public ConfigurationManager getConfigurationManager () {
    return _configurationManager;
  }

  public void setConfigurationManager (ConfigurationManager configurationManager) {
    _configurationManager = configurationManager;
  }
  
 }
