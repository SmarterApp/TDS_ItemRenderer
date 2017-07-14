/*******************************************************************************
 * Educational Online Test Delivery System Copyright (c) 2014 American
 * Institutes for Research
 * 
 * Distributed under the AIR Open Source License, Version 1.0 See accompanying
 * file AIR-License-1_0.txt or at http://www.smarterapp.org/documents/
 * American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox;

import AIR.Common.Utilities.Path;
import AIR.Common.Utilities.TDSStringUtils;
import AIR.Common.Web.EncryptionHelper;
import AIR.Common.Web.Session.Server;
import TDS.Shared.Exceptions.ReturnStatusException;
import org.apache.commons.lang.StringUtils;

import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.AccProperties;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.IItemRender;
import tds.itemrenderer.data.ItemRender;
import tds.itemrenderer.data.ItemRenderGroup;
import tds.itemrenderer.repository.ContentRepository;

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

  public static ItemRenderGroup createPageLayout (ContentRepository contentRepository, ContentRequest contentRequest) throws ContentRequestException, ReturnStatusException
  {
    if (contentRequest.getPassage () == null && (contentRequest.getItems () == null || contentRequest.getItems ().size () == 0))
    {
      throw new ContentRequestException ("There was no passage or item file paths provided.");
    }

    AccLookup accommodations = createAccommodations (contentRequest);
    AccProperties accProperties = new AccProperties (accommodations);
    String language = accProperties.getLanguage ();

    // add item data to layout control
    String pageID = contentRequest.getId () != null ? contentRequest.getId () : getPageID (contentRequest);
    ItemRenderGroup itemRenderGroup = new ItemRenderGroup (pageID, "default", language);

    // load passage
    if (contentRequest.getPassage () != null && !StringUtils.isEmpty (contentRequest.getPassage ().getFile ()))
    {
      // load file

      IITSDocument passageDoc = contentRepository.findItemDocument(contentRequest.getPassage().getFile (), accommodations, Server.getContextPath());
      itemRenderGroup.setPassage (passageDoc);
    }

    // load items
    if (contentRequest.getItems () != null)
    {
      for (ContentRequestItem item : contentRequest.getItems ())
      {
        // check if valid file name
        if (item == null || StringUtils.isEmpty (item.getFile ()))
          continue;
        
        // load file
        IITSDocument itemDoc = contentRepository.findItemDocument(item.getFile(), accommodations, Server.getContextPath());

        // skip item if the languages content does not exist
        if (itemDoc.getContent (language) == null)
          continue;

        // add to render group
        // SB-1040: using item.position instead of itemDoc.key to show item
        // position in print preview
        IItemRender itemRender = new ItemRender (itemDoc, item.getPosition ());

        // set item properties from blackbox API
        if (item.getPosition () > 0)
          itemRender.setPosition (item.getPosition ());
        itemRender.setDisabled (item.getDisabled ());
        if (!StringUtils.isEmpty (item.getResponse ()))
          itemRender.setResponse (item.getResponse ());

        itemRenderGroup.add (itemRender);
      }
    }

    if (!itemRenderGroup.getHasPassage () && !itemRenderGroup.getHasItems ())
    {
      final String error = "Could not load passage/items provided because there is no content available for the language ({0}).";
      throw new ContentRequestException (TDSStringUtils.format (error, language));
    }

    return itemRenderGroup;
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

  private static String getPageID (ContentRequest contentRequest) {
    if (contentRequest.getPassage () != null && !StringUtils.isEmpty (contentRequest.getPassage ().getFile ())) {
      return Path.getFileNameWithoutExtension (contentRequest.getPassage ().getFile ());
    }

    if (contentRequest.getItems () != null && contentRequest.getItems ().size () > 0) {
      return Path.getFileNameWithoutExtension (contentRequest.getItems ().get (0).getFile ());
    }

    return null;
  }

}
