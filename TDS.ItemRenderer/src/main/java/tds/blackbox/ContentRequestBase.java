/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox;

import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseBody;

import tds.itemrenderer.webcontrols.PageLayout;

import TDS.Shared.Data.ReturnStatus;

import AIR.Common.Web.HttpHandlerBase;

// Abstract class for creating handlers used for rendering content for the
// blackbox.
public class ContentRequestBase extends HttpHandlerBase
{
  private static Logger _logger = LoggerFactory.getLogger (ContentRequestBase.class);

  /*
  // Call this function to render out content to the current HTTP stream
  protected void Render(PageLayout pageLayout){
    // NOTE: We need to force setting the layout name since we haven't started rendering yet
    pageLayout.setLayout();

    // get xml serializer for the ITS document
    ITSDocumentXmlSerializable itsDocXml = new ITSDocumentXmlSerializable(pageLayout);
    itsDocXml.setIncludeFilePaths(false);
    itsDocXml.setIncludeRubric(true);

    // write out xml to HTTP stream
    setMIMEType(ContentType.getXml);
    // TODO Ayo/Shiva Port C# "using"
    using (XmlWriter writer = XmlWriter.Create(CurrentContext.Response.OutputStream)) {
      writer.WriteStartElement("contents");
      itsDocXml.WriteXml(writer);
      writer.WriteEndElement();
    }

    // throw any errors
    if (pageLayout.ErrorCategory != PageLayout.ErrorCategories.None){
      throw new HttpException((int) HttpStatusCode.BadRequest, pageLayout.ErrorDescription);
    }
  }
  */

  /*
   * (non-Javadoc)
   * 
   * @see AIR.Common.Web.HttpHandlerBase#onBeanFactoryInitialized()
   */
  @Override
  protected void onBeanFactoryInitialized () {
    // use the protected getBean() method to get access to an instance of a
    // bean.
  }

  @ExceptionHandler ({ ContentRequestException.class })
  @ResponseBody
  public ReturnStatus handleNoDataException (ContentRequestException exp, HttpServletResponse response) {
    _logger.error (exp.getMessage ());
    response.setStatus (HttpServletResponse.SC_OK);
    return new ReturnStatus ("failed", exp.getMessage ());
  }
}
