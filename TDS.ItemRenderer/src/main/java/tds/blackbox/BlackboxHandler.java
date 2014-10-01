/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox;

import java.io.BufferedWriter;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.net.URISyntaxException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import tds.itemrenderer.configuration.ITSConfig;
import AIR.Common.Json.JsonHelper;
import AIR.Common.Web.BrowserParser;
import AIR.Common.Web.ContentType;
import AIR.Common.Web.HttpHandlerBase;
import AIR.Common.Web.UrlHelper;
import AIR.Common.Web.WebHelper;
import AIR.Common.Web.Session.Server;

// Call this in a HTML script tag to load blackbox scripts.
@Controller
@Scope ("prototype")
public class BlackboxHandler extends HttpHandlerBase
{

  @RequestMapping (value = "Blackbox.axd/loadSeed")
  @ResponseBody
  private void loadSeedData(HttpServletRequest request,HttpServletResponse response) throws IOException, URISyntaxException{
    setMIMEType(ContentType.Javascript);

    String clientName = BlackboxSettings.getClientName();
    if (clientName == null) 
      throw new IllegalArgumentException("Must provide a client name.");

    String testShellName = BlackboxSettings.getShellName();

    // get variables
    
    StringWriter stringWriter = new StringWriter();
    BufferedWriter scriptWriter = new BufferedWriter (stringWriter);
    
    scriptWriter.write(String.format ("var javaFolder = '{0}';", UrlHelper.resolveFullUrl(ITSConfig.getJavaFolder ())));
    scriptWriter.newLine ();
    scriptWriter.write("if (typeof blackboxConfig != 'object') blackboxConfig = {};");
    scriptWriter.newLine ();
    scriptWriter.write(String.format ("blackboxConfig.baseUrl = '{0}';", UrlHelper.getBase ()));
    scriptWriter.newLine ();
    scriptWriter.write(String.format ("blackboxConfig.client = '{0}';", clientName));
    scriptWriter.newLine ();

    // get test shell name
    scriptWriter.write(String.format ("blackboxConfig.testShellName = '{0}';", testShellName));
    scriptWriter.newLine ();

    // get test shell template
    String testShellHtml = getTestShellHtml();
    StringEscapeUtils.escapeJavaScript (testShellHtml);
    //TODO mpatel - make sure StringEscapeUtils.escapeJavaScript produce the same result as HttpUtility.JavaScriptStringEncode
//    testShellHtml = HttpUtility.JavaScriptStringEncode(testShellHtml); // encode template
    testShellHtml = StringEscapeUtils.escapeJavaScript (testShellHtml);
    scriptWriter.write(String.format ("blackboxConfig.testShellHtml = '{0}';", testShellHtml));
    scriptWriter.newLine ();

    // get styles
    List<String> stylePaths = (List<String>) getResolveStylePaths();
    scriptWriter.write(String.format ("blackboxConfig.styles = {0};", JsonHelper.serialize(stylePaths)));
    scriptWriter.newLine ();

    // get scripts
    List<String> scriptPaths = (List<String>) getScriptPaths();
    scriptWriter.write(String.format ("blackboxConfig.scripts = {0};", JsonHelper.serialize(scriptPaths)));
    scriptWriter.newLine ();

    writeString(scriptWriter.toString());

    // write out javascript for loading the above data
    String bxSeedPath = Server.mapPath("Scripts/Blackbox/blackbox_handler.js");
    
    //TODO mpatel - Test following code if working exactly like Dotnet writeFile
    InputStream inputStream = BlackboxHandler.class.getResourceAsStream (bxSeedPath);
    response.getOutputStream ().write (IOUtils.toByteArray (inputStream));
//    CurrentContext.Response.WriteFile(bxSeedPath);
  }

  private Collection<String> getScriptPaths() {
    // TODO Ayo/Shiva ?? Operator
    String resourceFile = String.format("~/Scripts/{0}", WebHelper.getQueryString("scriptsFile")!=null?WebHelper.getQueryString("scriptsFile"): "scripts_blackbox.xml");
    String scriptsID = WebHelper.getQueryString("scriptsID")!=null?WebHelper.getQueryString("scriptsID"): BlackboxSettings.getShellName();

    List<String> returnList = new ArrayList<String>();
    // get a list of file paths
    for (String filePath : ResourcesSingleton.getFilePaths(resourceFile, scriptsID, true)) {
      returnList.add (filePath);
    }

    // include mathjax
    for (String filePath : ResourcesSingleton.getFilePaths(resourceFile, "libs-mathjax", true)) {
      returnList.add (filePath);
    }

    // if this is IE 6-8 then include svgweb
    BrowserParser browserParser = BrowserParser.getCurrent ();
    if (browserParser.isIE () && browserParser.getVersion () < 9) {
      for (String filePath : ResourcesSingleton.getFilePaths(resourceFile, "libs-svgweb", true)) {
        returnList.add (filePath);           
      }
    }

    // include the blackbox handler scripts used to load everything
    for (String filePath : ResourcesSingleton.getFilePaths(resourceFile, "handler", true)) {
      returnList.add (filePath);
    }

    return returnList;
  }

  private Collection<String> getStylePaths() {
    String resourceFile = String.format("~/Shared/{0}", WebHelper.getQueryString("stylesFile")!=null? WebHelper.getQueryString("stylesFile"): "styles_blackbox.xml");
    String stylesID = WebHelper.getQueryString("stylesID")!=null?WebHelper.getQueryString("stylesID"): BlackboxSettings.getShellName();
    
    List<String> returnList = new ArrayList<String>();

    // get base styles
    for (String filePath : ResourcesSingleton.getFilePaths(resourceFile, "base")) {
      returnList.add (filePath);
      // yield return filePath;
    }

    for (String filePath : ResourcesSingleton.getFilePaths(resourceFile, stylesID)) {
      returnList.add (filePath);
      // yield return filePath;
    }
    
    return returnList;
  }

  private Collection<String> getResolveStylePaths() throws URISyntaxException {
    List<String> returnList = new ArrayList<String>();
    for (String stylePath : getStylePaths()) {
      // TODO Ayo/Shiva Changed String.format to TDSStringUtils.format
      String formattedStylePath = String.format(stylePath, BlackboxSettings.getClientName());
      returnList.add (UrlHelper.resolveFullUrl(formattedStylePath));
      
      //TODO mpatel - Check how to use this return yield 
      // yield return UrlHelper.ResolveFullUrl(formattedStylePath);
    }
    //TODO remove this later and change code according to Dot net version
    return returnList;
  } 

  private String getTestShellHtml() {
    String templateName = BlackboxSettings.getShellName();

    // render template
    // TODO mpatel - Find the sollution to replicate RenderUserControl functionality
    String scriptsHtml = "";
//    String scriptsHtml = RenderUserControl(String.format("~/Templates/Shells/{0}.ascx", templateName));
    
    // simple escaping
    scriptsHtml = scriptsHtml.replace("\\", "\\\\");
    scriptsHtml = scriptsHtml.replace("'", "\\'");

    return scriptsHtml;
  }

  @Override
  protected void onBeanFactoryInitialized () {
    // TODO Auto-generated method stub

  }

}

