/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/* using System.Xml.Linq; */

package AIR.ResourceBundler.Xml;

import AIR.Common.Utilities.Path;

import org.jdom2.Attribute;
import org.jdom2.Element;

public class FileSetInput implements IFileSetEntry
{
  private FileSet _fileSet;

  private FileSet _parent;

  private String  _path;

  private String  _file;

  // / <summary>
  // / A string to prepend to the beginning of the file input.
  // / </summary>
  // / <remarks>
  // / This is only used when combining the files.
  // / </remarks>
  private String  _prepend;

  // / <summary>
  // / A string to append to the beginning of the file input.
  // / </summary>
  // / <remarks>
  // / This is only used when combining the files.
  // / </remarks>
  private String  _append;

  public FileSetInput (FileSet fileSet)
  {
    _fileSet = fileSet;
  }

  public void parse (Element fileEl)
  {
    // get file path
    setPath (fileEl.getValue ());
    Attribute attrib = null;

    attrib = fileEl.getAttribute ("prepend");
    _prepend = (attrib != null) ? attrib.getValue () : null;

    attrib = fileEl.getAttribute ("append");
    _append = (attrib != null) ? attrib.getValue () : null;
  }

  @Override
  public String toString ()
  {
    return _file;
  }

  public String getFile () {
    return Path.getFileName (getPath ());
  }

  public void setFile (String value) {
    this._file = value;
  }

  public FileSet getParent () {
    return _fileSet;
  }

  public void setParent (FileSet value) {
    this._parent = value;
  }

  public String getPath () {
    return _path;
  }

  public void setPath (String value) {
    this._path = value;
  }

  public String getPrepend () {
    return _prepend;
  }

  public void setPrepend (String value) {
    this._prepend = value;
  }

  public String getAppend () {
    return _append;
  }

  public void setAppend (String value) {
    this._append = value;
  }
}
