/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *       
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.blackbox.web.handlers;

import AIR.Common.Web.ContentType;
import tds.itemrenderer.data.AccLookup;
import tds.itemrenderer.data.AccProperties;
import tds.itemrenderer.data.ItemRenderGroup;
import tds.itemrenderer.web.ITSDocumentXmlSerializable;
import tds.itemrenderer.web.XmlWriter;
import tds.itemrenderer.webcontrols.ErrorCategories;
import tds.itemrenderer.webcontrols.PageLayout;
import tds.itemrenderer.webcontrols.PageSettings.UniqueIdType;
import tds.itemrenderer.webcontrols.rendererservlet.ContentRenderingException;
import tds.itemrenderer.webcontrols.rendererservlet.RendererServlet;

import javax.servlet.http.HttpServletResponse;

public class BaseContentRendererController extends TDSHandler
{
  private UniqueIdType _pageSettingsUniqieIdType = UniqueIdType.GroupId;

  protected void setPageSettingsUniqieIdType (UniqueIdType value) {
    _pageSettingsUniqieIdType = value;
  }

  protected void renderGroup (ItemRenderGroup itemRenderGroup, AccLookup accLookup, HttpServletResponse response) throws ContentRenderingException {
    try {
      // create HTML renderer
      PageLayout pageLayout = getBean ("pageLayout", PageLayout.class);

      // // add unique ID to page wrapper
      pageLayout.getSettings ().setUseUniquePageId (_pageSettingsUniqieIdType);
      pageLayout.getSettings ().setIncludeJson (false);

      pageLayout.setItemRenderGroup (itemRenderGroup);

      // // get accs props
      AccProperties accProps = new AccProperties(accLookup);

      // // in braille mode force WAI layout
      if (accProps.isBrailleEnabled () || accProps.isStreamlinedMode ()) {
        pageLayout.setLayout ("WAI");
      }
      // use layout that is in the xml
      else {
        pageLayout.setLayout ();
      }

      // get it rendered.
      RendererServlet.getRenderedOutput (pageLayout);
      // write the rendered string to the socket.

      ITSDocumentXmlSerializable contentSerializer = new ITSDocumentXmlSerializable(pageLayout);
      // TODO Shiva/Chad:
      // contentSerializer._includeFilePaths = false;
      // contentSerializer._includeRubric = true;

      // // render xml to stream);
      this.setMIMEType (ContentType.Xml);

      // // write xml
      XmlWriter writer = new XmlWriter(response.getOutputStream ());
      writer.writeStartElement ("contents");
      contentSerializer.writeXml (writer);
      writer.writeEndElement ();
      writer.close ();

      // check if rendering errors
      if (pageLayout.getErrorCategory () != ErrorCategories.None) {
        throw new Exception (pageLayout.getErrorDescription ());
      }

    } catch (Exception exp) {
      exp.printStackTrace ();
      throw new ContentRenderingException(exp);
    }

  }
}
