/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import tds.itemrenderer.data.ITSDocumentXml;
import tds.itemrenderer.data.ITSTypes.ITSContentType;
import tds.itemrenderer.data.ITSTypes.ITSContextType;

/**
 *  This interface is used to define a task for use with the ITS document
 *  
 * @param T   The type of data the task will be working
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public interface IProcessorTask<T>
{
  int getContentSupported ();

  T process (ITSDocumentXml itsDocument, ITSContentType contentType, ITSContextType contextType, String language, T xml);
}
