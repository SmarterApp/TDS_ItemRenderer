/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox;

import java.util.ArrayList;
import java.util.HashMap;

import org.apache.commons.lang.StringUtils;

import AIR.Common.Configuration.AppSetting;
import AIR.Common.Configuration.AppSettings;
import AIR.Common.Utilities.Path;
import AIR.Common.Web.UrlHelper;
import AIR.Common.Web.Session.HttpContext;
import AIR.ResourceBundler.Xml.FileSet;
import AIR.ResourceBundler.Xml.Resources;

public class ResourcesSingleton
{
  private static final Object _syncRoot = new Object(); // for locking
  private static final HashMap<String, Resources> _resourcesLookup = new HashMap<String, Resources>();

  /// The unique ID to put on all the resource url's.
  private static AppSetting<String> _cacheId;

  public static AppSetting<String> getCacheId(){
    // TODO Ayo/Shiva got AppSettings.getString from AIR.Common.Configurations.AppSettings
    return AppSettings.getString ("http.cache.id");
    // return AppSettings.get<String>("http.cache.id");
  }


  private static Resources get(String file){
    Resources resources;
    // TODO Ayo/Shiva How would you port this, considering original Dictionary was not made case in-sensitive
    resources = _resourcesLookup.get(file);
    return resources;
  }

  public static Resources load(String virtualPath){
    Resources resources = get(virtualPath);

    if (resources == null){
      // TODO Ayo/Shiva Locking method? Synchronized block?
      synchronized (_syncRoot){
        resources = get(virtualPath);

        if (resources == null){
          // String filePath = UrlHelper.ResolveUrl(virtualPath);
          String filePath = HttpContext.getCurrentContext ().getServer ().mapPath (virtualPath);
          resources = new Resources(filePath);
        }
      }
    }

    return resources;
  }

  public static String resolveUrl(String virtualPath, boolean includeCacheID, boolean includeCheckSum){
    // resolved url
    String url = UrlHelper.resolveUrl(virtualPath);

    // cache ID, this is used to change URL's signature
    if (includeCacheID && !StringUtils.isEmpty (_cacheId.getValue ())){
      url += url.contains("?") ? "&" : "?";
      url += "cid=" + _cacheId;
    }

    return url;
  }

  public static String resolveUrl(String virtualPath){
    return resolveUrl(virtualPath, true, true);
  }

  public static Iterable<String> getFilePaths(String resourceFileVirtualPath, String fileSetID) {
    return getFilePaths (resourceFileVirtualPath, fileSetID, true);
  }
  /**
   * Gets a list of all the relative file paths for a resource group.
   * @param resourceFileVirtualPath The virtual path for a resource xml file.
   * @param fileSetID The resource ID inside the xml file.
   * @param addCRC If this is true adds the checksum to the querystring of the file path.
   * @return
   */
  public static Iterable<String> getFilePaths(String resourceFileVirtualPath, String fileSetID, boolean addCRC){
    //TODO mpatel - remove following code while fixing this method
    Iterable<String> returnList = new ArrayList<String> ();
    return returnList;
    
    //TODO mpatel - Fix this method when started porting BlackBoxHandler 
   /* // TODO Ayo/Shiva boolean AddCRC set to true in method declaration
    String resourceFileName = Path.getFileName(resourceFileVirtualPath);

    // e.x., "/student/"
    // TODO Ayo/Shiva ResolveFullUrl method not yet implemented in UrlHelper class
    String baseUrl = UrlHelper.resolveFullUrl("~/");

    // e.x. "~/shared/"
    String resourceVirtualPath = resourceFileVirtualPath.replace(resourceFileName, "");

    // get all the top level resources
    Resources resources = load(resourceFileVirtualPath);
    FileSet fileSet = resources.getFileSet(fileSetID);
    // TODO Ayo/Shiva yield
    if (fileSet == null) 
      break;

    // get a list of all the resource files
    // TODO Ayo/Shiva => operator
    Iterable<String> resourceFiles = (HttpContext.getCurrentContext ().isDebuggingEnabled() || (fileSet.getOutput() == null))
        ? fileSet.Inputs.Select(input => input.Path)
            : new List<String> { fileSet.getOutput () };

            for(String resourceFile : resourceFiles){
              // resourceFile.Href: "../scripts/libraries/yui/button/assets/skins/sam/button.css"

              // check if resource file is already well formed url
              if (Uri.IsWellFormedUriString(resourceFile, UriKind.Absolute)){
                // TODO Ayo/Shiva Port Yield
                yield return resourceFile;
              }else{
                // e.x., "~/shared/../scripts/libraries/yui/button/assets/skins/sam/button.css"
                String resourceFileResolved = Path.combine(resourceVirtualPath, resourceFile);

                // replace placeholder with project specific path
                if (resourceFileResolved.contains("{0}")){
                  // e.x., "~/shared/../projects/{0}/css/login.css" --> ~/shared/../projects/Oregon/css/login.css
                  resourceFileResolved = String.format(resourceFileResolved, BlackboxSettings.getMessagesName());
                }

                // e.x., "/student/scripts/libraries/yui/button/assets/skins/sam/button.css"
                // yield return UrlHelper.ResolveFullUrl(resourceFileResolved).Replace(baseUrl, "");
                yield return UrlHelper.resolveFullUrl(resourceFileResolved);
              }
            }*/
  }

}
