/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols;

import java.io.IOException;

import javax.faces.context.FacesContext;
import javax.faces.context.ResponseWriter;

import org.apache.myfaces.shared.renderkit.RendererUtils;

import AIR.Common.Web.taglib.TDSComponentBase;

/**
 * @author mpatel
 * 
 */
public class CustomInput extends TDSComponentBase
{

  /*
   * (non-Javadoc)
   * 
   * @see javax.faces.component.UIComponent#getFamily()
   */
  @Override
  public String getFamily () {
    return "javax.faces.ComponentBase";
  }

  @Override
  public void encodeAll (FacesContext context) throws IOException {
    ResponseWriter writer = context.getResponseWriter ();
    writer.startElement ("input", this);
    boolean isChecked  = RendererUtils.getBooleanAttribute (this, "checked", false);
    if (isChecked) {
      writer.writeAttribute ("checked", "checked", null);
    } 
    boolean isDisabled = RendererUtils.getBooleanAttribute (this, "disabled", false);
    if (isDisabled) {
      writer.writeAttribute ("disabled", "disabled", null);
    }
    if(getAttributes ().get ("type")!=null) {
      writer.writeAttribute ("type", getAttributes ().get ("type"), null);
    }
    if(getAttributes ().get ("id")!=null) {
      writer.writeAttribute ("id", getAttributes ().get ("id1"), null);
    }
    if(getAttributes ().get ("name")!=null) {
      writer.writeAttribute ("name", getAttributes ().get ("name"), null);
    }
    if(getAttributes ().get ("value")!=null) {
      writer.writeAttribute ("value", getAttributes ().get ("value"), null);
    }
    if(getAttributes ().get ("styleClass")!=null) {
      writer.writeAttribute ("class", getAttributes ().get ("styleClass"), null);
    }
    if(getAttributes ().get ("style")!=null) {
      writer.writeAttribute ("style", getAttributes ().get ("style"), null);
    }
    if(getAttributes ().get ("data-tts-prefix")!=null) {
      writer.writeAttribute ("data-tts-prefix", getAttributes ().get ("data-tts-prefix"), null);
    }
    
    /*System.out.println ("Attributes in CustomInput Tag Started --------------------");
    for(Entry<String,Object> entry : getAttributes ()) {
      System.out.println (entry.getKey () + " --> " + entry.getValue ().toString ());
    }
    System.out.println ("Attributes in CustomInput Tag Ended --------------------");*/
    encodeTdsAttributes (context);

    writer.endElement ("input");
    context.setResponseWriter (writer);
  }

}
