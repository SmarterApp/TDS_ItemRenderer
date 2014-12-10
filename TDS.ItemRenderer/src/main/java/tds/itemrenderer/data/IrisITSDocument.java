/*************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at
 * https://bitbucket.org/sbacoss/eotds/wiki/AIR_Open_Source_License
 *************************************************************************/

package tds.itemrenderer.data;

import java.util.List;

/**
 * @author mskhan
 * 
 */
public class IrisITSDocument extends IITSDocument
{

  private String _realPath;

  public IrisITSDocument (IITSDocument itsDocument, String realPath) {
    this.setItemKey (itsDocument.getItemKey ());
    this.setBankKey (itsDocument.getBankKey ());
    this.setBaseUri (itsDocument.getBaseUri ());
    this.setFormat (itsDocument.getFormat ());
    this.setType (itsDocument.getType ());
    this.setStimulusKey (itsDocument.getStimulusKey ());
    this.setRealPath (realPath);
  }

  public String getRealPath () {
    return _realPath;
  }

  @Override
  public ITSContent getContent (String language) {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public ITSContent getContentDefault () {
    // TODO Auto-generated method stub
    return null;
  }

  @Override
  public List<String> getMediaFiles () {
    // TODO Auto-generated method stub
    return null;
  }

  private void setRealPath (String value) {
    this._realPath = value;
  }
}
