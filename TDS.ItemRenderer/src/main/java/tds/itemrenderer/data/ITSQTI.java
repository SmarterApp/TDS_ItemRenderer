/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.data;

/// This is used to hold QTI information.
public class ITSQTI
{
  /// What type of QTI data is included. 
  /// <example>The partial "itemBody" or full "assessmentItem".</example>
  public String _specification; // { get; set; }

  /// The xml for QTI.
  public String _xml; //{ get; set; }

  public String getSpecification () {
    return _specification;
  }

  public void setSpecification (String _specification) {
    this._specification = _specification;
  }

  public String getXml () {
    return _xml;
  }

  public void setXml (String _xml) {
    this._xml = _xml;
  }


}

