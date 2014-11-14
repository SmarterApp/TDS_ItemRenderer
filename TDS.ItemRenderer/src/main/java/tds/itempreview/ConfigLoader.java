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
package tds.itempreview;

import java.io.File;
import java.io.IOException;
import java.net.URISyntaxException;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Transformer;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;

import AIR.Common.Json.JsonHelper;
import AIR.Common.Utilities.Path;
import AIR.Common.Web.EncryptionHelper;
import AIR.Common.Web.UrlHelper;
import AIR.Common.Web.WebHelper;
import AIR.Common.Web.Session.HttpContext;
import AIR.Common.Web.Session.Server;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class ConfigLoader
{
  private String _rootPath = Server.getDocBasePath ();

  public Config load () throws IOException, URISyntaxException {
    // get config file path
    String configFile = WebHelper.getQueryString ("data");
    String contentPath = WebHelper.getQueryString ("content") == null ? "ItemPreviewContent" : WebHelper.getQueryString ("content");

    // get config
    Config config;
    if (configFile != null) {
      // load a specific config
      config = loadJson (configFile);
    } else {
      // check for default config
      String defaultConfigFile = Server.mapPath (Path.combine (contentPath, "config.json"));
      if (Path.exists (defaultConfigFile)) {
        // use default config file inside content folder
        config = loadJson (defaultConfigFile);
      } else {
        // scan the folder for xml's and build custom config
        config = loadFolder (contentPath);
      }
    }

    // check if we should encrypt paths
    if (ItemPreviewSettings.getEncryptPaths ().getValue ()) {
      encryptPaths (config);
    }
    // check if we should convert file paths to http url's
    else if (ItemPreviewSettings.getForceHttpContent ().getValue ()) {
      setHttpPaths (_rootPath, config);
    }

    return config;
  }

  // / <summary>
  // / Load the config from a json file.
  // / </summary>
  private Config loadJson (String configFile) throws IOException {
    Config config = null;

    // resolve the full file path with file name
    configFile = Path.combine (_rootPath, configFile);

    // get the full path
    String configBasePath = configFile.replace (Path.getFileName (configFile), "");

    // check if config exists
    if (Path.exists (configFile)) {
      // load json config
      String textConfig = FileUtils.readFileToString (new File (configFile));

      config = JsonHelper.deserialize (textConfig, Config.class);
      setFilePaths (configBasePath, config);
    }

    return config;
  }

  // / <summary>
  // / Build the config based on xml in a folder.
  // / </summary>
  private Config loadFolder (String contentPath) throws URISyntaxException {
    String contentFullPath = Path.combine (_rootPath, contentPath);
    // load content folder
    ConfigBuilder configBuilder = new ConfigBuilder (contentFullPath);
    configBuilder.setFilterFormat (WebHelper.getQueryString ("format"));
    configBuilder.setFilterResponseType (WebHelper.getQueryString ("responseType"));
    return configBuilder.create ();
  }

  // / <summary>
  // / Set file paths for JSON config.
  // / </summary>
  private void setFilePaths (final String configBasePath, Config config) {
    for (Page configPage : config.getPages ()) {
      if (configPage.getPassage () != null)
        setFilePath (configBasePath, configPage.getPassage ());
      if (configPage.getItems () != null)
        CollectionUtils.transform (configPage.getItems (), new Transformer ()
        {
          @Override
          public Object transform (Object ic) {
            setFilePath (configBasePath, (Item) ic);
            return ic;
          }
        });
    }
  }

  // / <summary>
  // / Set file path for JSON config content.
  // / </summary>
  private void setFilePath (String configBasePath, Content configContent) {
    if (UrlHelper.IsHttpProtocol (configContent.getFile ()))
      return;

    // combine base path of web site with the relative path
    String filePath = Path.combine (configBasePath, configContent.getFile ());
    configContent.setFile (filePath);
  }

  private void setHttpPaths (final String rootPath, Config config) {
    for (Page configPage : config.getPages ()) {
      if (configPage.getPassage () != null)
        setHttpPath (rootPath, configPage.getPassage ());
      if (configPage.getItems () != null)
        CollectionUtils.transform (configPage.getItems (), new Transformer ()
        {

          @Override
          public Object transform (Object ic) {
            setHttpPath (rootPath, (Item) ic);
            return ic;
          }
        });
    }
  }

  private void setHttpPath (String rootPath, Content configContent) {
    if (UrlHelper.IsHttpProtocol (configContent.getFile ()))
      return;

    String relativePath = configContent.getFile ().replace (rootPath, "");
    relativePath = StringUtils.replace (relativePath, "\\", "/");
    configContent.setFile (Server.getContextPath () + relativePath);
  }

  private void encryptPaths (Config config) {
    for (Page configPage : config.getPages ()) {
      configPage.setEncrypted (true);
      if (configPage.getPassage () != null)
        encryptPath (configPage.getPassage ());
      if (configPage.getItems () != null)
        CollectionUtils.transform (configPage.getItems (), new Transformer ()
        {

          @Override
          public Object transform (Object configContent) {
            encryptPath ((Content) configContent);
            return configContent;
          }
        });
    }
  }

  private void encryptPath (Content configContent) {
    configContent.setFile (EncryptionHelper.EncryptToBase64 (configContent.getFile ()));
  }
}
