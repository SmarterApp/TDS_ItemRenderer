/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox.abstractions.repository;

import tds.itemrenderer.data.ITSDocument;

public interface IContentBuilder
{
  public ITSDocument getITSDocument(String id);
  public void init() throws ContentException;
}
