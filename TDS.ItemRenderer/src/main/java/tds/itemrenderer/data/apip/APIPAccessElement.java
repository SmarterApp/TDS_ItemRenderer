/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data.apip;

// / <summary>
// / This is the container for the information about a single access element.
// / </summary>
public class APIPAccessElement
{
  // / <summary>
  // / This is the locally unique identifier for the access element.
  // / </summary>
  public String                 _identifier         = null;

  // / <summary>
  // / This is the pointer to the information that describes the relationships
  // between the new alternative accessibility content and the original ITS
  // content.
  // / </summary
  public APIPContentLinkInfo    _contentLinkInfo    = null;

  // / <summary>
  // / This is the link to the set of alternative accessibility content
  // definitions for associated access element.
  // / </summary>
  public APIPRelatedElementInfo _relatedElementInfo = null;

  @Override
  public String toString () {
    return getIdentifier ();
  }

  public String getIdentifier () {
    return _identifier;
  }

  public void setIdentifier (String value) {
    _identifier = value;
  }

  public APIPContentLinkInfo getContentLinkInfo () {
    return _contentLinkInfo;
  }

  public void setContentLinkInfo (APIPContentLinkInfo value) {
    _contentLinkInfo = value;
  }

  public APIPRelatedElementInfo getRelatedElementInfo () {
    return _relatedElementInfo;
  }

  public void setRelatedElementInfo (APIPRelatedElementInfo value) {
    _relatedElementInfo = value;
  }

}
