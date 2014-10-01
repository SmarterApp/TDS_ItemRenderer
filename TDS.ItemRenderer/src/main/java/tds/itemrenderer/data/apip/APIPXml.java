/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data.apip;

import java.util.List;
import java.util.ArrayList;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Predicate;

// / <summary>
// / This is the root container for all of the APIP ITS Accessibility
// information.
// / </summary>
import org.apache.commons.collections.Predicate;
import org.apache.commons.lang.StringUtils;

public class APIPXml
{
  // / <summary>
  // / The accessibility information consists of a list of ‘AccessElement’
  // structures.
  // / Each ‘AccessElement’ describes the nature of one alternative
  // accessibility form.
  // / </summary>
  public List<APIPAccessElement> _accessElements = null;

  public APIPXml () {
    setAccessElements (new ArrayList<APIPAccessElement> ());
  }

  public void addAccessElement (APIPAccessElement accessElement) {
    getAccessElements ().add (accessElement);
  }

  public APIPAccessElement getRelatedElementInfo (final String id) {
    /*
     * return (from accessElement in AccessElements where
     * accessElement.ContentLinkInfo.ITSLinkIdentifierRef == id select
     * accessElement).FirstOrDefault();
     */
    return (APIPAccessElement) CollectionUtils.find (CollectionUtils.select (getAccessElements (), new Predicate ()
    {

      @Override
      public boolean evaluate (Object accessElement) {
        return StringUtils.equals (((APIPAccessElement) accessElement).getContentLinkInfo ().getItsLinkIdentifierRef (), id);
      }
    }), new Predicate ()
    {
      // this will make it return the first element.
      // TODO Shiva: would not it have been simpler to check using plain java
      // code.
      @Override
      public boolean evaluate (Object arg0) {
        return true;
      }
    });
  }

  public List<APIPAccessElement> getAccessElements () {
    return _accessElements;
  }

  private void setAccessElements (List<APIPAccessElement> accessElements) {
    this._accessElements = accessElements;
  }
}
