/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox;

import java.io.BufferedWriter;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import tds.itemrenderer.configuration.ITSConfig;
import tds.itemrenderer.webcontrols.PageLayout;
import tds.itemrenderer.webcontrols.rendererservlet.RendererServlet;
import AIR.Common.Json.JsonHelper;
import AIR.Common.Utilities.TDSStringUtils;
import AIR.Common.Web.BrowserParser;
import AIR.Common.Web.ContentType;
import AIR.Common.Web.HttpHandlerBase;
import AIR.Common.Web.UrlHelper;
import AIR.Common.Web.WebHelper;
import AIR.Common.Web.Session.Server;
import AIR.ResourceBundler.Xml.ResourcesException;

// Call this in a HTML script tag to load blackbox scripts.
@Controller
@Scope ("prototype")
public class BlackboxHandler extends HttpHandlerBase
{

  @RequestMapping (value = "Blackbox.axd/loadSeed")
  @ResponseBody
  private void loadSeedData (HttpServletRequest request, HttpServletResponse response) throws IOException, URISyntaxException, ResourcesException {
    setMIMEType (ContentType.Javascript);

    String clientName = BlackboxSettings.getClientName ();
    if (clientName == null)
      throw new IllegalArgumentException ("Must provide a client name.");

    String testShellName = BlackboxSettings.getShellName ();

    // get variables

    StringWriter stringWriter = new StringWriter ();
    BufferedWriter scriptWriter = new BufferedWriter (stringWriter);

    scriptWriter.write (TDSStringUtils.format ("var javaFolder = '{0}';", UrlHelper.resolveFullUrl (ITSConfig.getJavaFolder ())));
    scriptWriter.newLine ();
    scriptWriter.write ("if (typeof blackboxConfig != 'object') blackboxConfig = {};");
    scriptWriter.newLine ();
    scriptWriter.write (TDSStringUtils.format ("blackboxConfig.baseUrl = '{0}';", UrlHelper.getBase ()));
    scriptWriter.newLine ();
    scriptWriter.write (TDSStringUtils.format ("blackboxConfig.client = '{0}';", clientName));
    scriptWriter.newLine ();

    // get test shell name
    scriptWriter.write (TDSStringUtils.format ("blackboxConfig.testShellName = '{0}';", testShellName));
    scriptWriter.newLine ();

    // get test shell template
    String testShellHtml = getTestShellHtml ();
    testShellHtml = StringEscapeUtils.escapeJavaScript (testShellHtml);
    scriptWriter.write (TDSStringUtils.format ("blackboxConfig.testShellHtml = '{0}';", testShellHtml));
    scriptWriter.newLine ();

    // toolbars
    String toolbarsFile = Server.mapPath ("~/resources/templates/Shells/toolbars.json");
    String toolbarsJson = FileUtils.readFileToString (new File (toolbarsFile));
    scriptWriter.write (TDSStringUtils.format ("blackboxConfig.testShellToolbars = {0};", toolbarsJson));
    scriptWriter.newLine ();

    // get styles
    List<String> stylePaths = (List<String>) getResolveStylePaths ();
    scriptWriter.write (TDSStringUtils.format ("blackboxConfig.styles = {0};", JsonHelper.serialize (stylePaths)));
    scriptWriter.newLine ();

    // get scripts
    List<String> scriptPaths = (List<String>) getScriptPaths ();
    scriptWriter.write (TDSStringUtils.format ("blackboxConfig.scripts = {0};", JsonHelper.serialize (scriptPaths)));
    scriptWriter.newLine ();

    scriptWriter.close ();
    writeString (stringWriter.toString ());

    // write out javascript for loading the above data
    String bxSeedPath = Server.mapPath ("~/Scripts/Blackbox/blackbox_handler.js");
    response.getWriter ().write (FileUtils.readFileToString (new File (bxSeedPath)));
  }

  private List<String> getScriptPaths () throws URISyntaxException, ResourcesException {
    String testShellName = BlackboxSettings.getShellName ();
    String resourceFile = TDSStringUtils.format ("~/Scripts/{0}", StringUtils.isEmpty (getRequestParameter ("scriptsFile")) ? "scripts_blackbox.xml" : getRequestParameter ("scriptsFile"));
    String scriptsId = StringUtils.isEmpty (getRequestParameter ("scriptsID")) ? testShellName : getRequestParameter ("scriptsID");

    List<String> filePaths = new ArrayList<String> ();
    // get a list of file paths from xml
    for (String filePath : ResourcesSingleton.getFilePaths (resourceFile, scriptsId, true)) {
      filePaths.add (filePath);
    }

    // include the blackbox handler scripts used to load everything
    for (String filePath : ResourcesSingleton.getFilePaths (resourceFile, "handler", true)) {
      filePaths.add (filePath);
    }

    return filePaths;
  }

  private Collection<String> getStylePaths () throws URISyntaxException, ResourcesException {
    String testShellName = BlackboxSettings.getShellName ();
    String resourceFile = TDSStringUtils.format ("~/Shared/{0}", StringUtils.isEmpty (getRequestParameter ("stylesFile")) ? "styles_blackbox.xml" : getRequestParameter ("stylesFile"));
    String stylesId = StringUtils.isEmpty (getRequestParameter ("stylesID")) ? testShellName : getRequestParameter ("stylesID");

    List<String> filePaths = new ArrayList<String> ();
    for (String filePath : ResourcesSingleton.getFilePaths (resourceFile, stylesId)) {
      filePaths.add (filePath);
    }
    return filePaths;
  }

  private Collection<String> getResolveStylePaths () throws URISyntaxException, ResourcesException {
    List<String> returnList = new ArrayList<String> ();
    for (String stylePath : getStylePaths ()) {
      String formattedStylePath = TDSStringUtils.format (stylePath, BlackboxSettings.getClientName ());
      returnList.add (formattedStylePath);
    }
    return returnList;
  }

  private String getTestShellHtml () {
    // render template
    String scriptsHtml = RendererServlet.getRenderedUserControl ("templates", "Default.xhtml");

    // simple escaping
    scriptsHtml = StringUtils.replace (scriptsHtml, "\\", "\\\\");
    scriptsHtml = StringUtils.replace (scriptsHtml, "'", "\\'");
    // replace the new lines and tabs with just space as otherwise it causes
    // issues during rendering of the tools div.
    scriptsHtml = StringUtils.replace (scriptsHtml, "\n", " ");
    scriptsHtml = StringUtils.replace (scriptsHtml, "\r", " ");
    scriptsHtml = StringUtils.replace (scriptsHtml, "\t", " ");
    return scriptsHtml;
  }

  @Override
  protected void onBeanFactoryInitialized () {
    // TODO Auto-generated method stub

  }

}
