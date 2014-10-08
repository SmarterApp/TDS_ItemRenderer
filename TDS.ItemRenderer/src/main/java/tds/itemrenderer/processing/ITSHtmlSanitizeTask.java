/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import tds.itemrenderer.data.AccProperties;
import tds.itemrenderer.data.ITSDocumentXml;
import tds.itemrenderer.data.ITSTypes.ITSContentType;
import tds.itemrenderer.data.ITSTypes.ITSContextType;
import java.util.regex.Matcher;
import java.util.regex.Pattern;


 public class ITSHtmlSanitizeTask implements IProcessorTask<String>
 {
      private static final Pattern _colorPattern = Pattern.compile ("(?<!-)color:#000000;", Pattern.CASE_INSENSITIVE);
          
      private final AccProperties _accProperties;
      
      public ITSHtmlSanitizeTask(AccProperties accProperties) {
          _accProperties = accProperties;
      }
 
      @Override
      public int getContentSupported () {
        return ITSContentType.Html.getValue ();
      }

      @Override
      public String process (ITSDocumentXml itsDocument, ITSContentType contentType, ITSContextType contextType, String language, String html) {          
          if (_accProperties != null && _accProperties.isColorChoiceEnabled ()) {
            
              // issue SB-307: Remove inline style preventing reverse contrast accommodation from working
              // Remove the font color black "color:#000000;". Leave anything where preceded with a '-'. 
              // For example don't replace: "background-color: #000000;" or "border-color: #000000;".        
              Matcher matcher = _colorPattern.matcher (html);
              html =  matcher.replaceAll("");

              // issue SB-307: Remove inline colors for borders so that in reverse contrast accommodation, they don't disappear
              // For now, “solid #000000” is the only one we know off and so limiting to this. We need to do something smarter if more are found
              html = html.replace("solid #000000", "solid");
          }
          return html;
      }

  }
