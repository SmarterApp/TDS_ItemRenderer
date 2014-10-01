/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.webcontrols;

import javax.faces.component.UIComponent;
import javax.faces.component.UINamingContainer;

import org.apache.commons.collections.functors.InstanceofPredicate;

import AIR.Common.Utilities.TDSStringUtils;

import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.IItemRender;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.ItemRenderGroup;

public class RendererBase extends UINamingContainer
{
  private IItemRender     _data;
  private IITSDocument    _document;
  private ItemRenderGroup _group;
  private String          _templateStimulus;
  private String          _templateStem;
  private String          _templateIllustration;
  private Boolean         _templateWai;
  
  // / <summary>
  // / Current item information
  // / </summary>
  public IItemRender getData () {
    return _data;
  }

  public void setData (IItemRender value) {
    _data = value;
  }

  // / <summary>
  // / Current ITS document
  // / </summary>
  public IITSDocument getDocument () {
    return _document;
  }

  public void setDocument (IITSDocument value) {
    _document = value;
  }

  public ItemRenderGroup getGroup () {
    return _group;
  }

  public void setGroup (ItemRenderGroup value) {
    _group = value;
  }

  // / <summary>
  // / Current language
  // / </summary>
  public String getLanguage () {
    return getGroup ().getLanguage ();
  }

  protected ITSContent getItemContent () {
    return getContent (getData ().getItem ());
  }

  protected ITSContent getPassageContent () {
    return getContent (getGroup ().getPassage ());
  }

  public String getPassageTitle () {
    ITSContent passageContent = getPassageContent ();
    return (passageContent != null) ? passageContent.getTitle () : "";
  }

  public String getPassageCredit () {
    if (getGroup ().getPassage () != null && getGroup ().getPassage ().getCredit () != null) {
      return TDSStringUtils.format ("<div class=\"attribute\">{0}</div>", getGroup ().getPassage ().getCredit ());
    }

    return "";
  }

  public String getPassageStem () {
    ITSContent passageContent = getPassageContent ();
    return (passageContent != null) ? passageContent.getStem () : "";
  }

  public String getItemIllustration () {
    return getItemContent ().getIllustration ();
  }

  public String getItemStem () {
    return getItemContent ().getStem ();
  }

  // / <summary>
  // / Get the pagelayout control for internal purposes
  // / </summary>
  private PageLayout getPageLayout () {
    // Specific code to get layout
    if (getParent () instanceof PageLayout) {
      return (PageLayout) this.getParent ();
    }

    if (this.getParent () instanceof RendererBase) {
      return ((RendererBase) this.getParent ()).getPageLayout ();
    }

    if (this.getParent () instanceof LayoutHolder) {
      return ((RendererBase) (this.getParent ().getParent ())).getPageLayout ();
    }

    // Generic code to get layout:
    UIComponent control = this;

    while (!(control instanceof PageLayout)) {
      // TODO Shiva: does the second part of this if condition make any sense in
      // JSF?
      if (control.getParent () == null || control.getParent () == control) {
        break;
      }

      control = control.getParent ();
    }

    if (control instanceof PageLayout) {
      return (PageLayout) control;
    }

    return null; // error
  }

  // / <summary>
  // / Get ITS documents current language content
  // / </summary>
  protected ITSContent getContent (IITSDocument itsDoc) {
    if (itsDoc == null)
      return null;
    return itsDoc.getContent (getLanguage ()); // ?? itsDoc.GetContentDefault();
  }

  // used for manually replacing templates files
  public String getTemplateStimulus () {
    return _templateStimulus;
  }

  public void setTemplateStimulus (String value) {
    _templateStimulus = value;
  }

  public String getTemplateStem () {
    return _templateStem;
  }

  public void setTemplateStem (String value) {
    _templateStem = value;
  }

  public String getTemplateIllustration () {
    return _templateIllustration;
  }

  public void setTemplateIllustration (String value) {
    _templateIllustration = value;
  }

  // set this to true if this layout is used for accessibility rendering (e.x.,
  // braille)
  public Boolean getTemplateWai () {
    return _templateWai;
  }

  public void setTemplateWai (Boolean value) {
    _templateWai = value;
  }
  
}
