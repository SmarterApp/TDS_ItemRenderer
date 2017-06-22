/*******************************************************************************************************
 * Educational Online Test Delivery System
 * Copyright (c) 2016 American Institutes for Research
 *
 * Distributed under the AIR Open Source License, Version 1.0
 * See accompanying file AIR-License-1_0.txt or at 
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 *******************************************************************************************************/

package AIR.ResourceBundler.Xml;

import java.io.File;

import AIR.Common.Web.Session.Server;

/*This class provides a method to format a file path with client name, and handles paths starting with '~'. In .net ResourcesLink, ResourcesSingleton and FileSetInput use a function pointer for this format method, but since Java has no equivalent, we put that function inside this class.*/
public class PathFormatter {

	private static final String _defaultClientStylePath = "AIR";

	/// <summary>
	/// Get the client style path.
	/// </summary>
	/// <remarks>
	/// StudentSettings.GetClientStylePath()
	/// </remarks>
	public static String getResourcesPathFormatArgs() {
		String str = _resourcePathFormatArgsHandler();
		str = (str != null) ? str : _defaultClientStylePath;
		return str;
	}

	private static String _resourcePathFormatArgsHandler() {
		// TODO Auto-generated method stub
		return null;
	}

	String format(String path) {
		// check for replacement
		if (path.indexOf("%s") > 0) {
			String formatArgs = getResourcesPathFormatArgs();
			String resourcePath = String.format(path, formatArgs);

			String physicalPath = resourcePath.startsWith("~") ? Server.mapPath(resourcePath) : resourcePath;

			if (!new File(physicalPath).exists()) {
				formatArgs = _defaultClientStylePath;
				resourcePath = String.format(path, formatArgs);
			}

			path = resourcePath;
		}

		return path;
	}
}
