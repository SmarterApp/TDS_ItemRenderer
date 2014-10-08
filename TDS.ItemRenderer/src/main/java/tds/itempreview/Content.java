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

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class Content
{
  private String _file = null;

  @JsonProperty ("file")
  public String getFile () {
    return _file;
  }

  public void setFile (String value) {
    _file = value;
  }

  public String toString () {
    return getFile ();
  }

  public int hashCode () {
    return _file.hashCode ();
  }
}
