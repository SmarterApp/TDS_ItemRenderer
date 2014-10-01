/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
/**
 * 
 */
package tds.itemrenderer.webcontrols;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
import java.util.ArrayList;
import java.util.List;

import javax.faces.component.UIComponent;
import javax.faces.component.UINamingContainer;
import javax.faces.event.PhaseId;

import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.collections.Transformer;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import tds.itemrenderer.configuration.ITSConfig;
import tds.itemrenderer.configuration.RendererSettings;
import tds.itemrenderer.data.IITSDocument;
import tds.itemrenderer.data.IItemRender;
import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.ITSOption;
import tds.itemrenderer.data.ItemRenderGroup;
import tds.itemrenderer.data.ItemRenderMCOption;
import tds.itemrenderer.web.ITSDocumentJsonSerializable;
import tds.itemrenderer.webcontrols.templates.IResponseLayout;
import tds.itemrenderer.webcontrols.templates.ITemplateAnswer;
import tds.itemrenderer.webcontrols.templates.ITemplateAnswerTable;
import tds.itemrenderer.webcontrols.templates.ITemplateStem;
import tds.itemrenderer.webcontrols.templates.ITemplateStimulus;
import AIR.Common.Utilities.TDSStringUtils;
import AIR.Common.Web.BrowserParser;
import AIR.Common.Web.taglib.JsfHelpers;
import AIR.Common.Web.taglib.LiteralControl;
import AIR.Common.Web.taglib.PlaceHolder;

public class PageLayout extends UINamingContainer
{
  // TODO Shiva this did not seem as it was used.
  // public event EventHandler OnRendered = delegate { };
//  private FacesContext    _currentContext           = null;
  private static Logger _logger = LoggerFactory.getLogger (PageLayout.class);
  private String          _layoutFolder             = ITSConfig.getLayoutFolder ();  // e.x.,
                                                                                      // "~/Layouts_2009/"
  private String          _responseTypesFolder      = ITSConfig.getResponseFolder ();

  private String          _templateFolder           = ITSConfig.getTemplateFolder ();
  private String          _templateFileStimulus     = "Stimulus.xhtml";
  private String          _templateFileTools        = "Tools.xhtml";
  private String          _templateFileStem         = "Stem.xhtml";
  private String          _templateFileIllustration = "Illustration.xhtml";
  private boolean         _templateFileWAI          = false;

  // these are calculated based on the content when rendering
  private String          _layoutName               = "";                            // e.x.,
  // "11 - Vertical"
  private String          _layoutFile;                                               // e.x.,
                                                                                      // "Layout_11.ascx"
  private String          _layoutLanguage;
  private String          _responseTypeOverride     = null;
  private PageSettings    _settings                 = null;
  private ItemRenderGroup _itemGroup;
  private ErrorCategories _errorCategory            = ErrorCategories.None;
  private String          _errorDescription;
  private PlaceHolder     _placeHolder;

  private PlaceHolder     _contentPlaceHolder       = new PlaceHolder ();
  private PlaceHolder     _preamblePlaceHolder      = new PlaceHolder ();
  private PlaceHolder     _postamblePlaceHolder     = new PlaceHolder ();

  private String          _renderToString;

  public PageLayout () {
    // set page settings defaults
    _settings = new PageSettings ();
    _settings.setIncludePageWrapper (true);
    _settings.setIncludeItemWrapper (true);
    _settings.setUseUniquePageId (false);
    _settings.setIncludeJson (true);
  }

  public PageLayout (ItemRenderGroup renderGroup) {
    setItemRenderGroup (renderGroup);
  }

  // / <summary>
  // / Override the layouts folder defined in the web.config for just this page.
  // / </summary>
  public String getLayoutFolder () {
    return _layoutFolder;
  }

  public void setLayoutFolder (String value) {
    _layoutFolder = value;
  }

  public PlaceHolder getPlaceHolder () {
    return _placeHolder;
  }

  public void setPlaceHolder (PlaceHolder value) {
    _placeHolder = value;

    _placeHolder.addComponent (_preamblePlaceHolder);
    _placeHolder.addComponent (_contentPlaceHolder);
    _placeHolder.addComponent (_postamblePlaceHolder);

    render ();
  }

  // / <summary>
  // / The layout file name (not the full virtual path). If you set this field
  // yourself then you will
  // / override the items layout file which is determined from layout name.
  // / </summary>
  // / <example>"Layout_11.ascx"</example>
  public String getLayoutFile () {
    return _layoutFile;
  }

  public void setLayoutFile (String value) {
    _layoutFile = value;
  }

  // / <summary>
  // / This manually sets the layout name.
  // / </summary>
  // / <param name="layoutName"></param>
  // / <returns></returns>
  public boolean setLayout (String value) {
    _layoutName = value;
    return setLayout ();
  }

  // / <summary>
  // / This calculates the layout name based on item information.
  // / </summary>
  public boolean setLayout () {
    // if there is no layout name manually assigned then get it from the first
    // item
    if (StringUtils.isEmpty (getLayoutName ()) && getItemRenderGroup ().size () > 0) {
      _layoutName = getItemRenderGroup ().get (0).getItem ().getLayout ();
    }

    // create the virtual path used to load the layout file
    if (StringUtils.isEmpty (getLayoutFile ())) {
      if (StringUtils.isEmpty (getLayoutName ()))
        return false;
      _layoutFile = "Layout_" + StringUtils.split (getLayoutName ().replace (" ", ""), '-')[0] + ".xhtml";
    }

    return true;
  }

  // / <summary>
  // / The ITS layout name. If you set this field yourself then you will
  // override the items layout.
  // / </summary>
  // / <example>"11 - Vertical" or "11"</example>
  public String getLayoutName () {
    return _layoutName;
  }

  public void setLayoutName (String value) {
    _layoutName = value;
  }

  public String getLanguage () {
    return _layoutLanguage;
  }

  public String getResponseTypesFolder () {
    return _responseTypesFolder;
  }

  public void setResponseTypesFolder (String value) {
    _responseTypesFolder = value;
  }

  public String getTemplateFolder () {
    return _templateFolder;
  }

  public void setTemplateFolder (String value) {
    _templateFolder = value;
  }

  // / <summary>
  // / Set this response type to override the items response type.
  // / </summary>
  // / <example>Vertical</example>
  public String getResponseTypeOverride () {
    return _responseTypeOverride;
  }

  public void setResponseTypeOverride (String value) {
    _responseTypeOverride = value;
  }

  public PageSettings getSettings () {
    return _settings;
  }

  public void setItemRenderGroup (ItemRenderGroup value) {
    _itemGroup = value;
    setLanguage (value.getLanguage ());
  }

  public ItemRenderGroup getItemRenderGroup () {
    return _itemGroup;
  }

  public ErrorCategories getErrorCategory () {
    return _errorCategory;
  }

  public String getErrorDescription () {
    return _errorDescription;
  }

  public String getRenderToString () {
    return _renderToString;
  }

  public void setRenderToString (String value) {
    _renderToString = value;
  }

  public void render () {
    try {
      renderControl ();
    } catch (Exception ex)
    {
      _logger.error (ex.getMessage (),ex);
      throw ex;
    }
  }

  protected void setLanguage (String value) {
    _layoutLanguage = value;
  }

  protected void setSettings (PageSettings value) {
    _settings = value;
  }

  protected void setErrorCategory (ErrorCategories error) {
    this._errorCategory = error;
  }

  protected void setErrorDescription (String message) {
    this._errorDescription = message;
  }

  protected void renderControl () {
    createChildControls2 ();
  }

  protected void createChildControls2 () {

    ItemRenderGroup itemGroup = getItemRenderGroup ();

    // check items for any possible rendering problems
    if (checkContentErrors ())
      return;

    // check if we have any data to even render
    if (!itemGroup.getHasPassage () && !itemGroup.getHasItems ()) {
      addError (ErrorCategories.Data, "There was a problem rendering item(s) no content provided to renderer.");
      return;
    }

    // set the layout information for this content
    if (!setLayout ()) {
      addError (ErrorCategories.Layout, "Could not figure out the layout for this group. This could be because there are no items or it is missing from the first item.");
      return;
    }

    // check if we found a layout (if there are no items and no manually
    // assigned layout then this can occur)
    if (StringUtils.isEmpty (getLayoutFolder ()) || StringUtils.isEmpty (getLayoutFile ())) {
      addError (ErrorCategories.Layout, "There was no layout information found.");
      return;
    }

    ILayout layout = loadLayout (getLayoutFile (), _contentPlaceHolder);
    // TODO Shiva: We will never come here, I suppose. If there was an error
    // then we would already have
    // thrown an exception at this point. Is this still required?
    if (layout == null) {
      if (itemGroup.size () > 0) {
        addError (ErrorCategories.Layout, "The layout '{0}' did not load properly. Failed to load item {1}.", getLayoutFile (), getItemRenderGroup ().get (0).getItem ().getItemKey ());
      } else {
        addError (ErrorCategories.Layout, "The layout '{0}' did not load properly.", getLayoutFile ());
      }
      return;
    }

    // TODO Shiva: is there any layout that is not an instance of renderer base
    // in .NET? Also our inheritance scheme makes the following if condition
    // redundant - it will
    // always be true.
    // check if the layout overrided any of the default template files
    if (layout instanceof RendererBase) {
      RendererBase rendererBase = (RendererBase) layout;

      if (!StringUtils.isEmpty (rendererBase.getTemplateStimulus ())) {
        this._templateFileStimulus = rendererBase.getTemplateStimulus ();
      }

      if (!StringUtils.isEmpty (rendererBase.getTemplateStem ())) {
        this._templateFileStem = rendererBase.getTemplateStem ();
      }

      if (!StringUtils.isEmpty (rendererBase.getTemplateIllustration ())) {
        this._templateFileIllustration = rendererBase.getTemplateIllustration ();
      }

      if (rendererBase.getTemplateWai () == null) {
         this._templateFileWAI = false;
      } else {
         this._templateFileWAI = rendererBase.getTemplateWai ();
      }
    }

    // NOTE FOR IF DECIDE TO USE CACHING: We need to add the layout to the
    // control early (http://support.microsoft.com/kb/837000)
    // render passage
    if (itemGroup.getHasPassage ()) {
      renderStimulus (layout, itemGroup.getPassage ());
    }

    // render illustration
    else if (itemGroup.getHasItems ()) {
      renderIllustration (layout, itemGroup.get (0));
    }

    // render items
    if (itemGroup.getHasItems ()) {
      // set boolean indicating first item
      itemGroup.get (0).setIsFirst (true);

      // set boolean indicating last item
      itemGroup.get (itemGroup.size () - 1).setIsLast (true);

      // Assign itemGroup (items and passage data) to the layout,
      setRenderData (layout, itemGroup.get (0));

      // check for layout type and render items
      if (layout instanceof LayoutSingle) {
        if (itemGroup.size () > 1) {
          addError (ErrorCategories.Layout, "There was a problem using this single item layout '{0}' because there are multiple items trying to be rendered. The first item is {1}.", _layoutFile,
              itemGroup.get (0).getItem ().getItemKey ());
        } else {
          renderSingleItem ((LayoutSingle) layout, itemGroup.get (0));
        }
      } else if (layout instanceof LayoutCompound) {
        renderCompoundItems ((LayoutCompound) layout);
      } else if (layout instanceof LayoutMulti) {
        renderMultiItems ((LayoutMulti) layout);
      } else if (layout instanceof LayoutColumns) {
        renderColumnItems ((LayoutColumns) layout);
      } else if (layout instanceof LayoutSingleMulti) {
        renderSingleMultiItems ((LayoutSingleMulti) layout);
      } else {
        addError (ErrorCategories.Layout, "Unknown inherited type for layout '{0}', should be LayoutSingle or LayoutMulti. Failed to load item {1}.", _layoutFile, itemGroup.get (0).getItem ()
            .getItemKey ());
      }
    } else {
      setRenderData (layout);
    }

    // add page wrapper
    addPageWrapper (layout);
  }

  protected void renderColumnItems (LayoutColumns layoutColumns) {
    ItemRenderGroup itemGroup = getItemRenderGroup ();

    int column1 = (itemGroup.size () / 2) + (itemGroup.size () % 2);

    // column 1
    for (int i = 0; i < column1; i++) {
      ILayout layoutSingle = loadLayout (layoutColumns.getColumn1 ().getLayout (), layoutColumns.getColumn1 ());
      setRenderData (layoutSingle, itemGroup.get (i));
    }

    // column 2
    for (int i = column1; i < _itemGroup.size (); i++) {
      ILayout layoutSingle = loadLayout (layoutColumns.getColumn2 ().getLayout (), layoutColumns.getColumn2 ());
      setRenderData (layoutSingle, itemGroup.get (i));
    }
  }

  // / <summary>
  // / This is used to render compound items. These are where we combine a
  // series of items to make it look like one item.
  // / </summary>
  // / <remarks>
  // / The code in this function is a combination of RenderSingleItem and
  // RenderMultiItems. In the future we need to make
  // / it so we can call on those functions directly to help us out. Right now
  // they require a specific class and we should
  // / switch to using interfaces instead.
  // / </remarks>
  protected void renderCompoundItems (LayoutCompound layout) {
    // TODO
  }

  protected void renderMultiItems (LayoutMulti layout1) {
    if (layout1.getQuestions () == null)
      return; // <tds:QuestionRepeater /> was not added to page

    List<Question> questions = new ArrayList<Question> ();

    ItemRenderGroup itemGroup = getItemRenderGroup ();
    // add stem to layout
//    int counter1 = 0;
    for (IItemRender item : itemGroup) {
      // Shiva: This is a slight variation from .NET. We create PlaceHolders
      // instead
      // to act as parent nodes.
      Question question = new Question ();
      question.setItem (item);

      PlaceHolder illustrationParentPlaceHolder = new PlaceHolder ();
      getTemplateIllustration (item, illustrationParentPlaceHolder);
      question.setIllustration (illustrationParentPlaceHolder);

      PlaceHolder stemParentPlaceHolder = new PlaceHolder ();
      getTemplateStem (item, stemParentPlaceHolder);
      question.setStem (stemParentPlaceHolder);

      PlaceHolder responseParentPlaceHolder = new PlaceHolder ();
      getResponseControl (item, responseParentPlaceHolder);
      question.setAnswer (responseParentPlaceHolder);

      questions.add (question);
    }

    layout1.getQuestions ().setValue (questions);
    layout1.getQuestions ().process (getFacesContext (), PhaseId.UPDATE_MODEL_VALUES);

  }

  protected void renderSingleItem (LayoutSingle layoutSingle, IItemRender itemRender) {
    if (itemRender == null) {
      _contentPlaceHolder.addComponent (new LiteralControl ("[NO ITEM DATA]"));
      return;
    }

    // add stem to layout
    if (layoutSingle.getStem () != null) {
      getTemplateStem (itemRender, layoutSingle.getStem ());
    }

    // add answer to layout
    if (layoutSingle.getAnswer () != null) {
      getResponseControl (itemRender, layoutSingle.getAnswer ());
    }
  }

  // / <summary>
  // / Used to determine what response type template to load.
  // / </summary>
  protected UIComponent getResponseControl (IItemRender itemRender, UIComponent parent) {
    try {
      UIComponent control = null;

      String responseType = getResponseType (itemRender.getItem ());

      // make sure we have a valid response type
      if (StringUtils.isEmpty (responseType)) {
        addError (ErrorCategories.Template, "Could not find the response type for layout '{0}'. Failed to load item {1}.", itemRender.getItem ().getLayout (), itemRender.getItem ().getItemKey ());
        return null;
      }

      // ignore responses types that are defined as "Empty"
      if (StringUtils.equals (responseType.toUpperCase (), "NA"))
        return null;

      ITSContent content = getContent (itemRender.getItem ());
      if (content == null)
        return null;

      // load the control based on response type name
      IResponseLayout responseLayout = getResponseControl (responseType.replace (" ", ""), parent);
      if (!(responseLayout instanceof UIComponent) || (responseLayout == null)) {
        addError (ErrorCategories.Template, "Could not find the answer template for layout '{0}'. Failed to load item {1}.", itemRender.getItem ().getLayout (), itemRender.getItem ().getItemKey ());
        return null;
      }
      control = (UIComponent) responseLayout;

      // check if we can data bind the options to this item
      if (hasBindableOptions (itemRender.getItem ().getFormat (), responseType)) {
        bindResponseControl_MC (itemRender, content, control);
      }

      setRenderData (control, itemRender);

      return control;
    } catch (Exception exp)
    {
      throw new RuntimeException (exp);
    }
  }

  @SuppressWarnings ("unchecked")
  protected void bindResponseControl_MC (IItemRender itemRender, ITSContent itsContent, UIComponent control) {
    final char delimiter = ',';

    // logic for figuring our answer template
    List<ItemRenderMCOption> renderOptions = new ArrayList<ItemRenderMCOption> ();

    // check if there are any MC options
    if (itsContent.getOptions () != null) {
      for (ITSOption option : itsContent.getOptions ()) {
        ItemRenderMCOption renderMCOption = new ItemRenderMCOption ("Response_MC_" + itemRender.getPosition (), option.getKey ());
        renderMCOption.setText (option.getValue ());
        renderMCOption.setFeedback (option.getFeedback ());
        renderMCOption.setSound (option.getSound ());
        renderMCOption.setDisabled (itemRender.getDisabled ());

        // get the answer key
        String answerString = itemRender.getItem ().getAnswerKey ();

        // set the correct answer on the option
        if (!StringUtils.isEmpty (answerString)) {
          String[] answerKeys = StringUtils.split (answerString, delimiter);

          for (String answerKey : answerKeys) {
            // check if matching answer key
            if (StringUtils.equals (option.getKey (), answerKey)) {
              renderMCOption.setAnswer (true);
              break;
            }
          }
        }

        // check for a response
        if (!StringUtils.isEmpty (itemRender.getResponse ())) {
          // check if multiple response
          if (StringUtils.equalsIgnoreCase (itemRender.getItem ().getFormat (), "MS")) {
            String[] responseKeys = StringUtils.split (itemRender.getResponse (), delimiter);

            // go through all the response keys to see if they match option key
            for (String responseKey : responseKeys) {
              // check if matching response key
              if (StringUtils.equals (option.getKey (), responseKey)) {
                renderMCOption.setSelected (true);
                break;
              }
            }
          } else {
            // check if response key matches option key
            renderMCOption.setSelected (StringUtils.equals (option.getKey (), itemRender.getResponse ()));
          }
        }
        renderOptions.add (renderMCOption);
      }
    }

    // perform data binding
    if (control instanceof ITemplateAnswer) {
      ITemplateAnswer templateAnswer = (ITemplateAnswer) control;
      templateAnswer.setOptions (renderOptions);
    }
    // TODO Shiva: Finish the loops below
    /*
     * else if (control instanceof ITemplateAnswerMC) { ITemplateAnswerMC
     * templateAnswer = control as ITemplateAnswerMC;
     * templateAnswer.Options.DataSource = renderOptions;
     * templateAnswer.Options.DataBind(); }
     */
    else if (control instanceof ITemplateAnswerTable)
    {

      ITemplateAnswerTable templateAnswer = (ITemplateAnswerTable) control;
      templateAnswer.setOptions ((List<Object>) CollectionUtils.collect (renderOptions, new Transformer ()
      {
        @Override
        public Object transform (Object input) {
          return input;
        }
      }));
    }
    /*
     * else if (control is ITemplateAnswerRepeater) { ITemplateAnswerRepeater
     * templateAnswer = control as ITemplateAnswerRepeater;
     * templateAnswer.Options.DataSource = renderOptions;
     * templateAnswer.Options.DataBind(); }
     */
    else {
      addError (ErrorCategories.Template, "Cannot bind data to the answer template '{0}' because it inherits from unknown interface. Failed to load item {1}.", control.getClientId (), itemRender
          .getItem ().getItemKey ());
    }
  }

  protected UIComponent getTemplateStem (IItemRender itemRender, UIComponent parent) {
    ITemplateStem templateStem = JsfHelpers.<ITemplateStem, ITemplateStem> includeCompositeComponent (parent, getTemplateFolder (), this._templateFileStem, null, null, null);

    ITSContent itsContent = getContent (itemRender.getItem ());
    if (itsContent == null)
      return null;

    // IMAGE BASE
    templateStem.getQuestion ().setText (itsContent.getStem ());

    setRenderData (templateStem, itemRender);

    return templateStem;
  }

  // / <summary>
  // / Renders a single item on the left and all the other items on the right.
  // / </summary>
  // / <param name="layout"></param>
  // / <remarks>
  // / Since we made this change in the middle of the year this
  // / code contains copies of code from the functions:
  // / * RenderSingleItem()
  // / * RenderMultiItems()
  // / TODO: We need to reuse existing functions for 2012.
  // / </remarks>
  protected void renderSingleMultiItems (LayoutSingleMulti layout) {
    // TODO
  }

  protected void renderIllustration (ILayout layout, IItemRender itemRender) {
    if (layout.getStimulus () != null) {
      // add stimulus template to layout
      ITemplateStimulus templateStimulus = getTemplateIllustration (layout.getStimulus ());

      if (templateStimulus == null) {
        addError (ErrorCategories.Template, "Could not load illustration template. Failed to load item {0}.", itemRender.getItem ().getItemKey ());
        return;
      }

      ITSContent itsContent = getContent (itemRender.getItem ());
      if (itsContent == null)
        return;

      String text = "";

      if (!StringUtils.isEmpty (itsContent.getIllustration ())) {
        // IMAGE BASE
        text = itsContent.getIllustration ();
      }

      templateStimulus.getContent ().setText (text);
    }
  }

  protected ITSContent getContent (IITSDocument itsDoc) {
    // if language is not available use english
    ITSContent content = itsDoc.getContent (this.getLanguage ()); // ??
                                                                  // itsDoc.GetContentDefault();
    if (content == null) {
      addError (ErrorCategories.Content, "The <content language=\"{0}\"> element for {1} {2} ({3}) is empty or not parsed properly.", this.getLanguage (), itsDoc.getType (), itsDoc.getItemKey (),
          itsDoc.getBankKey ());
    }
    return content;
  }

  protected void renderStimulus (ILayout layout, IITSDocument itsDoc) {
    if (layout.getStimulus () == null)
      return;

    // get stimulus template and add it to layout component.
    ITemplateStimulus uc = JsfHelpers.<ITemplateStimulus, ITemplateStimulus> includeCompositeComponent (layout.getStimulus (), getTemplateFolder (), _templateFileStimulus, null, null, null);

    // TODO Shiva: What is PartialCachingControl? Do I need to implement it?
    /*
     * if (uc == null) { PartialCachingControl pcc = control as
     * PartialCachingControl;
     * 
     * if (pcc != null) { uc = pcc.CachedControl as ITemplateStimulus; } else {
     * //Debug.WriteLine("Passage cached"); } }
     */

    // check if stimulus control loaded/
    // TODO shiva: is this still required?
    if (uc == null)
      return;

    ITSContent itsContent = getContent (itsDoc);

    // check if stimulus content was found
    if (itsContent == null)
      return;

    // stimulus title
    if (uc.getTitle () != null && !StringUtils.isEmpty (itsContent.getTitle ())) {
      uc.getTitle ().setText (itsContent.getTitle ());
    }

    // stimulus credit
    if (uc.getCredit () != null && !StringUtils.isEmpty (itsDoc.getCredit ())) {
      uc.getCredit ().setText (TDSStringUtils.format ("<div class=\"attribute\">{0}</div>", itsDoc.getCredit ()));
    }

    // stimulus text
    if (uc.getContent () != null && !StringUtils.isEmpty (itsContent.getStem ())) {
      // IMAGE BASE
      uc.getContent ().setText (itsContent.getStem ());
    }
  }

  private void addHtml (String text) {
    _preamblePlaceHolder.addComponent (new LiteralControl ("\r\n" + text));
  }

  private void addHtml (String text, PlaceHolder placeHolder) {
    placeHolder.addComponent (new LiteralControl ("\r\n" + text));
  }

  private void addScript (String script) {
    addHtml ("<script type=\"text/javascript\">", _postamblePlaceHolder);
    addHtml ("//<![CDATA[", _postamblePlaceHolder);
    addHtml (script, _postamblePlaceHolder);
    addHtml ("//]]>", _postamblePlaceHolder);
    addHtml ("</script>", _postamblePlaceHolder);
  }

  private void addPageWrapper (ILayout layout) {
    IITSDocument rootDoc = _itemGroup.getHasPassage () ? _itemGroup.getPassage () : _itemGroup.get (0).getItem ();

    String layoutID = _layoutName.replace ("-", "_").replace (" ", "").toLowerCase ();
    String subject = rootDoc.getSubject ().replace (" ", "");
    String grade = rootDoc.getGrade ().replace (" ", "");

    PageSettings settings = getSettings ();

    if (settings.getIncludePageWrapper ()) {

      // <div> (pageLayout wrapper info)
      String pageID = settings.getUseUniquePageId () ? "Page_" + _itemGroup.getId () : "pageLayout";

      BrowserParser browser = new BrowserParser ();

      // create styles
      StringBuilder styles = new StringBuilder ();
      if (!StringUtils.isEmpty (subject))
        styles.append (TDSStringUtils.format ("subject_{0} ", subject));
      if (!StringUtils.isEmpty (grade))
        styles.append (TDSStringUtils.format ("grade_{0} ", grade));
      styles.append (TDSStringUtils.format ("itemcount_{0} ", _itemGroup.size ()));
      styles.append (TDSStringUtils.format ("layout_{0} ", layoutID));
      styles.append (TDSStringUtils.format ("browser_{0} ", browser.getName ().toLowerCase ()));
      styles.append (TDSStringUtils.format ("browserVer_{0} ", ("" + browser.getVersion ()).replace ('.', '_')));
      styles.append (TDSStringUtils.format ("platform_{0}", browser.getOsName ().toString ().toLowerCase ()));

      String div_page;

      if (RendererSettings.supportHtmlReplacements ()) {
        div_page = "<div xmlns=\"http://www.w3.org/1999/xhtml\" id=\"{0}\" class=\"{1}\">";
      } else {
        div_page = "<div id=\"{0}\" class=\"{1}\">";
      }

      addHtml (TDSStringUtils.format (div_page, pageID, styles));
    }

    // <div> (itemContainer)
    // For single item layouts we wrap them in a div with item level information
    // (response type, format)
    if (settings.getIncludeItemWrapepr () && layout instanceof LayoutSingle && _itemGroup.getHasItems ()) {
      IItemRender item = _itemGroup.get (0);
      int position = item.getPosition ();
      String format = item.getItem ().getFormat ().toLowerCase ();
      String responseType = item.getItem ().getResponseType ().toLowerCase ().replace (" ", "");

      // create styles
      StringBuilder styles = new StringBuilder ();
      styles.append ("multipleChoiceItem itemContainer ");
      styles.append (TDSStringUtils.format ("format_{0} ", format));
      styles.append (TDSStringUtils.format ("response_{0}", responseType));

      final String div_item = "<div id=\"Item_{0}\" class=\"{1}\">";
      addHtml (TDSStringUtils.format (div_item, position, styles));
    }

    // We have three placeholders: preamble, content, and postamble.
    // we have already added layout to the content placeholder and hence the
    // following statement is not required.
    /*
     * // add rendered layout and templates to the page this.Controls.Add(layout
     * as UserControl);
     */
    // </div> (itemContainer)
    // ANYTHING AFTER THIS COMMENT NEEDS TO BE ADDED TO _postamblePlaceHolder

    if (settings.getIncludeItemWrapepr () && layout instanceof LayoutSingle && _itemGroup.getHasItems ())
      addHtml ("</div>", _postamblePlaceHolder);

    if (settings.getIncludeItemWrapepr ()) {
      // </div> (pageLayout)
      addHtml ("</div>", _postamblePlaceHolder);
      // javascript objects
      if (settings.getIncludeJson ()) {
        ITSDocumentJsonSerializable itsJson = new ITSDocumentJsonSerializable (_itemGroup, _layoutName, _layoutLanguage);
        addScript (itsJson.createJson ());
      }
    }
  }

  // / <summary>
  // / Get illustration template filled out with the illustration content.
  // / </summary>
  protected ITemplateStimulus getTemplateIllustration (UIComponent parent) {
    return JsfHelpers.<ITemplateStimulus, ITemplateStimulus> includeCompositeComponent (parent, getTemplateFolder (), this._templateFileIllustration, null, null, null);
  }

  // / <summary>
  // / Get illustration template filled out with the illustration content.
  // / </summary>
  protected UIComponent getTemplateIllustration (IItemRender itemRender, UIComponent parent) {
    ITSContent itsContent = getContent (itemRender.getItem ());

    // check if there is illustration content
    if (itsContent == null || StringUtils.isEmpty (itsContent.getIllustration ()))
      return null;

    // load illustration template
    ITemplateStimulus templateIllustration = getTemplateIllustration (parent);
    if (templateIllustration == null)
      return null;

    // set illustration html
    templateIllustration.getContent ().setText (itsContent.getIllustration ());
    return templateIllustration;
  }

  // / <summary>
  // / Checks the item set for any possible rendering problems
  // / </summary>
  // / <returns>true means there is an error, false means items should be
  // ok</returns>
  private boolean checkContentErrors () {
    ItemRenderGroup itemGroup = getItemRenderGroup ();
    if (itemGroup == null) {
      addError (ErrorCategories.Data, "Error loading content: No item group assigned");
      return true;
    }

    for (IItemRender render : itemGroup) {
      if (!render.getItem ().getIsLoaded ()) {
        String error = "There is a problem with one of the questions in this set.";

        try {
          addError (ErrorCategories.Content, "Error loading content: " + error + "', ITEM = " + render.getItem ().getBaseUri ());
        } catch (Exception exp) {
          addError (ErrorCategories.Content, "Error loading content: ITEM = " + render.getItem ().getBaseUri () + " ; Exception message: " + exp.getMessage ());
        }
        return true;
      }
    }
    return false;
  }

  private void addError (ErrorCategories error, String message, Object... args) {
    setErrorCategory (error);
    setErrorDescription (TDSStringUtils.format (message, args));
  }

  private ILayout loadLayout (String layoutFile, UIComponent parent) {
    ILayout layout = JsfHelpers.<ILayout, ILayout> includeCompositeComponent (parent, getLayoutFolder (), layoutFile, null, null, null);
    return layout;
  }

  // / <summary>
  // / Sets data used for rendering on the layout or template.
  // / </summary>
  private void setRenderData (Object control) {
    RendererBase rendererBase = (RendererBase) control;
    if (rendererBase != null) {
      rendererBase.setGroup (getItemRenderGroup ());
    }
  }

  // / <summary>
  // / Sets data used for rendering on the layout or template.
  // / </summary>
  // / <param name="control">Layout or Template object</param>
  // / <param name="itemRender">Item renderer object</param>
  private void setRenderData (Object control, IItemRender itemRender) {
    RendererBase rendererBase = (RendererBase) control;

    if (rendererBase != null) {
      rendererBase.setGroup (getItemRenderGroup ());
      rendererBase.setData (itemRender);
      rendererBase.setDocument (itemRender.getItem ());
    }
  }

  // / <summary>
  // / Get a documents response type. This will also check if document is
  // overrided.
  // / </summary>
  private String getResponseType (IITSDocument doc) {
    // Do we use the seperate response type or the one that is part of the
    // layout name?
    String responseType = StringUtils.isEmpty (getResponseTypeOverride ()) ? doc.getResponseType () : getResponseTypeOverride ();

    // HACK: If the response type is vertical and there is a sound element in
    // the options then
    // we need to manually set the response type to include sound (e.x.,
    // "Vertical Sound").
    if (!StringUtils.isEmpty (responseType) && StringUtils.equalsIgnoreCase (responseType, "vertical")) {
      ITSContent content = getContent (doc);

      if (content != null && content.getOptions () != null) {
        for (ITSOption option : content.getOptions ()) {
          if (option.getSound () != null) {
            responseType += " Sound";
            break;
          }
        }
      }
    }

    // HACK: If the layout is used for accessibility (TemplateWAI=true) and this
    // is item is MC then
    // use our custom MC template.
    if (_templateFileWAI && isMC (doc.getFormat (), responseType))
      return "Vertical WAI";

    return responseType;
  }

  // / <summary>
  // / Check if a document is considered a multiple choice question. This will
  // check format and response type.
  // / </summary>
  private boolean isMC (String format, String responseType) {
    // check format
    if (format != null) {
      if (StringUtils.equals (format.toUpperCase (), "MC"))
        return true;
    }

    // check response type
    if (!StringUtils.isEmpty (responseType)) {
      switch (responseType.toUpperCase ()) {
      case "VERTICAL":
      case "VERTICAL SOUND":
      case "HORIZONTAL":
      case "STACKED":
      case "STACKEDB":
        return true;
      }
    }
    return false;
  }

  // / <summary>
  // / Check if we can bind options to this response type.
  // / </summary>
  private boolean hasBindableOptions (String format, String responseType) {
    // check if valid format data
    if (format == null)
      return false;
    format = format.toUpperCase ();

    // check if scaffolding item
    if (StringUtils.equals (format, "ASI"))
      return true;

    // check if multiple choice/select
    return (isMC (format, responseType) || isMS (format, responseType));
  }

  // / <summary>
  // / Check if a document is considered a multiple select question. This will
  // check format and response type.
  // / </summary>
  private boolean isMS (String format, String responseType) {
    // check format
    if (format != null) {
      if (StringUtils.equals (format.toUpperCase (), "MS"))
        return true;
    }
    // check response type
    if (!StringUtils.isEmpty (responseType)) {
      switch (responseType.toUpperCase ()) {
      case "VERTICAL MS":
        return true;
      }
    }
    return false;
  }

  private IResponseLayout getResponseControl (String name, UIComponent parent) {
    return JsfHelpers.<IResponseLayout, IResponseLayout> includeCompositeComponent (parent, getResponseTypesFolder (), "Response_" + name + ".xhtml", null, null, null);
  }
}
