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
package tds.itempreview;

import AIR.Common.Configuration.AppSetting;
import AIR.Common.Configuration.AppSettings;

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

  public static AppSetting<String> getContentPath()
  {
    return AppSettings.getString ("tds.itempreview.contentpath");
  }
}
