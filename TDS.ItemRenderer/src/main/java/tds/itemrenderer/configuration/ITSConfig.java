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
public class ITSConfig
{
  // / <summary>
  // / The path used to resolve image/anchor resources.
  // / </summary>
  // / <example>
  // / EXAMPLE: ~/Image.axd?path={0}&amp;file=
  // / * {0} is the full path BASE64 encoded
  // / * after "file=" is the file name in the xml
  // / </example>
  private static String                 _resourcePath    = "~/Pages/API/Resources.axd?path={0}&file=";
  
  // / <summary>
  // / Set the resource URL to be lower case and possible other fixes.
  // / </summary>
  private static boolean                _resourceFix     = false;

  // folder properties (with defaults set)
  // Shiva: we use the following three folder properties as library names for
  // composite componets and that
  // is why we do not need ~/ or any other relative paths.
  // TODO shiva: what about _javaFolder ?
  private static String                 _layoutFolder    = "layouts";
  private static String                 _responseFolder  = "responseTypes";
  private static String                 _templateFolder  = "templates";
  private static String                 _javaFolder      = "~/Shared/Applets/";

  public static ReplacementPathElement getReplacementPath () {
     return ReplacementPathElement.getInstance();
  }

  public static String getJavaFolder () {
    return _javaFolder;
  }

  public static String getTemplateFolder () {
    return _templateFolder;
  }

  public static String getResponseFolder () {
    return _responseFolder;
  }

  public static String getLayoutFolder () {
    return _layoutFolder;
  }

  public static String getResourcePath () {
    return _resourcePath;
  }

  public static boolean getResourceFix () {
    return _resourceFix;
  }

  private static final String RENDERER_RESOURCEPATH   = "renderer.resourcePath";
  private static final String RENDERER_LAYOUTFOLDER   = "renderer.layoutFolder";
  private static final String RENDERER_RESPONSEFOLDER = "renderer.responseFolder";
  private static final String RENDERER_TEMPLATEFOLDER = "renderer.templateFolder";
  private static final String RENDERER_JAVAFOLDER     = "renderer.javaFolder";

  // TODO Shiva
  static {
    /*
     * ConfigurationSection _config = ConfigurationManager.getInstance
     * ().getRendererSettings ();
     * 
     * _resourcePath = _config.get (RENDERER_RESOURCEPATH); // TODO Shiva: Where
     * do we need this? // ResourceFix = _config.get( ResourceFix; _layoutFolder
     * = _config.get (RENDERER_LAYOUTFOLDER); _responseFolder = _config.get
     * (RENDERER_RESPONSEFOLDER); _templateFolder = _config.get
     * (RENDERER_TEMPLATEFOLDER); _javaFolder = _config.get
     * (RENDERER_JAVAFOLDER); _replacementPath = new ReplacementPathElement
     * (_config);
     */
  }
}
