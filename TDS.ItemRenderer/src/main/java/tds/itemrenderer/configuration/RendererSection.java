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
package tds.itemrenderer.configuration;

import AIR.Common.Configuration.ConfigurationManager;
import AIR.Common.Configuration.ConfigurationSection;
import AIR.Common.Utilities.SpringApplicationContext;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
// TODO this is not going to work unless ConfigurationManager has been declared
// to be a singleton.
public class RendererSection
{
  public static String getResourcePath () {
    return getRendererConfigurationSection ().get ("itemrenderer.resourcePath");
  }

  public static void setResourcePath (String value) {
    getRendererConfigurationSection ().put ("itemrenderer.resourcePath", value);
  }

  public static boolean getResourceFix () {
    return Boolean.parseBoolean (getRendererConfigurationSection ().get ("itemrenderer.resourceFix"));
  }

  public static void setResourceFix (boolean value) {
    getRendererConfigurationSection ().put ("itemrenderer.resourceFix", "" + value);
  }

  public static String getLayoutFolder () {
    return getRendererConfigurationSection ().get ("itemrenderer.layoutFolder");
  }

  public static void setLayoutFolder (String value) {
    getRendererConfigurationSection ().put ("itemrenderer.layoutFolder", value);
  }

  public static String getResponseFolder () {
    return getRendererConfigurationSection ().get ("itemrenderer.responseFolder");
  }

  public static void setResponseFolder (String value) {
    getRendererConfigurationSection ().put ("itemrenderer.responseFolder", value);
  }

  public static String getTemplateFolder () {
    return getRendererConfigurationSection ().get ("itemrenderer.templateFolder");
  }

  public static void setTemplateFolder (String value) {
    getRendererConfigurationSection ().put ("itemrenderer.templateFolder", value);
  }

  public static String getJavaFolder () {
    return getRendererConfigurationSection ().get ("itemrenderer.javaFolder");
  }

  public static void setJavaFolder (String value) {
    getRendererConfigurationSection ().put ("itemrenderer.javaFolder", value);
  }

  public static ReplacementPathElement getReplacementPath () {
    return new ReplacementPathElement (getRendererConfigurationSection ());
  }

  private static ConfigurationSection getRendererConfigurationSection () {
    return SpringApplicationContext.getBean ("configurationManager", ConfigurationManager.class).getRendererSettings ();
  }
}
