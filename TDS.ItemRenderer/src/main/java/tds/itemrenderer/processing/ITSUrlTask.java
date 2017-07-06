/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import tds.itemrenderer.data.ITSDocument;
import tds.itemrenderer.data.ITSTypes.ITSContentType;
import tds.itemrenderer.data.ITSTypes.ITSContextType;

/**
 * @author jmambo
 *
 */
public class ITSUrlTask implements IProcessorTask<String>
{
  private ITSUrlResolver urlResolver;

  public ITSUrlTask(final ITSUrlResolver itsUrlResolver) {
    this.urlResolver = itsUrlResolver;
  }

  public ITSUrlTask() {
  }

  /**
  * Gets content supported
  * 
  */
  public int getContentSupported()  {
       return ITSContentType.Html.getValue() | ITSContentType.Xml.getValue(); 
  }

 /**
   * Process element contents
   *  
   * @param itsDocument
   * @param contentType
   * @param contextType
   * @param language
   * @param data
   * @return
  */
  public String process(ITSDocument itsDocument, ITSContentType contentType, ITSContextType contextType, String language, String xml) {
      if(urlResolver == null) {
        urlResolver = new ITSUrlResolver2(itsDocument.getBaseUri());
      }
 
      // check if content is HTML and not the grid context
      if ((contentType.getValue () & ITSContentType.Html.getValue ()) == ITSContentType.Html.getValue ()  && 
          (contextType.getValue ()  & ITSContextType.Grid.getValue ()) != ITSContextType.Grid.getValue () ) {
          xml = urlResolver.resolveResourceUrls(xml);
      }
      // check if content is XML and the grid context (grid answer space)
      else if ((contentType.getValue ()  & ITSContentType.Xml.getValue () ) == ITSContentType.Xml.getValue ()  && 
               (contextType.getValue ()  & ITSContextType.Grid.getValue () ) == ITSContextType.Grid.getValue () )      {
          xml = urlResolver.resolveGridXmlUrls(xml, language);
      }
      // check if content is XML and the spec context (renderer spec)
      else if ((contentType.getValue ()  & ITSContentType.Xml.getValue () ) == ITSContentType.Xml.getValue ()  && 
               (contextType.getValue ()  & ITSContextType.Spec.getValue () ) == ITSContextType.Spec.getValue () )      {
          xml = urlResolver.resolveSpecXmlUrls(xml, language);
      }

      // save any parsed resources
      itsDocument.addMediaFiles(urlResolver.getParsedMediaFiles());
      
      return xml;
  }
  
}
