/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data.apip;

import java.util.List;
import java.util.ArrayList;
// / <summary>
// / The container for the alternative accessibility content that is to be
// rendered using Braille text formats.
// / Output to a refreshable Braille display presents the examinee with a
// Braille representation of text-based content.
// / Braille display requires the item writer to define elements to which a
// Braille representation is assigned.
// / </summary>

public class APIPBraille // <brailleText>
{
  // / <summary>
  // / The text string that is to be rendered in Braille.
  // / </summary>
  // / <remarks>"Literal text"</remarks>
  public String                _text         = null;

  public List<APIPBrailleCode> _brailleCodes = null;

  public APIPBraille () {
    setBrailleCodes (new ArrayList<APIPBrailleCode> ());
  }

  public String getText () {
    return _text;
  }

  public void setText (String value) {
    _text = value;
  } // <brailleTextString>

  public List<APIPBrailleCode> getBrailleCodes () {
    return _brailleCodes;
  }

  public void setBrailleCodes (List<APIPBrailleCode> value) {
    _brailleCodes = value;
  } // <brailleCode type="Nemeth">

}
