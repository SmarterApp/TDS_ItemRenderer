/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.web;

import org.apache.commons.lang3.StringUtils;

import AIR.Common.Utilities.TDSStringUtils;

import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.IItemRender;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.ITSOption;
import tds.itemrenderer.data.ITSResource;
import tds.itemrenderer.data.ItemRenderGroup;

public class ITSDocumentJsonSerializable
{
  private final ItemRenderGroup _itemGroup;
  private String                _layoutName;
  private final String          _layoutLanguage;

  public ITSDocumentJsonSerializable (ItemRenderGroup itemGroup, String layoutName, String layoutLanguage) {
    _itemGroup = itemGroup;
    _layoutName = layoutName;
    _layoutLanguage = layoutLanguage;

    if (_layoutName.contains ("-")) {
      _layoutName = StringUtils.split (_layoutName, '-')[0].trim ();
    }
  }

  protected ITSContent getContent (IITSDocument itsDoc) {
    return itsDoc.getContent (_layoutLanguage); // ??
                                                // itsDoc.GetContentDefault();
  }

  StringBuilder json;

  public String createJson () {
    json = new StringBuilder ();
    json.append ("var its = { ");

    // content
    json.append (TDSStringUtils.format ("id: '{0}', ", _itemGroup.getId ()));
    json.append (TDSStringUtils.format ("layout: '{0}', ", _layoutName));
    json.append (TDSStringUtils.format ("language: '{0}', ", _layoutLanguage));

    // passage
    if (_itemGroup.getHasPassage ()) {
      processPassage ();
    }

    // check for sound cue (we just check the first item in the group)
    for (int i = 0; i < _itemGroup.size (); i++) {
      IITSDocument item = _itemGroup.get (i).getItem ();

      if (item.getSoundCue () != null) {
        json.append ("soundCue: { ");
        json.append (TDSStringUtils.format ("bankKey: {0}, ", item.getSoundCue ().getBankKey ()));
        json.append (TDSStringUtils.format ("itemKey: {0} ", item.getSoundCue ().getId ()));
        json.append (TDSStringUtils.format ("}, "));

        break;
      }
    }

    // items
    json.append ("items: [");

    for (int i = 0; i < _itemGroup.size (); i++) {
      processItem (i);
    }

    // item [END]
    json.append ("] };");

    return json.toString ();
  }

  private void processPassage () {
    json.append ("passage: { ");
    json.append (TDSStringUtils.format ("bankKey: {0}, ", _itemGroup.getPassage().getBankKey()));
    json.append (TDSStringUtils.format ("itemKey: {0} ", _itemGroup.getPassage().getItemKey()));

    // content for the language
    ITSContent  content = getContent (_itemGroup.getPassage());

    if (content != null) {
      json.append (", ");
      json.append (TDSStringUtils.format ("'stemTTS': {0} ", JsonString.Enquote (content.getStemTTS ())));
    }

    json.append ("}, ");
  }

  private void processItem (int index) {
    IItemRender itemRender = _itemGroup.get (index);

    String responseType = itemRender.getItem ().getResponseType ();

    if (StringUtils.isEmpty (responseType) && _layoutName.contains ("-")) {
      responseType = StringUtils.split (_layoutName, '-')[1].trim ();
    }

    if (index > 0)
      json.append (", ");

    // item [START]
    json.append ("{ ");

    // item info
    json.append (TDSStringUtils.format ("bankKey: {0}, ", itemRender.getItem ().getBankKey ()));
    json.append (TDSStringUtils.format ("itemKey: {0}, ", itemRender.getItem ().getItemKey ()));
    json.append (TDSStringUtils.format ("subject: '{0}', ", itemRender.getItem ().getSubject ()));
    json.append (TDSStringUtils.format ("grade: '{0}', ", itemRender.getItem ().getGrade ()));
    json.append (TDSStringUtils.format ("format: '{0}', ", itemRender.getItem ().getFormat ()));
    json.append (TDSStringUtils.format ("disabled: {0}, ", ("" + itemRender.getDisabled ()).toString ().toLowerCase ()));
    json.append (TDSStringUtils.format ("responseType: '{0}', ", responseType));

    // test info
    json.append (TDSStringUtils.format ("position: {0}, ", itemRender.getPosition ()));
    json.append (TDSStringUtils.format ("positionOnPage: {0}, ", itemRender.getPositionOnPage ()));

    // response value
    json.append (TDSStringUtils.format ("value: {0}", JsonString.Enquote (itemRender.getResponse ())));

    // tutorial
    if (itemRender.getItem ().getTutorial () != null) {
      json.append (", tutorial: { ");
      json.append (TDSStringUtils.format ("bankKey: {0}, ", itemRender.getItem ().getTutorial ().getBankKey ()));
      json.append (TDSStringUtils.format ("itemKey: {0} ", itemRender.getItem ().getTutorial ().getId ()));
      json.append ("} ");
    }

    // resource list (not used right now)
    if (itemRender.getItem ().getResources () != null && itemRender.getItem ().getResources ().size () != 0) {
      json.append (", resources: { ");

      for (int j = 0; j < itemRender.getItem ().getResources ().size (); j++) {
        ITSResource resource = itemRender.getItem ().getResources ().get (j);
        if (j > 0)
          json.append (", ");

        json.append (TDSStringUtils.format ("'{0}': ", resource.getType ()));

        json.append ("{ ");
        json.append (TDSStringUtils.format ("bankKey: {0}, ", resource.getBankKey ()));
        json.append (TDSStringUtils.format ("itemKey: {0} ", resource.getId ()));
        json.append ("} ");
      }

      json.append ("} ");
    }

    // content for the language
    ITSContent content = getContent (itemRender.getItem ());

    if (content != null) {
      processItemContent (itemRender, content);
    }

    json.append ("}");
  }

  private void processItemContent (IItemRender itemRender, ITSContent content) {
    json.append (", ");

    // grid:
    String gridAnswerSpace = itemRender.getItem ().getGridAnswerSpace () != null ? itemRender.getItem ().getGridAnswerSpace () : content.getGridAnswerSpace ();
    json.append (TDSStringUtils.format ("gridAnswerSpace: {0}, ", JsonString.Enquote (gridAnswerSpace)));

    json.append (TDSStringUtils.format ("illustrationTTS: {0}, ", JsonString.Enquote (content.getIllustrationTTS ())));
    json.append (TDSStringUtils.format ("stemTTS: {0} ", JsonString.Enquote (content.getStemTTS ())));

    if (content.getOptions() != null) {
      // options [START]
      json.append (", options: [ ");

      for (int j = 0; j < content.getOptions().size(); j++) {
        ITSOption option = content.getOptions().get(j);
        if (j > 0)
          json.append (", ");

        json.append ("{");
        json.append (TDSStringUtils.format ("key: '{0}',", option.getKey()));
        json.append (TDSStringUtils.format ("tts: {0}", JsonString.Enquote (option.getTts ())));
        json.append ("}");
      }

      // options [END]
      json.append ("] ");
    }
  }
}
