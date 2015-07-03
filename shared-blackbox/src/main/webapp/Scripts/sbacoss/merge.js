//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/**
 * 
 */

// For Sajib: http://www.crockford.com/javascript/private.html
function sbacossChanges() {

	if (typeof LoginShell != 'undefined') {
		Sections.LoginVerify.prototype.redirectToSat = function() {

			// save accommodations
			LoginShell.info.globalAccs = TDS.globalAccommodations.getSelectedJson();

			// get url
			var url = LoginShell.info.satellite.url;
			var loginSerialized = JSON.stringify(LoginShell.info);

			// create login form
			var form = document.createElement('form');

			// Our servlet API does not seem to have multi part support even
			// though
			// Tomcat 7 supports it. The problem is what happens if I upgrade
			// it?
			// I double checked and this seems to be the only multi-form data
			// that is submitted.
			// So instead I am commenting it out.

			// SB: begin hack!
			/* form.enctype = form.encoding = 'multipart/form-data'; */
			// SB: end hack!
			form.setAttribute('method', 'POST');
			form.setAttribute('action', url);

			// create login package
			var loginPackage = document.createElement('input');
			loginPackage.setAttribute('type', 'hidden');
			loginPackage.setAttribute('name', 'package');
			loginPackage.setAttribute('value', loginSerialized);
			form.appendChild(loginPackage);

			// submit form
			document.body.appendChild(form);
			form.submit();
		};

		LoginShell.checkBrowserForSpaces = function() {
			if (Util.SecureBrowser.isSpacesEnabled()) {
				TDS.redirectError('Browser.Denied.SpacesEnabled', 'LoginDenied.Header', 'Default.xhtml');
				return true;
			}
			return false;
		};

		// loginshell.js
		LoginShell.validateSecureBrowser = function() {
			// retrieve validation check results
			var validationErrors = TDS.SecureBrowser.Validators.validate();
			// check and report any errors
			if (validationErrors.length > 0) {
				TDS.redirectError(validationErrors[0], 'LoginDenied.Header', 'Default.xhtml');
				return false;
			}
			return true;
		};
	}

	if (typeof Sections != 'undefined' && typeof Sections.TestResults != 'undefined') {
		Sections.TestResults.prototype.redirectToTestSelectionSection = function() {
			if (TDS.isProxyLogin) {
				var testee = TDS.Student.Storage.getTestee();
				var firstName = testee.firstName;
				var lastName = testee.lastName;
				var testeeID = testee.id;

				var message = Messages.get('TestResults.Link.EnterMoreScoresConfirm', [ lastName, firstName, testeeID ]);

				TDS.Dialog.showPrompt(message, function() {
					// this logic may be useful also for SIRVE and that is why
					// the check above is for isProxyLogin rather than
					// isDataEntry.
					TDS.redirect('Pages/LoginShell.xhtml?section=sectionTestSelection');
				});
			} else {
				// this button should never show up on a student page
				this.logout();
			}
		};
	}

	if (typeof TDS != 'undefined') {

		// call this function to redirect to another url
		TDS.redirect = function(url) {
			if (TDS.Dialog) {
				TDS.Dialog.showProgress();
			}

			// if raw is to true then don't include base url
			var raw = Util.String.isHttpProtocol(url);
			if (raw !== true) {
				if (!Util.String.startsWith(url, this.baseUrl))
					url = this.baseUrl + url;
			}

			setTimeout(function() {
				top.window.location.href = url;
			}, 1);
		};

		TDS.redirectError = function(key, header, context) {
			var url = TDS.baseUrl + 'Pages/Notification.xhtml';

			if (YAHOO.lang.isString(key)) {
				var message = Messages.get(key);
				url += '?messageKey=' + encodeURIComponent(message);
			}

			if (YAHOO.lang.isString(header)) {
				// add header key if one has been passed.
				url = url + "&header=" + encodeURIComponent(header);
			}

			if (YAHOO.lang.isString(context)) {
				// add header key context.
				url = url + "&context=" + encodeURIComponent(context);
			}

			top.location.href = url;
		};
/*
		// redirects to the test shell
		TDS.redirectTestShell = function(page) {
			var redirectUrl;
			var accProps = TDS.getAccommodationProperties();

			// figure out url
			if (accProps.isTestShellModern()) {
				redirectUrl = 'Pages/TestShell.xhtml?name=modern';
			} else {
				redirectUrl = 'Pages/TestShell.xhtml';
			}

			// add optional page
			if (page) {
				if (redirectUrl.indexOf('?') != -1) {
					redirectUrl += '&';
				} else {
					redirectUrl += '?';
				}
				redirectUrl += 'page=' + page;
			}

			TDS.redirect(redirectUrl);
		};
*/
		TDS.getLoginUrl = function() {

			var url;

			// check for return url
			if (typeof TDS.Student == 'object') {
				url = TDS.Student.Storage.getReturnUrl();
			}

			// if proxy and a return url is specified, we will go here instead
			if (TDS.isProxyLogin) {
				url = TDS.Student.Storage.getProctorReturnUrl() || url;
			}

			// if there is no return url use base url
			if (url == null) {
				url = TDS.baseUrl;
				url += 'Pages/LoginShell.xhtml?logout=true';
			}

			return url;
		};

		TDS.logoutProctor = function(exl) {
			TDS.redirect('Pages/Proxy/logout.xhtml?exl=' + exl, false);
		};
	}
	// testShell.js
	//Sajib: We now have the CaseInsensitiveFileNameFilter on this path and it automatically
	//handles mapping from aspx to xhtml without code changes. So we do not need this block.
	//But also a lot of the functions that have been overridden in the block below now have additional
	//functionality in the proprietary version and so we want to use the proprietaty version.
	/*
	if (typeof TestShell != 'undefined') {
		// set up all URLs
		(function() {
			// TODO: Line 116 in TestShell.js needs to be but there is no
			// way to
			// do it from here.
			ContentManager.Dialog.urlFrame = TestShell.Config.urlBase + 'Pages/DialogFrame.xhtml';
		})();

		TestShell.redirectReview = function() {
			TestShell.allowUnloading = true;
			TestShell.UI.showLoading('');
			var url = TDS.baseUrl + 'Pages/ReviewShell.xhtml';
			top.location.href = url;
		};

		// redirect to the error page
		TestShell.redirectError = function(text) {
			TestShell.allowUnloading = true;
			var url = TDS.baseUrl + 'Pages/Notification.xhtml';

			if (YAHOO.util.Lang.isString(text)) {
				url += '?message=' + encodeURIComponent(text);
			}

			top.location.href = url;
		};
	}
	*/

	/*
	 * TODO: it's not working //mastershell.js if(typeof MasterShell !=
	 * 'undefined') { MasterShell.isLoginShell() { return
	 * Util.String.contains(location.href.toLowerCase(), 'loginshell.xhtml'); } }
	 */

	// TODO: calculator.js toggle() function
	if(typeof TestShell != 'undefined'){
		$("#btnPagePrint").hide();
	}
};

