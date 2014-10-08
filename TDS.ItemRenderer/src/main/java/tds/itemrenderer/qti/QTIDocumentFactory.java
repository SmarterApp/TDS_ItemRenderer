/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.qti;

import tds.itemrenderer.data.ITSDocument;
import tds.itemrenderer.qti.interactions.*;

// A factory class for creating the document parser.
public class QTIDocumentFactory
{
  // Returns a QTI document parser with all the available element parsers
  // added.
  public static QTIDocumentParser Create (ITSDocument itsDoc) {
    QTIDocumentParser qtiParser = new QTIDocumentParser (itsDoc);
    qtiParser.addInteraction (new ChoiceInteraction ());
    qtiParser.addInteraction (new MatchInteraction ());
    qtiParser.addInteraction (new TextEntryInteraction ());
    qtiParser.addInteraction (new InlineChoiceInteraction ());
    qtiParser.addInteraction (new HotspotInteraction ());
    qtiParser.addInteraction (new HottextInteraction ());
    return qtiParser;
  }
}
