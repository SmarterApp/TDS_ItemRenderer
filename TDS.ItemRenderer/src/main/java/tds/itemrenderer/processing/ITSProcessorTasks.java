/*******************************************************************************
 * Educational Online Test Delivery System 
 * Copyright (c) 2014 American Institutes for Research
 *   
 * Distributed under the AIR Open Source License, Version 1.0 
 * See accompanying file AIR-License-1_0.txt or at
 * http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
 ******************************************************************************/
package tds.itemrenderer.processing;

import java.util.List;

import org.apache.commons.lang3.StringUtils;

import tds.itemrenderer.data.ITSContent;
import tds.itemrenderer.data.ITSDocument;

import tds.itemrenderer.data.ITSOption;
import tds.itemrenderer.data.ITSTypes.ITSContentType;
import tds.itemrenderer.data.ITSTypes.ITSContextType;

/**
 * @author jmambo
 *
 */
public class ITSProcessorTasks extends TaskExecutor<String>
{
	private final String _defaultLanguage;

	/**
	 * Constructor
	 * 
	 * @param defaultLanguage
	 */
	public ITSProcessorTasks(String defaultLanguage)
	{
		_defaultLanguage = defaultLanguage;
	}

	/**
	 *  Go through the documents HTML and execute all the registered tasks on each section.
	 *  
	 * @param doc ITSDocumentXml instance
	 */
	public void process(ITSDocument doc)
	{
		process(doc, _defaultLanguage);
	}

	/**
	 *  Go through the documents HTML for a specific language and execute all the registered tasks on each section.
	 *
	 * @param doc  ITSDocumentXml
	 * @param language
	 */
	private void process(ITSDocument doc, String language)
	{
		// process renderer spec
		if (!StringUtils.isEmpty(doc.getRendererSpec ())) {
			doc.setRendererSpec(executeTasks(doc, ITSContentType.Xml, ITSContextType.Spec, _defaultLanguage, doc.getRendererSpec()));
		}

		// process grid
		if (!StringUtils.isEmpty(doc.getGridAnswerSpace()))
		{
			doc.setGridAnswerSpace(executeTasks(doc, ITSContentType.Xml, ITSContextType.Grid, _defaultLanguage, doc.getGridAnswerSpace()));
		}

		// get contents
		if (StringUtils.isEmpty(language))
		{
			List<ITSContent> contents = doc.getContents();

			for (ITSContent content : contents)
			{
				processContent(doc, content);
			}
		}
		else
		{
			ITSContent content = doc.getContent(language);

			if (content != null)
			{
				processContent(doc, content);
			}
		}
	}

	/**
	 * Go through the documents HTML sections and execute all the registered tasks on each section.
	 * 
	 * @param doc
	 * @param content
	 */
	private void processContent(ITSDocument doc, ITSContent content)
	{
		// Grid
		if (!StringUtils.isEmpty(content.getGridAnswerSpace())) {
			content.setGridAnswerSpace(executeTasks(doc, ITSContentType.Xml, ITSContextType.Grid, content.getLanguage(), content.getGridAnswerSpace()));
		}

		// QTI
		if (content.getQti() != null && content.getQti().getXml() != null) {
			// NOTE: This is technically xml but we want APIP to process it so we set it as Html.
			content.getQti().setXml(executeTasks(doc, ITSContentType.Html, ITSContextType.QTI, content.getLanguage(), content.getQti().getXml()));

			// process custom interaction grid
			content.getQti().setXml(executeTasks(doc, ITSContentType.Xml, ITSContextType.Grid, content.getLanguage(), content.getQti().getXml()));
			
			// process custom interaction sim
			content.getQti().setXml(executeTasks(doc, ITSContentType.Xml, ITSContextType.Spec, content.getLanguage(), content.getQti().getXml()));

		}

		// Illustration
		if (!StringUtils.isEmpty(content.getIllustration())) {
			content.setIllustration(executeTasks(doc, ITSContentType.Html, ITSContextType.Illustration, content.getLanguage(), content.getIllustration()));
		}

		// Stem
		if (!StringUtils.isEmpty(content.getStem())) {
			content.setStem (executeTasks(doc, ITSContentType.Html, ITSContextType.Stem, content.getLanguage(), content.getStem()));
		}

		// Title
		if (!StringUtils.isEmpty(content.getTitle())) {
			content.setTitle (executeTasks(doc, ITSContentType.Html, ITSContextType.Title, content.getLanguage(), content.getTitle()));
		}

		// MC options
		if (content.getOptions() != null) {
			for (ITSOption option : content.getOptions()) {
				if (!StringUtils.isEmpty(option.getValue()))  {
					option.setValue (executeTasks(doc, ITSContentType.Html, ITSContextType.Option, content.getLanguage(), option.getValue()));
				}

				if (!StringUtils.isEmpty(option.getSound())) {
					option.setSound (executeTasks(doc, ITSContentType.Html, ITSContextType.Option, content.getLanguage(), option.getSound()));
				}

				if (!StringUtils.isEmpty(option.getFeedback())) {
					option.setFeedback(executeTasks(doc, ITSContentType.Html, ITSContextType.Option, content.getLanguage(), option.getFeedback()));
				}
			}
		}
	}

}
