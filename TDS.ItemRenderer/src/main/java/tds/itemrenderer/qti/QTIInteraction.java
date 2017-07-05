/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.qti;

import org.jdom2.Element;

import tds.itemrenderer.data.ITSDocument2;

public abstract class QTIInteraction
{

  private String  _name;         // The name of the interaction element

  private boolean _includeStem;  // If this is true then the QTIDocumentParser
                                  // should include the stem from the <itemBody>
                                  // html.

  private boolean _includePrompt; // If this is true then the QTIDocumentParser
                                  // should get the <prompt> from the
                                  // interaction and include it in the stem

  public String getName () {
    return _name;
  }

  public boolean getIncludeStem () {
    return false;
  }

  public boolean getIncludePrompt () {
    return false;
  }

  /**
   * Process the interaction element
   * 
   * @param itsDoc
   *          ITS document we are adding interaction into
   * @param element
   *          The interaction element
   */
  public abstract void process (ITSDocument2 itsDoc, Element element);

}
