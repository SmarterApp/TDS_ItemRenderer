/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/**
 * 
 */
package tds.itempreview;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

//TODO use tds.itempreview.Config;
import tds.itempreview.dummy.Config;

//TODO use tds.itempreview.ConfigLoader;
import tds.itempreview.dummy.ConfigLoader;

import AIR.Common.Web.HttpHandlerBase;



/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
@Scope ("prototype")
@Controller
public class ItemPreviewHandler extends HttpHandlerBase
{
  
  @SuppressWarnings ("unused")
  private static final Logger _logger = LoggerFactory.getLogger (ItemPreviewHandler.class);

  @RequestMapping (value = "config")
  @ResponseBody
  public Config loadConfig (@RequestParam (value = "content", required = false) String content) throws IOException {
    ConfigLoader configLoader = new ConfigLoader ();
    return configLoader.load ();
  }

  @RequestMapping (value = "test")
  @ResponseBody
  public String test () {
    return "API.axd handler is working.";
  }

  /*
   * (non-Javadoc)
   * 
   * @see AIR.Common.Web.HttpHandlerBase#onBeanFactoryInitialized()
   */
  @Override
  protected void onBeanFactoryInitialized () {

  }
}
