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

import org.apache.commons.lang.StringUtils;

import AIR.Common.Configuration.AppSettingsHelper;
import AIR.Common.Web.WebHelper;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class BlackboxSettings
{
  // / <summary>
  // / Get the current client name.
  // / </summary>
  public static String getClientName () {
    // first check the querystring
    String clientName = WebHelper.getQueryString ("c") == null ? WebHelper.getQueryString ("client") : WebHelper.getQueryString ("c");

    if (!StringUtils.isEmpty (clientName))
      return clientName;

    // then check the web.config
    clientName = AppSettingsHelper.get ("tds.blackbox.client");
    if (!StringUtils.isEmpty (clientName))
      return clientName;

    // return default
    return "SBAC";
  }

  // / <summary>
  // / Get the name of the messages file to load.
  // / </summary>
  // / <returns></returns>
  public static String getMessagesName () {
    // first check the querystring
    String messagesName = WebHelper.getQueryString ("messages");
    if (!StringUtils.isEmpty (messagesName))
      return messagesName;

    // then check the web.config
    messagesName = AppSettingsHelper.get ("tds.blackbox.messages");
    if (!StringUtils.isEmpty (messagesName))
      return messagesName;

    // return client name as default
    return getClientName ();
  }

  public static String getShellName () {
    // first check the querystring
    String templateName = WebHelper.getQueryString ("shell");

    // then check the web.config
    if (StringUtils.isEmpty (templateName)) {
      templateName = AppSettingsHelper.get ("tds.blackbox.shell");
    }

    // otherwise set default
    if (StringUtils.isEmpty (templateName)) {
      templateName = "modern";
    }

    // cleanup
    templateName = templateName.toLowerCase ();
    templateName = StringUtils.replace (templateName, "shell", "");
    return templateName;
  }
}
