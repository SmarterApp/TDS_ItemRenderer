/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

public abstract class IItemRender
{
  private boolean _selected;      // Is this the active item (e.x.,
                                             // writing
  // this would mean it is shown only)
  private boolean           _disabled;      // I s the item disabled where it
                                             // cannot be
  // responded to but still visible
  private boolean           _mark;          // Is the item marked for review
  private boolean           _isFirst;       // Is this the first item on the
                                             // page
  private boolean           _isLast;        // Is this the last item on the
                                             // page
  private IITSDocument      _item;          // Item's content
  private String            _label;         // Label for the question
  private int               _position;      // Position within test
  private int               _positionOnPage; // What is the item's order on the
                                             // page
  private String            _response;      // Answer to question
  private boolean           _printable;     // Can this item be printed.
  private boolean           _printed;       // Was this item printed
                                             // automatically on
  // the server.

  private boolean           _hasTutorial;   //
  private boolean           _hasGTR;        //
  private String            _copyright;     //
  private String            _id;            // The HTML ID.
  private String            _className;     // The HTML classes

  public boolean getDisabled () {
    return _disabled;
  }

  public void setDisabled (boolean value) {
    _disabled = value;
  }

  public boolean getSelected () {
    return _selected;
  }

  public void setSelected (boolean value) {
    this._selected = value;
  }

  public boolean getMark () {
    return _mark;
  }

  public void setMark (boolean value) {
    _mark = value;
  }

  public boolean getIsFirst () {
    return _isFirst;
  }

  public void setIsFirst (boolean value) {
    _isFirst = value;
  }

  public boolean getIsLast () {
    return _isLast;
  }

  public void setIsLast (boolean value) {
    _isLast = value;
  }

  public IITSDocument getItem () {
    return _item;
  }

  public void setItem (IITSDocument value) {
    _item = value;
  }

  public String getLabel () {
    return _label;
  }

  public void setLabel (String value) {
    _label = value;
  }

  public int getPosition () {
    return _position;
  }

  public void setPosition (int value) {
    _position = value;
  }

  public int getPositionOnPage () {
    return _positionOnPage;
  }

  public void setPositionOnPage (int value) {
    _positionOnPage = value;
  }

  public String getResponse () {
    return _response;
  }

  public void setResponse (String value) {
    _response = value;
  }

  public boolean getPrintable () {
    return _printable;
  }

  public void setPrintable (boolean value) {
    _printable = value;
  }

  public boolean getPrinted () {
    return _printed;
  }

  public void setPrinted (boolean value) {
    _printed = value;
  }

  public boolean getHasTutorial () {
    return _hasTutorial;
  }

  protected void setHasTutorial (boolean value) {
    _hasTutorial = value;
  }

  public boolean getHasGtr () {
    return _hasGTR;
  }

  protected void setHasGtr (boolean value) {
    _hasGTR = value;
  }

  public String getCopyright () {
    return _copyright;
  }

  public String getId () {
    return _id;
  }

  public String getClassName () {
    return _className;
  }

}
