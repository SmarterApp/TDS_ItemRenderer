/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/**
 * 
 */
package tds.itemrenderer.webcontrols;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class PageSettings
{
  public enum UniqueIdType {
    GroupId, IRiSGuid, PageLayout
  }

  private boolean      _includePageWrapper = false;
  private boolean      _includeItemWrapper = false;
  private UniqueIdType _useUniquePageID    = UniqueIdType.PageLayout;
  private boolean      _includeJson        = false;

  // / <summary>
  // / Include a div wrapper around the page
  // / </summary>
  public boolean getIncludePageWrapper () {
    return _includePageWrapper;
  }

  public void setIncludePageWrapper (boolean value) {
    _includePageWrapper = value;
  }

  public boolean getIncludeItemWrapepr () {
    return _includeItemWrapper;
  }

  public void setIncludeItemWrapper (boolean value) {
    _includeItemWrapper = value;
  }

  // / <summary>
  // / Include a unique ID on the page wrapper
  // / </summary>
  public UniqueIdType getUseUniquePageId () {
    return _useUniquePageID;
  }

  public void setUseUniquePageId (UniqueIdType value) {
    _useUniquePageID = value;
  }

  // / <summary>
  // / Embed JSON into the page with all the item information
  // / </summary>
  public boolean getIncludeJson () {
    return _includeJson;
  }

  public void setIncludeJson (boolean value) {
    _includeJson = value;
  }
}
