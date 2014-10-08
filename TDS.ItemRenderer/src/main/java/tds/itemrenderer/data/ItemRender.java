/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

import org.apache.commons.lang.StringUtils;

import AIR.Common.Utilities.TDSStringUtils;

/**
 * 
 * @author Note: private Setter methods. Methods were private in C# file.
 * 
 */
public class ItemRender extends IItemRender
{
  public ItemRender (IITSDocument item, int position, String label) {
    setItem (item);
    setLabel (label);
    setPosition (position);
    super.setHasTutorial (item.getTutorial () != null);

    for (ITSResource resource : item.getResources ()) {
      if (StringUtils.equals (resource._type.toUpperCase (), "GUIDETOREVISION"))
        super.setHasGtr (true);
    }
  }

  public ItemRender (IITSDocument item, int position) {
    this (item, position, "" + position);
  }

  public String getCopyright () {
    String copyright = getCopyright ();

    // make sure copyright is not empty
    if (!StringUtils.isEmpty (copyright)) {
      // return copyright HTML that will be used directly in layout
      return TDSStringUtils.format ("<div class=\"copyright\">{0}</div>", copyright);
    }

    return "";
  }

  public String getId () {
    return TDSStringUtils.format ("Item_{0}", getPosition ());
  }

  public String getClassName () {
    StringBuilder classNameBuilder = new StringBuilder ();
    classNameBuilder.append ("questionAnswerGroup itemContainer");
    classNameBuilder.append (TDSStringUtils.format (" format_{0}", getItem ().getFormat ().toLowerCase ()));
    classNameBuilder.append (TDSStringUtils.format (" response_{0}", getItem ().getResponseType ().toLowerCase ().replace (" ", "")));
    if (getIsFirst ())
      classNameBuilder.append (" firstItem");
    if (getIsLast ())
      classNameBuilder.append (" lastItem");
    return classNameBuilder.toString ();
  }
}
