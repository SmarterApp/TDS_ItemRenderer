//TDS Alternation logout tds_logout.js

if (typeof TDS == 'undefined') TDS = {};

TDS.CLS = 
{
    isCLSLogin: false,
    loginPage: null,
    logoutPage: null,
    confirmExitPage: null,
    defaultPage: null,
    localDomains: null,
    isProctorLoggedIn: false,
    LogoutComponent: {},
    PagesExcludedFromConfirm: ['logout.aspx', 'clslogout.aspx', 'replogin.aspx', 'clslogin.aspx', 'confirmexit.aspx'],
    getPopupBlockerCookie: function() { return 'TDS_Proctor_CheckPopup'; },
    isScoreEntry: false
};

TDS.CLS.LogoutComponent = {
    
    PageUnloadEvent: new YAHOO.util.CustomEvent('pageUnload', TDS.CLS.LogoutComponent, false, YAHOO.util.CustomEvent.FLAT),
    
    confirmExit: function() {   
        var e = null;
        if (arguments.length > 0)
            e = arguments[0];
        
        if (document.all)
            e = event;

        if (!e)
            e = window.event;

        if (e) {
            if (e.target == document || e.target == null || e.clientX < 0 || e.clientY < 0) {
                window.open(TDS.CLS.confirmExitPage, "ConfirmExit", 'height=600,width=800, toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, directories=no, status=no');
            }
        }
    },
    
    showCLSLogoutPrompt: function(logoutURL)
    {
        var handleNo = function()
        {
            this.hide();
        };

        var handleYes = function()
        {
            //disable window.onunload handler.
            TDS.CLS.LogoutComponent.PageUnloadEvent.unsubscribeAll();
            this.hide();
            window.location = logoutURL + "?exl=true" ;
        };

        // No, Yes
        var buttons = [
            { text: Messages.get('Global.Label.No'), handler: handleNo, isDefault: true },
            { text: Messages.get('Global.Label.Yes'), handler: handleYes }
        ];
        var logoutWarningMessage = "Are you sure you want to logout?";
        TDS.Dialog.show(Messages.get('Global.Label.Warning'), Messages.getAlt('Global.Label.ShowCLSLogoutWarning', logoutWarningMessage), buttons);
    },
    
    checkForPopupBlocker: function()
    {
        //first lets look into a cookie to make sure we have not already checked for popup 
        //blocker.
        var popupBlockerChecked = Util.Browser.readCookie(TDS.CLS.getPopupBlockerCookie());
        if (popupBlockerChecked == null || popupBlockerChecked != 'true')
        {
            //lets check for popup block - open a dummy website.
            var popUnWin = window.open('abc.com','','width=1,height=1');	  
		    if(popUnWin){
			    popUnWin.close();			
			    Util.Browser.createCookie(TDS.CLS.getPopupBlockerCookie(), 'true');
			    return;
		    }
		    else
		    {
		    
                /*
                 * We had this logic at launch to log them out automatically rather than giving them a chance to 
                 * try again.
                var timeoutTryAgain = 10000;
                var popupBlockerMessage = 'This site requires popup blockers to be disabled. Please disable popup blockers and try again. You will be logged out in 10 seconds.';
		        TDS.Dialog.show(Messages.get('Global.Label.Warning'), Messages.getAlt('Global.Label.PopupBlockerMessage', popupBlockerMessage), []);
                //lets start a timer to logout automatically.
                Util.Browser.eraseCookie(TDS.CLS.getPopupBlockerCookie());
                var timerIdle = YAHOO.lang.later(timeoutTryAgain, null, function() { TDS.CLS.LogoutComponent.PageUnloadEvent.unsubscribeAll(); window.location = TDS.CLS.logoutPage + "?exl=true" ; });
                */
                
		        //we are going to throw warning and give them the option to try again.
		        var popupBlockerMessage = 'This site requires popup blockers to be disabled. Hit "Try Again" after disabling popup blocker or "Logout" to sign out from the site.';
		        var tryAgain = function()
                {
                    this.hide();
                    TDS.CLS.LogoutComponent.PageUnloadEvent.unsubscribeAll();                
                    window.location = TDS.CLS.defaultPage ;
                };
                
                var logoutHandler = function()
                {
                    this.hide();
                    //disable window.onunload handler.
                    TDS.CLS.LogoutComponent.PageUnloadEvent.unsubscribeAll();
                    window.location = TDS.CLS.logoutPage + "?exl=true" ;
                };
                
		        var buttons = [{ text: Messages.get('Try again'), handler: tryAgain, isDefault: true }, { text: Messages.get('Logout'), handler: logoutHandler, isDefault: false}];
		        TDS.Dialog.show(Messages.get('Global.Label.Warning'), Messages.getAlt('Global.Label.PopupBlockerMessage', popupBlockerMessage), buttons);
		    }
        }        
    },
    
    init: function()
    {
         
         var currentPage = (location.href).toLowerCase();
        
         var applyLogoutHandlerAll = function(logoutButtons, ignoreLoggedIn)
         {
            if (logoutButtons != null)
            {             
                for (var counter1 = 0; counter1 < logoutButtons.length; ++counter1)
                {
                    if (ignoreLoggedIn)
                    {
                        YUE.addListener(logoutButtons[counter1], 'click', function(){window.location = TDS.CLS.logoutPage + "?exl=true" ;});
                        logoutButtons[counter1].style.display = 'block';
                    }
                    else if (TDS.CLS.isProctorLoggedIn)
                    {
                        YUE.addListener(logoutButtons[counter1], 'click', TDS.CLS.LogoutComponent.logout);
                        logoutButtons[counter1].style.display = 'block';
                    }
                    else
                        logoutButtons[counter1].style.display = 'none';
                }
            }  
         }
         
         var allLogoutButtons=document.getElementsByName("goLogout");
         applyLogoutHandlerAll(allLogoutButtons, false);               
         allLogoutButtons=document.getElementsByName("goLogoutAlways");
         applyLogoutHandlerAll(allLogoutButtons, true);               
         
         
    
         //we are not going to attach this handler for clslogout and logout pages either.
         var excludedPage = false;
         for (var counter1 = 0; counter1 < TDS.CLS.PagesExcludedFromConfirm.length; ++counter1)
         {
            if (currentPage.indexOf(TDS.CLS.PagesExcludedFromConfirm[counter1]) >= 0)
            {
                excludedPage = true;
                break;
            }
         }
         //we do not want to fire a pop up if it is the secure browser.
         if (!excludedPage && !Util.Browser.isSecure())
         //now let's add the window.onload handler
             TDS.CLS.LogoutComponent.PageUnloadEvent.subscribe(TDS.CLS.LogoutComponent.confirmExit);
     
         /*
         //we also do not want to show the confirm exit window if this is a user click.
         //YUE.addListener(cbUser, 'click', funcClickUser);
         var allAHrefs = document.getElementsByTagName("a");
         if (allAHrefs != null)
         {
            for(var counter1 = 0; counter1 < allAHrefs.length; ++counter1)
            {
                //if (allAHrefs[counter1].href && allAHrefs[counter1].href != null)
                   YUE.addListener(allAHrefs[counter1], 'click', function(){TDS.CLS.LogoutComponent.PageUnloadEvent.unsubscribeAll();});
            }
         }
         */
         /*
          * What about input tags?
         var allInputs = document.getElementsByTagName("input");
         if (allInputs != null)
         {
            for(var counter1 = 0; counter1 < allInputs.length; ++counter1)
            {
                YUE.addListener(allInputs[counter1], 'click', function(){TDS.CLS.LogoutComponent.PageUnloadEvent.unsubscribeAll();});
            }
         }
         */
         var linksForDisabling = YAHOO.util.Dom.getElementsByClassName('confirmexitCSS', 'a');
         if (linksForDisabling != null)
         {
            for (var counter1 = 0; counter1 < linksForDisabling.length; ++counter1)
            {
                YUE.addListener(linksForDisabling[counter1], 'click', function(){TDS.CLS.LogoutComponent.PageUnloadEvent.unsubscribeAll();});
            }
		 }
		 //on the very first page we need to check for pop up blockers.
		 //however on secure browser we do not want to throw pop ups.
		 if (currentPage.indexOf('loginshell.aspx') >= 0 && !Util.Browser.isSecure())
             TDS.CLS.LogoutComponent.checkForPopupBlocker();
         
         
    },
    
    
    logout: function()
    {
        if (TDS.CLS.isCLSLogin)
        {
            //we will not disable the window.onunload handler yet. we will wait for confirmation before 
            //we do that.
            TDS.CLS.LogoutComponent.showCLSLogoutPrompt(TDS.CLS.logoutPage);
        }
        else
        {
            //disable window.onunload handler.
            TDS.CLS.LogoutComponent.PageUnloadEvent.unsubscribeAll();
            window.location = TDS.CLS.logoutPage;
        }
    }

}