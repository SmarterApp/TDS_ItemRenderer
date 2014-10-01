/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import org.w3c.dom.Document;

import tds.itemrenderer.data.ITSDocumentXml;
import tds.itemrenderer.data.ITSTypes.ITSContentType;
import tds.itemrenderer.data.ITSTypes.ITSContextType;

/**
 * @author jmambo
 *
 */
public class ITSProcessorApipTasks extends TaskExecutor<Document> implements IProcessorTask<String>
{
  
  public int getContentSupported () {
    return (ITSContentType.Html.getValue () | ITSContentType.Xml.getValue ());

  }

  @Override
  public String process (ITSDocumentXml itsDocument, ITSContentType contentType, ITSContextType contextType, String language, String xml) {
    Document document = null;
    if ((contentType.getValue () & ITSContentType.Html.getValue ()) == ITSContentType.Html.getValue ()) {
      document = XmlUtils.createFragmentDocument (xml);
    } else {
      document = XmlUtils.createDocument (xml);
    }

    executeTasks (itsDocument, contentType, contextType, language, document);

    if ((contentType.getValue () & ITSContentType.Html.getValue ()) == ITSContentType.Html.getValue ()) {
      // when returning a HTML fragment we need to skip root node
      return XmlUtils.getXml (document, true);
    } else {
      return XmlUtils.getXml (document);
    }
  }

}
