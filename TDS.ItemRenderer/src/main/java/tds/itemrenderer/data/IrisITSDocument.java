/*************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 *
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 *************************************************************************/

package tds.itemrenderer.data;

import java.util.List;

/**
 * @author mskhan
 *
 */
public class IrisITSDocument extends ITSDocument {
  private long itemKey;
  private long stimulusKey;

  public IrisITSDocument(IITSDocument itsDocument, String realPath) {
    itemKey = itsDocument.getItemKey();
    stimulusKey = itsDocument.getStimulusKey();

    this.setBankKey(itsDocument.getBankKey());
    this.setBaseUri(itsDocument.getBaseUri());
    this.setFormat(itsDocument.getFormat());
    this.setType(itsDocument.getType());
    this.setRealPath(realPath);
  }

  @Override
  public String getFormat() {
    return format;
  }

  @Override
  public long getItemKey () {
    return itemKey;
  }

  @Override
  public long getStimulusKey () {
    return stimulusKey;
  }

  @Override
  public ITSContent getContent (String language) {
    return null;
  }

  @Override
  public ITSContent getContentDefault () {
    return null;
  }

  @Override
  public List<String> getMediaFiles () {
    return null;
  }
}
