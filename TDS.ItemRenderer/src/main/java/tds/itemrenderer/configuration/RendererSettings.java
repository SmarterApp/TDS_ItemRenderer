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
package tds.itemrenderer.configuration;

import AIR.Common.Configuration.AppSetting;
import AIR.Common.Configuration.AppSettings;
import AIR.Common.Configuration.ConfigurationManager;
import AIR.Common.Configuration.ConfigurationSection;
import AIR.Common.Utilities.SpringApplicationContext;

/**
 * @author Shiva BEHERA [sbehera@air.org]
 * 
 */
public class RendererSettings
{

	private static ConfigurationSection _appSettings;

	// / <summary>
	// / Get the url resolver version we should use.
	// / </summary>
	// / <remarks>
	// / Right now this can only be 1 (used for TDS) or 2 (used for LPN).
	// / </remarks>
	public static int getUrlResolverVersion () {
		final String urlResolverKey = "tds.itemRenderer.urlResolverVersion";

		// get resolver version #
		int urlResolverVer = getAppSettings().getInt32 (urlResolverKey);
		if (urlResolverVer > 0) {
			return urlResolverVer;
		}

		// try legacy setting
		urlResolverVer =  getAppSettings().getInt32 ("UrlResolverVersion");
		if (urlResolverVer > 0) {
			return urlResolverVer;
		}

		// return default
		return 1;

	}

	// / <summary>
	// / If this is true then we allow for HTTP range requests.
	// / </summary>
	public static boolean getSupportHttpRanges () {
		return getAppSettings().getBoolean ("tds.itemRenderer.supportHttpRanges");
	}

	// / <summary>
	// / If this is true then if a uri is not file based then deny access.
	// / </summary>
	public static boolean getDenyExternalContent () {
		return getAppSettings().getBoolean ("tds.itemRenderer.denyHttpContent");
	}

	/// <summary>
	/// Encrypt the resource url's path querystring. 
	/// </summary>
	public static boolean getIsEncryptionEnabled(){
		return getAppSettings().getBoolean("tds.itemRenderer.enableEncryption", true);
	}

	/// <summary>
	/// Look for MathML .xml file for images and replace in the dom.
	/// </summary>
	public static boolean getIsMathMLEnabled () {
		return getAppSettings().getBoolean ("tds.itemRenderer.enableMathML");
	}

	/// <summary>
	/// Look for .svg file for images and replace in the dom.
	/// </summary>
	public static boolean getIsSVGEnabled () {
		return getAppSettings().getBoolean ("tds.itemRenderer.enableSVG");
	}

	/// <summary>
	/// Convert any <img> tags into base64 data.
	/// </summary>
	public static boolean getIsBase64Enabled () {
		return getAppSettings().getBoolean ("tds.itemRenderer.enableBase64");
	}

	// / <summary>
	// / If this is true then we support replacing images with MathML, SVG or
	// Base64.
	// / </summary>
	public static boolean supportHtmlReplacements () {
		return (getIsMathMLEnabled () || getIsSVGEnabled () || getIsBase64Enabled ());
	}

	// / <summary>
	// / If this is true then we will send down any feedback in the xml if it is
	// available.
	// / </summary>
	public static AppSetting<Boolean> getIsFeedbackEnabled () {
		return AppSettings.getBoolean ("tds.itemRenderer.enableFeedback");
	}

	public static ConfigurationSection getAppSettings() {
		if (_appSettings == null) {
			_appSettings =  SpringApplicationContext.getBean ("configurationManager", ConfigurationManager.class).getAppSettings ();
		} 
		return _appSettings;
	}
}