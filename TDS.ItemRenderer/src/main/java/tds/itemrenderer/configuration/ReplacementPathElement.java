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

import AIR.Common.Configuration.ConfigurationSection;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class ReplacementPathElement
{
  private String _match       = null;
  private String _replacement = null;
  public static final String RENDERER_REPLACEMENT_MATCH       = "renderer.replacement.match";
  public static final String RENDERER_REPLACEMENT_REPLACEMENT = "renderer.replacement.replacement";
  
  public String getMatch () {
    return _match;

  }

  public String getReplacement () {
    return _replacement;
  }

  protected ReplacementPathElement (ConfigurationSection config) {
    _match = config.get (RENDERER_REPLACEMENT_MATCH);
    _replacement = config.get (RENDERER_REPLACEMENT_REPLACEMENT);
  }

  /**
   * TODO make the method singleton
   * 
   * Gets ReplacementPathElement
   * 
   * @return ReplacementPathElement
   */
  public static ReplacementPathElement getInstance () {
    return RendererSection.getReplacementPath ();
  }


}
