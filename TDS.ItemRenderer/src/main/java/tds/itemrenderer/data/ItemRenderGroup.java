/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

import java.util.AbstractList;
import java.util.List;
import java.util.ArrayList;

/**
 * 
 * @author
 * 
 */
public class ItemRenderGroup extends ArrayList<IItemRender>
{
  /**
   * 
   */
  private static final long serialVersionUID = 1L;
  private String            _id;
  private String            _segmentID;
  private String            _language;
  private IITSDocument      _passage;             // The passage for groups
  private boolean           _printed;             // Item printed automatically
                                                   // on the server?

  public ItemRenderGroup (String id, String segmentID, String language) {
    _id = id;
    _segmentID = segmentID;
    _language = language;
  }

  public String getId () {
    return _id;
  }

  protected void setId (String value) {
    this._id = value;
  }

  public String getSegmentID () {
    return _segmentID;
  }

  protected void setSegmentID (String value) {
    this._segmentID = value;
  }

  public String getLanguage () {
    return _language;
  }

  protected void setLanguage (String value) {
    this._language = value;
  }

  public IITSDocument getPassage () {
    return _passage;
  }

  public void setPassage (IITSDocument value) {
    this._passage = value;
  }

  // Was this item printed automatically on the server.
  public boolean getPrinted () {
    return _printed;
  }

  public void setPrinted (boolean value) {
    _printed = value;
  }

  // Does this group have a passage
  public boolean getHasPassage () {
    return (_passage != null);
  }

  // Does this group have any items
  public boolean getHasItems () {
    return (this.size () > 0);
  }

  // Add a item to the group to render
  @Override
  public boolean add (IItemRender itemRender) {
    // if postion on page is 0 then auto assign its position within the group,
    // otherwise someone else assigned this
    if (itemRender.getPositionOnPage () == 0)
      itemRender.setPositionOnPage (this.size () + 1);

    return super.add (itemRender);

  }

  public void setLayout (String value) {
    IITSDocument passage = getPassage ();
    if (passage != null) {
      passage.setLayout (value);
    }
    for (IItemRender item : this) {
      item.getItem ().setLayout (value);
    }
  }
}
