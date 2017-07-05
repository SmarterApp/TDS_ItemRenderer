/*************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 *************************************************************************/

package tds.itemrenderer.data;

/**
 * @author mskhan
 * 
 */
public class IrisITSDocument extends ITSDocument
{

  private String _realPath;

  public IrisITSDocument (String realPath) {
    this.setRealPath (realPath);
  }

  public String getRealPath () {
    return _realPath;
  }

  private void setRealPath (String value) {
    this._realPath = value;
  }
}
