/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itempreview.web.backing;

import java.io.IOException;

import javax.annotation.PostConstruct;

import org.apache.commons.lang3.StringUtils;

import tds.blackbox.BlackboxSettings;
import tds.itempreview.ItemPreviewSettings;
import AIR.Common.Utilities.TDSStringUtils;
import AIR.Common.Web.WebHelper;

public class DefaultBacking extends BasePage
{
  @PostConstruct
  public void onInit () {
    try {
      super.onInit ();
      onLoad ();
    } catch (Exception exp) {
      exp.printStackTrace ();
      throw new RuntimeException (exp);
    }
  }

  public String getBlackboxHandler () {
    return getBlackboxHandler (null, null);
  }

  public String getBlackboxHandler (String clientName, String shellName) {
    StringBuilder urlBuilder = new StringBuilder (getBlackboxUrl ("Pages/API/Blackbox.axd/loadSeed"));
    urlBuilder.append (TDSStringUtils.format ("?client={0}", StringUtils.isEmpty (clientName) ? BlackboxSettings.getClientName () : clientName));
    urlBuilder.append (TDSStringUtils.format ("&shell={0}", StringUtils.isEmpty (shellName) ? BlackboxSettings.getShellName () : shellName));

    // check for custom scripts file
    String scriptsFile = WebHelper.getQueryString ("scriptsFile");
    if (scriptsFile != null)
      urlBuilder.append (TDSStringUtils.format ("&scriptsFile={0}", scriptsFile));

    // check for custom scripts ID
    String scriptsId = WebHelper.getQueryString ("scriptsID");
    if (!StringUtils.isEmpty (scriptsId))
      urlBuilder.append (TDSStringUtils.format ("&scriptsID={0}", scriptsId));

    // check for custom styles file
    String stylesFile = WebHelper.getQueryString ("stylesFile");
    if (!StringUtils.isEmpty (stylesFile))
      urlBuilder.append (TDSStringUtils.format ("&stylesFile={0}", stylesFile));

    // check for custom styles
    String stylesId = WebHelper.getQueryString ("stylesID");
    if (!StringUtils.isEmpty (stylesId))
      urlBuilder.append (TDSStringUtils.format ("&stylesID={0}", stylesId));
    return urlBuilder.toString ();
  }

  protected void onLoad () {
    addCustomStyles ();
  }

  private void addCustomStyles () {
    StringBuilder css = new StringBuilder ();

    boolean disableHeader = WebHelper.getQueryBoolean ("disableHeader", false);

    if (disableHeader) {
      css.append ("<style type=\"text/css\">#topBar { display:none !important; } #contents { top: 0 !important; }</style> \r\n");
    }

    if (css.length () > 0) {
      getClientScript ().addToJsCode (css.toString ());
    }
  }
}
