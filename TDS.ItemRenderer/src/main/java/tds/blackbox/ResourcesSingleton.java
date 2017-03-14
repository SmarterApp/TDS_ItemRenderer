/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2016 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox;

import java.io.File;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.commons.lang.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import AIR.Common.Configuration.AppSetting;
import AIR.Common.Configuration.AppSettings;
import AIR.Common.Helpers.CaseInsensitiveMap;
import AIR.Common.Utilities.Path;
import AIR.Common.Web.UrlHelper;
import AIR.Common.Web.Session.HttpContext;
import AIR.Common.Web.Session.Server;
import AIR.ResourceBundler.Xml.FileSet;
import AIR.ResourceBundler.Xml.FileSetInput;
import AIR.ResourceBundler.Xml.PathFormatter;
import AIR.ResourceBundler.Xml.Resources;
import AIR.ResourceBundler.Xml.ResourcesException;
import AIR.WebResources.CachePrefetchMode;
import AIR.WebResources.IStylePathHandler;
import AIR.WebResources.ManifestSingleton;

/*A helper class for ResourcesLink to load a resource file*/
public class ResourcesSingleton
{
  private static final Logger                 _logger          = LoggerFactory.getLogger (ResourcesSingleton.class);
  private static final Object                 _syncRoot        = new Object ();                                     // for
                                                                                                                     // //
                                                                                                                     // locking
  private static final Map<String, Resources> _resourcesLookup = new CaseInsensitiveMap<Resources> ();
  private static IStylePathHandler            _stylePathHandler;
	/* SB-1505: start merge */

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
		return "SBAC";
	}

	public static String formatResourcePath(String path) {
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

	/* SB-1505: end merge */

  public static String getStylePath () {
    return (_stylePathHandler != null) ? _stylePathHandler.execute () : "AIR";
  }

  public static AppSetting<String> getCacheId () {
    return AppSettings.getString ("http.cache.id");
  }

  public static AppSetting<Boolean> getCacheValidate () {
    return AppSettings.getBoolean ("http.cache.validate");
  }

  // / <summary>
  // / Check if the manifest is enabled.
  // / </summary>
  public static AppSetting<CachePrefetchMode> getPrefetchMode () {
    final String settingName = "http.cache.prefetch";
    String prefetchModeStr = AppSettings.<String> getString (settingName).getValue ();

    // if manifest mode does not exist return disabled
    if (StringUtils.isEmpty (prefetchModeStr)) {
      return new AppSetting<CachePrefetchMode> (settingName, CachePrefetchMode.Disabled);
    }

    CachePrefetchMode prefetchMode = CachePrefetchMode.valueOf (prefetchModeStr);
    return new AppSetting<CachePrefetchMode> (settingName, prefetchMode);
  }

  public static boolean getIsPrefetchEnabled () {
    if (ManifestSingleton.getIsEnabled ())
      return false;
    return (getPrefetchMode ().getValue () == CachePrefetchMode.Enabled);
  }

  public static Resources load (String virtualPath) throws ResourcesException {
		virtualPath = formatResourcePath(virtualPath);
    String filePath = Server.mapPath (virtualPath);
    Resources resources = get (filePath);

    if (resources == null) {
      synchronized (_syncRoot) {
        resources = get (filePath);
        if (resources == null) {

          resources = new Resources (filePath);
          try {
            resources.parse ();
          } catch (Exception e) {
            e.printStackTrace ();
            _logger.error ("Error encoding all", e);
            throw new ResourcesException (String.format ("Error parsing resources file %s", virtualPath), e);
          }
          _resourcesLookup.put (filePath, resources);
          _resourcesLookup.put (virtualPath, resources);
        }
      }
    }

    return resources;
  }

  public static String resolveUrl (String virtualPath) throws URISyntaxException {
    return resolveUrl (virtualPath, true, true);
  }

  public static String resolveUrl (String virtualPath, boolean includeCacheID, boolean includeCheckSum) throws URISyntaxException {
    // check for replacement
		virtualPath = formatResourcePath(virtualPath);

    // resolve url
    String url = UrlHelper.resolveFullUrl (virtualPath);

    // cache ID, this is used to change URL's signature
    if (includeCacheID && !StringUtils.isEmpty (getCacheId ().getValue ())) {
      url += StringUtils.contains (url, "?") ? "&" : "?";
      url += "cid=" + getCacheId ().getValue ();
    }

    if (includeCheckSum) {
      String fileHash = ManifestSingleton.getFileHash (virtualPath);
      if (fileHash != null) {
        url += StringUtils.contains (url, "?") ? "&" : "?";
        url += "chksum=" + fileHash;
      }
    }
    return url;
  }

  public static List<String> getFilePaths (String resourceFileVirtualPath, String fileSetID) throws URISyntaxException, ResourcesException {
    return getFilePaths (resourceFileVirtualPath, fileSetID, true);
  }

  /**
   * Gets a list of all the relative file paths for a resource group.
   * 
   * @param resourceFileVirtualPath
   *          The virtual path for a resource xml file.
   * @param fileSetID
   *          The resource ID inside the xml file.
   * @param addCRC
   *          If this is true adds the checksum to the querystring of the file
   *          path.
   * @return
   * @throws URISyntaxException
   * @throws ResourcesException 
   */
  public static List<String> getFilePaths (String resourceFileVirtualPath, String resourceID, boolean addCRC) throws URISyntaxException, ResourcesException {
		String resourceFileDir = Path.getDirectoryName(resourceFileVirtualPath);
		String rootVirtualPath = Server.mapPath("~/");
    List<String> returnList = new ArrayList<String> ();

    // get all the top level resources
    Resources resources = load (resourceFileVirtualPath);
    final FileSet fileSet = resources.getFileSet (resourceID);
    if (fileSet == null)
      return returnList;

    boolean isSeperated = (HttpContext.getCurrentContext ().isDebuggingEnabled () || StringUtils.isEmpty (fileSet.getOutput ()));

    // get all the file paths
    List<String> filePaths = new ArrayList<String> ();
    if (isSeperated) {
      // <-- debug is enabled or no combined output
      Iterator<FileSetInput> fileIterator = fileSet.getFileInputs ();
      while (fileIterator.hasNext ()) {
        FileSetInput fileSetInput = fileIterator.next ();
				String relativePath = fileSetInput.tryGetPathRelativeTo(rootVirtualPath, new PathFormatter());
				filePaths.add(relativePath);
      }
    } else
      // <-- debug is disabled and there is a combined output
			filePaths.add(Path.combine(resourceFileDir, fileSet.getOutput()));

    for (String filePath : filePaths) {
			if (Path.isAbsolute(filePath))
				returnList.add(filePath);
			else
				returnList.add(resolveUrl(filePath));
    }

    return returnList;
  }

  private static Resources get (String file) {
    return _resourcesLookup.get (file);
  }

}
