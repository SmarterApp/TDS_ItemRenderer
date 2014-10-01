/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public abstract class IITSResolver
{

  /** Enable or disable querysting encryption */
  private boolean _enableEncryption     = false;
 
  private String  _additionalParameters = null;

  public boolean getEnableEncryption () {
    return _enableEncryption;
  }

  public void setEnableEncryption (boolean value) {
    _enableEncryption = value;
  }

  /**
   * Additional querystring parameters
   * 
   * @return additional parameters
   */
  public String getAdditionalParameters () {
    return _additionalParameters;
  }

  public void setAdditionalParameters (String value) {
    _additionalParameters = value;
  }

  /**
   * Sets the URL for images and links (e.x., ELPA audio).
   * @param content  HTML to fix
   * @return HTML with fixed URLs
   */
  public abstract String resolveResourceUrls (String content);

  /**
   * 
   * @param content FileSpec to fix
   * @param language Optional language (leave NULL if none)
   * @return HTML with fixed FileSpec fixed
   */
  public abstract String resolveGridXmlUrls (String content, String language);
  
}
