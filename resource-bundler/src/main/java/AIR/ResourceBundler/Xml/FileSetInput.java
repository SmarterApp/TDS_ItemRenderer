/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2016 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/* using System.Xml.Linq; */

package AIR.ResourceBundler.Xml;

import java.io.File;
import java.util.regex.Pattern;

import org.apache.commons.io.FilenameUtils;
import org.jdom2.Attribute;
import org.jdom2.Element;

import AIR.Common.Utilities.Path;

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
		setPath(_fileSet.resolveFile(fileEl.getValue()));
    Attribute attrib = null;

    attrib = fileEl.getAttribute ("prepend");
    _prepend = (attrib != null) ? attrib.getValue () : null;

    attrib = fileEl.getAttribute ("append");
    _append = (attrib != null) ? attrib.getValue () : null;
	}

	public String tryGetPathRelativeTo(String from, PathFormatter pathFormatter) {
		String relativePath;
		relativePath = getPathRelativeTo(from, pathFormatter);
		return relativePath;

	}

	public String getPathRelativeTo(String from, PathFormatter pathFormatter) {
		if (pathFormatter == null) {
			pathFormatter = new PathFormatter();
  }

		String formattedPath = pathFormatter.format(_path);
		return getRelative(from, formattedPath);
	}

	// Equivalent to .net PathEx.getRelative()
	public String getRelative(String basePath, String targetPath) {

		targetPath = targetPath.replace('\\', '/');
		basePath = basePath.replace('\\', '/');

		String pathSeparator = "/";
		// Normalize the paths
		String normalizedTargetPath = FilenameUtils.normalizeNoEndSeparator(targetPath);
		String normalizedBasePath = FilenameUtils.normalizeNoEndSeparator(basePath);

		// Undo the changes to the separators made by normalization
		normalizedTargetPath = FilenameUtils.separatorsToUnix(normalizedTargetPath);
		normalizedBasePath = FilenameUtils.separatorsToUnix(normalizedBasePath);

		String[] base = normalizedBasePath.split(Pattern.quote(pathSeparator));
		String[] target = normalizedTargetPath.split(Pattern.quote(pathSeparator));

		// First get all the common elements. Store them as a string,
		// and also count how many of them there are.
		StringBuffer common = new StringBuffer();

		int commonIndex = 0;
		while (commonIndex < target.length && commonIndex < base.length
				&& target[commonIndex].equals(base[commonIndex])) {
			common.append(target[commonIndex] + pathSeparator);
			commonIndex++;
		}

		if (commonIndex == 0) {
			// No single common path element. This most
			// likely indicates differing drive letters, like C: and D:.
			// These paths cannot be relativized.
			try {
				throw new Exception("No common path element found for '" + normalizedTargetPath + "' and '"
						+ normalizedBasePath + "'");
			} catch (Exception e) {

			}
		}

		// The number of directories we have to backtrack depends on whether the
		// base is a file or a dir
		// For example, the relative path from
		//
		// /foo/bar/baz/gg/ff to /foo/bar/baz
		//
		// ".." if ff is a file
		// "../.." if ff is a directory
		//
		// The following is a heuristic to figure out if the base refers to a
		// file or dir. It's not perfect, because
		// the resource referred to by this path may not actually exist, but
		// it's the best I can do
		boolean baseIsFile = true;

		File baseResource = new File(normalizedBasePath);

		if (baseResource.exists()) {
			baseIsFile = baseResource.isFile();

		} else if (basePath.endsWith(pathSeparator)) {
			baseIsFile = false;
		}

		StringBuffer relative = new StringBuffer();

		if (base.length != commonIndex) {
			int numDirsUp = baseIsFile ? base.length - commonIndex - 1 : base.length - commonIndex;

			for (int i = 0; i < numDirsUp; i++) {
				relative.append(".." + pathSeparator);
			}
		}
		relative.append(normalizedTargetPath.substring(common.length()));
		return relative.toString();
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
