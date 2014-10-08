/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox;

import org.apache.commons.lang.StringUtils;

import AIR.Common.Utilities.Path;
import AIR.Common.Utilities.TDSStringUtils;
import AIR.Common.Web.EncryptionHelper;

import tds.blackbox.ContentRequestAccommodation;
import tds.blackbox.ContentRequestItem;
import tds.itemrenderer.ITSDocumentFactory;
import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.AccProperties;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.IItemRender;
import tds.itemrenderer.data.ItemRender;
import tds.itemrenderer.data.ItemRenderGroup;
import tds.itemrenderer.webcontrols.PageLayout;

public class ContentRequestParser
{
  public static AccLookup createAccommodations (ContentRequest contentRequest) {
    AccLookup accommodations = new AccLookup ();

    // add any accommodations from request
    if (contentRequest.getAccommodations () != null) {
      for (ContentRequestAccommodation acc : contentRequest.getAccommodations ()) {
        if (acc != null && !StringUtils.isEmpty (acc.getType ())) {
          for (String code : acc.getCodes ()) {
            if (!StringUtils.isEmpty (code)) {
              accommodations.add (acc.getType (), code);
            }
          }
        }
      }
    }

    /*
     * if there was no language accommodation provided but a language property
     * then manually add that as an accommodation
     */
    if (!accommodations.hasType ("Language") && !StringUtils.isEmpty (contentRequest.getLanguage ())) {
      accommodations.add ("Language", contentRequest.getLanguage ());
    }

    return accommodations;
  }

  public static PageLayout CreatePageLayout(ContentRequest contentRequest) throws ContentRequestException
  {
      if (contentRequest.getPassage() == null && (contentRequest.getItems() == null || contentRequest.getItems().size () == 0))
      {
          throw new ContentRequestException("There was no passage or item file paths provided.");
      }

      AccLookup accommodations = createAccommodations(contentRequest);
      AccProperties accProperties = new AccProperties(accommodations);
      String language = accProperties.getLanguage();

      // add item data to layout control
      String pageID = contentRequest.getId () != null ? contentRequest.getId () : getPageID(contentRequest);
      ItemRenderGroup itemRenderGroup = new ItemRenderGroup(pageID, "default", language);

      // load passage
      if (contentRequest.getPassage() != null && !StringUtils.isEmpty (contentRequest.getPassage().getFile()))
      {
          // load file
          IITSDocument passageDoc = ITSDocumentFactory.loadUri2(contentRequest.getPassage().getFile(), accommodations, true);
          itemRenderGroup.setPassage (passageDoc);
      }

      // load items
      if (contentRequest.getItems() != null)
      {
          for (ContentRequestItem item : contentRequest.getItems())
          {
              // check if valid file name
              if (item == null || StringUtils.isEmpty (item.getFile())) continue;

              // load file
              IITSDocument itemDoc = ITSDocumentFactory.loadUri2(item.getFile(), accommodations, true);

              // skip item if the languages content does not exist
              if (itemDoc.getContent(language) == null) continue;
              // add to render group
              IItemRender itemRender = new ItemRender(itemDoc, (int)itemDoc.getItemKey());

              // set item properties from blackbox API
              if (item.getPosition() > 0) itemRender.setPosition (item.getPosition());
              itemRender.setDisabled (item.getDisabled());
              if (!StringUtils.isEmpty (item.getResponse())) itemRender.setResponse ( item.getResponse());

              itemRenderGroup.add(itemRender);
          }
      }

      if (!itemRenderGroup.getHasPassage() && !itemRenderGroup.getHasItems())
      {
          final String error = "Could not load passage/items provided because there is no content available for the language ({0}).";
          throw new ContentRequestException(TDSStringUtils.format(error, language));
      }

      // create HTML renderer
      PageLayout pageLayout = new PageLayout(itemRenderGroup);

      // custom layout folder
      if (!StringUtils.isEmpty (contentRequest.getLayoutFolder()))
      {
          String layoutFolder = "";

          if (!contentRequest.getLayoutFolder().startsWith ("~/"))
          {
              layoutFolder += "~/";
          }

          layoutFolder += contentRequest.getLayoutFolder();

          if (!contentRequest.getLayoutFolder().endsWith("/"))
          {
              layoutFolder += "/";
          }

          pageLayout.setLayoutFolder(layoutFolder);
      }

      // override items layout (this is actually required if just rendering a passage)
      if (!StringUtils.isEmpty(contentRequest.getLayoutName())) pageLayout.setLayoutName (contentRequest.getLayoutName());
      else if (!StringUtils.isEmpty(contentRequest.getLayoutFile())) pageLayout.setLayout (contentRequest.getLayoutFile());

      // add unique ID to page wrapper
      pageLayout.getSettings().setUseUniquePageId ( true);
      pageLayout.getSettings().setIncludeJson (false);

      // Remove item wrapper if BRF
      if (accProperties.isBRFEnabled ())
      {
          pageLayout.getSettings().setIncludePageWrapper (false);
          pageLayout.getSettings().setIncludeItemWrapper (false);
      }

      return pageLayout;
  }

  public static void decryptPaths (ContentRequest contentRequest) {
    if (contentRequest.getPassage () != null) {
      contentRequest.getPassage ().setFile (EncryptionHelper.DecryptFromBase64 (contentRequest.getPassage ().getFile ()));
    }

    if (contentRequest.getItems () != null) {
      for (ContentRequestItem contentItem : contentRequest.getItems ()) {
        contentItem.setFile (EncryptionHelper.DecryptFromBase64 (contentItem.getFile ()));
      }
    }
  }

  private  static String getPageID (ContentRequest contentRequest) {
    if (contentRequest.getPassage () != null && !StringUtils.isEmpty (contentRequest.getPassage ().getFile ())) {
      return Path.getFileNameWithoutExtension (contentRequest.getPassage ().getFile ());
    }

    if (contentRequest.getItems () != null && contentRequest.getItems ().size () > 0) {
      return Path.getFileNameWithoutExtension (contentRequest.getItems ().get (0).getFile ());
    }

    return null;
  }

}
