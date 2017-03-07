/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/*
 * using System; using System.Collections.Generic; using System.Linq; using
 * System.Xml.Linq; using System.Xml.Serialization;
 */

package AIR.ResourceBundler.Xml;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlAttribute;

import org.jdom2.Element;
import org.jdom2.Attribute;

public class FileSet implements IFileSetEntry
{
  private Resources             _parentResources;
  private List<IFileSetEntry>   _entries      = new ArrayList<IFileSetEntry> ();
  private Set<FileSet>          _excludedSets = new HashSet<FileSet> ();
  private Map<FileSet, FileSet> _replaceSets  = new HashMap<FileSet, FileSet> ();

  // / <summary>
  // / The name of the FileSet group.
  // / </summary>
  private String                _name;

  // / <summary>
  // / The output file path.
  // / </summary>
  // / <remarks>
  // / This can be NULL if there is no output file for this resource and it is
  // just used as a dependency.
  // / </remarks>
  private String                _output;

  // / <summary>
  // / Filter out the excluded file pointers.
  // / </summary>
  private Iterator<IFileSetEntry> getFileEntries (Iterator<IFileSetEntry> entries) {

    // creating List to return instead of Enumerable<IFileSetEntry> in .NET
    List<IFileSetEntry> list = new ArrayList<IFileSetEntry> ();

    for (; entries.hasNext ();) {
      boolean replaced = false;

      IFileSetEntry fileSetEntry = entries.next ();

      // check if FileSet
      if (fileSetEntry instanceof FileSet) {
        FileSet fileSetRef = (FileSet) fileSetEntry;
        FileSet fileSetReplacement;

        fileSetReplacement = _replaceSets.get (fileSetRef);

        // check if FileSet should be replaced
        if (fileSetReplacement != null) {
          replaced = true;
          list.add (fileSetReplacement);
          // yield return (Iterable<IFileSetEntry>)
          // fileSetReplacement;
        }

        // check if FileSet is excluded
        if (!replaced && !_excludedSets.contains (fileSetRef)) {
          replaced = true;
          list.add (fileSetEntry);
          // yield return (Iterable<IFileSetEntry>) fileSetEntry;
        }
      } else {
        // return FileInput as is
        // yield return (Iterable<IFileSetEntry>) fileSetEntry;
        replaced = true;
        list.add (fileSetEntry);
      }
    }
    return list.iterator ();
  }

  // / <summary>
  // / Get all the file pointers for this FileSet.
  // / </summary>
  private Iterator<IFileSetEntry> getFileEntries () {
    return getFileEntries (_entries.iterator ());
  }

  private Iterator<FileSetInput> getFileInputs (Iterator<IFileSetEntry> entries) {
    // run pointers through exclusion filter
    Iterator<IFileSetEntry> iterator = getFileEntries (entries);
    List<FileSetInput> list = new ArrayList<FileSetInput> ();
    for (; iterator.hasNext ();) {

      IFileSetEntry fileSetEntry = iterator.next ();

      // check for regular FileInput
      if (fileSetEntry instanceof FileSetInput) {
        list.add ((FileSetInput) fileSetEntry);
        // yield return (Iterable<FileSetInput>) fileSetEntry;
      }
      // check for FileSet ref
      else if (fileSetEntry instanceof FileSet) {
        FileSet fileSetRef = (FileSet) fileSetEntry;

        for (Iterator<FileSetInput> iterator2 = getFileInputs (fileSetRef.getFileEntries ()); iterator2.hasNext ();) {
          FileSetInput fileInputRef = iterator2.next ();
          // yield return (Iterable<FileSetInput>) fileInputRef;
          list.add (fileInputRef);
        }
      }
    }
    return list.iterator ();
  }

  // / <summary>
  // / Get all the file inputs.
  // / </summary>
  public Iterator<FileSetInput> getFileInputs () {
    return getFileInputs (_entries.iterator ());
  }

  // #region Settings

  // / <summary>
  // / Compress the javascript code (e.x., remove empty lines, remove
  // comments, remove spaces)
  // / </summary>
  /* [XmlAttribute(AttributeName = "compress")] */
  @XmlAttribute (name = "compress")
  private boolean _compress;

  // / <summary>
  // / Remove any lines that do not have any code.
  // / </summary>
  /* [XmlAttribute(AttributeName = "removeLines")] */
  @XmlAttribute (name = "removeLines")
  private boolean _removeEmptyLines;

  // / <summary>
  // / Removes comments both /**/ and //
  // / </summary>
  /* [XmlAttribute(AttributeName = "removeComments")] */
  @XmlAttribute (name = "removeComments")
  private boolean _removeComments;

  // / <summary>
  // / Remove any extra white space.
  // / </summary>
  // / <remarks>
  // / This seems to be unstable. Test well before trying to use.
  // / </remarks>
  /* [XmlAttribute(AttributeName = "removeSpaces")] */

  @XmlAttribute (name = "removeSpaces")
  private boolean removeSpaces;

  /* #endregion */

  private FileSet () {
    setCompress (true);
    removeSpaces = false; // TODO: fix this so it works better..
    _removeEmptyLines = true;
    _removeComments = true;
  }

  protected FileSet (Resources parentResources) {
    this ();
    _parentResources = parentResources;
  }

  public void parse (Element resourcesEl) throws ResourcesException {
    Attribute fileSetAttrib = null;

    // parse main attributes
    fileSetAttrib = resourcesEl.getAttribute ("name");
    _name = (fileSetAttrib != null) ? fileSetAttrib.getValue () : null;

    fileSetAttrib = resourcesEl.getAttribute ("output");
    setOutput ((fileSetAttrib != null) ? fileSetAttrib.getValue () : null);

    // parse setting attributes
    fileSetAttrib = resourcesEl.getAttribute ("compress");
    if (fileSetAttrib != null)
      _compress = (fileSetAttrib.getValue () == "true");

    fileSetAttrib = resourcesEl.getAttribute ("removeLines");
    if (fileSetAttrib != null)
      _removeEmptyLines = (fileSetAttrib.getValue () == "true");

    fileSetAttrib = resourcesEl.getAttribute ("removeComments");
    if (fileSetAttrib != null)
      _removeComments = (fileSetAttrib.getValue () == "true");

    fileSetAttrib = resourcesEl.getAttribute ("removeSpaces");
    if (fileSetAttrib != null)
      removeSpaces = (fileSetAttrib.getValue () == "true");

    for (Element childEl : resourcesEl.getChildren ()) {
      String childName = childEl.getName ();

      if ("input".equalsIgnoreCase (childName)) {
        parseFileInput (childEl);
      } else if ("reference".equalsIgnoreCase (childName)) {
        parseReference (childEl);
      } else if ("exclude".equalsIgnoreCase (childName)) {
        parseExclude (childEl);
      } else if ("replace".equalsIgnoreCase (childName)) {
        parseReplace (childEl);
      }
    }
  }

  private void parseFileInput (Element fileEl) {
    FileSetInput resourceFile = new FileSetInput (this);
    resourceFile.parse (fileEl);
    _entries.add (resourceFile);
  }

  private void parseReference (Element dependencyEl) throws ResourcesException {
    // lookup dependency
    Attribute setAttrib = dependencyEl.getAttribute ("set");
    String setName = (setAttrib != null) ? setAttrib.getValue () : null;

    // Replacing tts by tts2
    if("tts".equals (setName))
      setName="tts2";
    
    // add files
    FileSet fileSet = _parentResources.getFileSet (setName);

    if (fileSet == null) {
      throw new ResourcesException (String.format ("Could not find the reference set \"%s\".", setName));
    }

    _entries.add (fileSet);
  }

  private void parseExclude (Element excludeEl) {
    Attribute setAttrib = excludeEl.getAttribute ("set");
    String setName = (setAttrib != null) ? setAttrib.getValue () : null;

    // add files
    FileSet fileSet = _parentResources.getFileSet (setName);

    if (fileSet != null) {
      _excludedSets.add (fileSet);
    }
  }

  private void parseReplace (Element replaceEl) {
    // get source fileset
    Attribute setAttrib = replaceEl.getAttribute ("set");
    String fileSetName = (setAttrib != null) ? setAttrib.getValue () : null;
    FileSet fileSet = _parentResources.getFileSet (fileSetName);

    // get desintation fileset
    Attribute newAttrib = replaceEl.getAttribute ("new");
    String newFileSetName = (newAttrib != null) ? newAttrib.getValue () : null;
    FileSet newFileSet = _parentResources.getFileSet (newFileSetName);

    _replaceSets.put (fileSet, newFileSet);
  }

  @Override
  public String toString () {
    return getName ();
  }

  public String getName () {
    return _name;
  }

  public void setName (String value) {
    this._name = value;
  }

  public boolean isCompress () {
    return _compress;
  }

  public void setCompress (boolean value) {
    this._compress = value;
  }

  public boolean isRemoveEmptyLines () {
    return _removeEmptyLines;
  }

  public void setRemoveEmptyLines (boolean value) {
    this._removeEmptyLines = value;
  }

  public boolean isRemoveComments () {
    return _removeComments;
  }

  public void setRemoveComments (boolean value) {
    this._removeComments = value;
  }

  public boolean isRemoveSpaces () {
    return removeSpaces;
  }

  public void setRemoveSpaces (boolean value) {
    this.removeSpaces = value;
  }

  public String getOutput () {
    return _output;
  }

  public void setOutput (String value) {
    this._output = value;
  }
}
