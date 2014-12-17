/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itempreview.web.backing;

import java.io.File;
import java.io.IOException;
import java.util.List;

import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tds.blackbox.ContentManagerRenderer;
import tds.itempreview.Accommodation;
import tds.itempreview.ItemPreviewSettings;
import AIR.Common.Json.JsonHelper;
import AIR.Common.Utilities.Path;
import AIR.Common.Utilities.TDSStringUtils;
import AIR.Common.Web.WebHelper;
import AIR.Common.Web.Session.Server;

public class BasePage extends TDS.Shared.Web.BasePage
{
  private static final Logger _logger = LoggerFactory.getLogger (BasePage.class);

  public boolean getShowLoading () {
    return ItemPreviewSettings.getShowLoading ().getValue ();
  }

  public boolean getIsDebug () {
    return WebHelper.getQueryBoolean ("debug", false);
  }

  public String getCacheId () {
    return ItemPreviewSettings.getConfigCacheId ().getValue ();
  }

  public String getItemScoringUrl () {
    return ItemPreviewSettings.getItemScoringUrl ().getValue ();
  }

  public boolean getIsReadOnly () {
    return false;
  }

  public String getBlackboxUrl (String path, Object... args) {
    path = TDSStringUtils.format (path, args);
    return getBlackboxUrl (path, false);
  }

  public String getBlackboxUrl (String path, boolean includeParams) {
    // get url from web.config
    StringBuilder urlBuilder = new StringBuilder ();
    urlBuilder.append(Path.combine (ItemPreviewSettings.getBlackboxUrl (), path, "/"));
    // add querystring
    if (includeParams)
      urlBuilder.append (getBlackboxParams ());

    return urlBuilder.toString ();
  }

  protected void onInit () throws IOException {
    loadCustomAccommodations ();
  }

  // / <summary>
  // / Loads custom accommodations codes from the querystring
  // / </summary>
  private void loadCustomAccommodations () throws IOException {
    String accFile = getRequestParameter ("acc");
    if (StringUtils.isEmpty (accFile))
      return;

    // get path for acc file
    // Shiva: .NEt code could do this map path business. We may not be able to
    // do that as we may be using a "view".
    // Instead the accFile should be relative to the context. So if this causes
    // a bug we need to fix ItemPreview to send accFile
    // as relative path instead.
    String accFilePath = Server.mapPath (accFile);

    // check if acc file exists
    if (!Path.exists (accFilePath))
      return;

    // parse accs (we don't have to do this but it makes sure they are in the
    // right format)
    String accText = FileUtils.readFileToString (new File (accFilePath));
    List<Accommodation> accData = Accommodation.deserializeFromJson (accText);

    // Shiva: why are we not just writing accText to the output put rather than
    // deserializing and then serializing it again.
    // add to the page as a json string
    String accJson = JsonHelper.serialize (accData);
    accJson = TDSStringUtils.format ("var accCustom = {0};", accJson);
    getClientScript ().addToJsCode (accJson);
  }

  private String getBlackboxParams () {
    StringBuilder paramsBuilder = new StringBuilder ();

    ContentManagerRenderer renderer = ContentManagerRenderer.MultiFrame;

    // parse renderer type
    try {
      // get renderer type
      String rendererValue = getRequestParameter ("renderer");
      renderer = ContentManagerRenderer.valueOf (rendererValue);
    } catch (Exception ex) {
      _logger.warn ("Request parameter renderer not set in http request. Using default.");
    }

    paramsBuilder.append (TDSStringUtils.format ("?renderer={0}", renderer.toString ().toLowerCase ()));

    // add client
    String clientValue = getRequestParameter ("client");
    if (!StringUtils.isEmpty (clientValue)) {
      paramsBuilder.append (TDSStringUtils.format ("&client={0}", clientValue));
    }

    // add accommodations
    String accommodations = getRequestParameter ("accommodations");
    if (!StringUtils.isEmpty (accommodations)) {
      paramsBuilder.append (TDSStringUtils.format ("&accommodations={0}", accommodations));
    }

    // layout folder
    String layoutFolder = getRequestParameter ("layoutFolder");
    if (!StringUtils.isEmpty (layoutFolder)) {
      paramsBuilder.append (TDSStringUtils.format ("&layoutFolder={0}", layoutFolder));
    }

    return paramsBuilder.toString ();
  }
}
