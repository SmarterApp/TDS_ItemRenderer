/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data.apip;

// / <summary>
// / This is the container for the set of descriptions for the various types of
// alternative accessibility content.
// / </summary>
public class APIPRelatedElementInfo
{
  // / <summary>
  // / The container for alternative accessibility content that is to be
  // rendered using read aloud formats.
  // / </summary>
  public APIPReadAloud _readAloud = null;

  public APIPReadAloud getReadAloud () {
    return _readAloud;
  }

  public void setReadAloud (APIPReadAloud value) {
    _readAloud = value;
  }

  // / <summary>
  // / The container for alternative accessibility content that is to be
  // rendered using Braille text formats.
  // / </summary>
  public APIPBraille _braille = null;

  public APIPBraille getBraille () {
    return _braille;
  }

  public void setBraille (APIPBraille value) {
    _braille = value;
  }
}
