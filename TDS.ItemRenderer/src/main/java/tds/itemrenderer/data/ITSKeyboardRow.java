/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

import java.util.List;

public class ITSKeyboardRow
{
  private String               _id;  // { get; set; }
  private List<ITSKeyboardKey> _keys; // { get; set; }

  public String getId () {
    return _id;
  }

  public void setId (String _id) {
    this._id = _id;
  }

  public List<ITSKeyboardKey> getKeys () {
    return _keys;
  }

  public void setKeys (List<ITSKeyboardKey> _keys) {
    this._keys = _keys;
  }

  public String ToString () {
    return _id;
  }
}
