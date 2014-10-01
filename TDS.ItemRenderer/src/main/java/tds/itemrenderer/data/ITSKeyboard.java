/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

import java.util.ArrayList;
import java.util.List;

public class ITSKeyboard
{
  private List<ITSKeyboardRow> _rows;

  public ITSKeyboard () {
    this._rows = new ArrayList<ITSKeyboardRow> ();
  }

  public List<ITSKeyboardRow> getRows () {
    return _rows;
  }

  public void setRows (List<ITSKeyboardRow> _rows) {
    this._rows = _rows;
  }

}
