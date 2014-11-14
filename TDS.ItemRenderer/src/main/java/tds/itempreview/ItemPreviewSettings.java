/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/**
 * 
 */
package tds.itempreview;

import org.apache.commons.lang.StringUtils;

import AIR.Common.Configuration.AppSetting;
import AIR.Common.Configuration.AppSettings;
import AIR.Common.Web.Session.Server;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class ItemPreviewSettings
{
  // / <summary>
  // /
  // / </summary>
  public static AppSetting<Boolean> getShowDevTools () {
    return AppSettings.getBoolean ("tds.itemPreview.showDevTools");
  }

  // / <summary>
  // / If this is true then change file paths in config to http url's.
  // / </summary>
  public static AppSetting<Boolean> getForceHttpContent () {
    return AppSettings.getBoolean ("tds.itemPreview.forceHttpContent");
  }

  public static AppSetting<Boolean> getEncryptPaths () {
    return AppSettings.getBoolean ("tds.itemPreview.encryptPaths");
  }

  // / <summary>
  // / This path is used for looking up resource list in ITS content.
  // / </summary>
  public static AppSetting<String> getResourceLookupPath () {
    return AppSettings.getString ("tds.itemPreview.resourceLookupPath");
  }

  public static AppSetting<String> getContentPath () {
    return AppSettings.getString ("tds.itempreview.contentpath");
  }

  // / <summary>
  // / If this is true then we will ignore parsing passages and building groups.
  // / </summary>
  public static AppSetting<Boolean> getIgnorePassages () {
    return AppSettings.getBoolean ("tds.itemPreview.ignorePassages");
  }

  // / <summary>
  // / If we are ignoring passages then this can be used to replace the layout.
  // / </summary>
  public static AppSetting<String> getPassageLayout () {
    return AppSettings.getString ("tds.itemPreview.passageLayout");
  }

  // / <summary>
  // / The # of minutes to cache the config. If set to 0 then disabled.
  // / </summary>
  public static AppSetting<Integer> getConfigCacheMinutes () {
    return AppSettings.getInteger ("tds.itemPreview.configCache.minutes", 0);
  }

  // / <summary>
  // / If this is true then show loading screen until the config xhr is
  // requested.
  // / </summary>
  public static AppSetting<Boolean> getShowLoading () {
    return AppSettings.getBoolean ("tds.itemPreview.showLoading");
  }

  public static AppSetting<String> getConfigCacheId () {
    return AppSettings.getString ("tds.itemPreview.configCache.id");
  }

  // / <summary>
  // / Get the item scoring server url.
  // / </summary>
  public static AppSetting<String> getItemScoringUrl () {
    AppSetting<String> urlSetting = AppSettings.getString ("tds.itemPreview.itemScoringUrl");

    if (StringUtils.isEmpty (urlSetting.getValue ())) {
      urlSetting = AppSettings.getString ("ItemScoringServerUrl");
    }
    return urlSetting;
  }

  // / <summary>
  // / Get the blackbox url.
  // / </summary>
  public static String getBlackboxUrl () {
    return Server.getContextPath ();
  }

}
