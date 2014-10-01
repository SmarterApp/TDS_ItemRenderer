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
package tds.itempreview.web.backing;

//TODO 
//import tds.blackbox.BlackboxSettings;
import tds.itempreview.dummy.BlackboxSettings;

import AIR.Common.Utilities.TDSStringUtils;
import AIR.Common.Web.WebHelper;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class DefaultPageBackingBean extends AbstractPage
{
  public String getBlackboxHandler (String clientName, String shellName) {
    StringBuilder urlBuilder = new StringBuilder (getBlackboxUrl ("Blackbox.axd/loadSeed"));
    urlBuilder.append (TDSStringUtils.format ("?client={0}", clientName == null ? BlackboxSettings.getClientName () : clientName));
    urlBuilder.append (TDSStringUtils.format ("&shell={0}", shellName == null ? BlackboxSettings.getShellName () : shellName));

    // check for custom scripts file
    String scriptsFile = WebHelper.getQueryString ("scriptsFile");
    if (scriptsFile != null)
      urlBuilder.append (TDSStringUtils.format ("&scriptsFile={0}", scriptsFile));

    // check for custom scripts ID
    String scriptsID = WebHelper.getQueryString ("scriptsID");
    if (scriptsID != null)
      urlBuilder.append (TDSStringUtils.format ("&scriptsID={0}", scriptsID));

    // check for custom styles file
    String stylesFile = WebHelper.getQueryString ("stylesFile");
    if (stylesFile != null)
      urlBuilder.append (TDSStringUtils.format ("&stylesFile={0}", stylesFile));

    // check for custom styles
    String stylesID = WebHelper.getQueryString ("stylesID");
    if (stylesID != null)
      urlBuilder.append (TDSStringUtils.format ("&stylesID={0}", stylesID));

    return urlBuilder.toString ();
  }

  public String getBlackboxHandler () {
    return getBlackboxHandler (null, null);
  }
}
