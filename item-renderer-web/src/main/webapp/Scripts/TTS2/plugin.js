//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/*
CM TTS page plugin
*/

(function (CM) {

  console.log("JJONES CM load fires");
    if (!CM) return;

    //Is there a test I can do to disable everything if the accomodation properties do now allow
    //any tts for this test?  The accommodation properties seem to be set on the page level
    TTS.MenuSystem = { //Convert a {TTS.Menu}.getMenuCfg(obj) into the TDS menu implementation.
        Last: null,    //The most recently created TTS menu info
        Menu: null,
        addMenuSetup: function (menu, playCfg) {
            console.log("addMenuSetup JJONES");
            console.dir(playCfg);
            try {
                if (!menu || !playCfg || !playCfg.ORDER) {
                    return;
                }
                //Debug for Console debug of the TTS menu
                TTS.MenuSystem.Last = playCfg;
                TTS.MenuSystem.Menu = menu;

                var order = playCfg.ORDER;
                for (var i = 0; i < order.length; ++i) {
                    var entryName = order[i];
                    var entry = playCfg[entryName];
                    console.log("JJONES button entry:")
                    console.dir(entry);

                    console.log("entry .css is '" + entry.css + "'");

                    if (entry && (typeof entry.cb == 'function' || entry.allowDisabled)) {
                        menu.addMenuItem(entry.level || 'entity', {
                            text: Messages.get(entry.Label || 'TTS'),
                            onclick: { fn: entry.cb },
                            
                            // Bug 114478 & 142318 - Disable TTS menu entries if TDS Audio is active
                            disabled: typeof entry.cb == 'function' ? TDS.Audio.isActive() : entry.allowDisabled,
			    
                            classname: entry.css || 'speaksection',
			    style: 'cursor:pointer'
                        });
/*			
                      console.log("adding button");

                      if (entry.Label === "TDSTTS.Label.SpeakQuestionENU") {
                        // potential HACK bugfix for iOS TDS-1757
                        console.log("JJONES2 HACK button entry:");
                        console.dir(entry);
                        console.log("callback is ", entry.cb);
                        func = entry.cb;
                        entry.cb = function () {
                          console.log("Callback called");
                          TTS.Manager.play("Hi there", "ENU");
                          //func();
                        };
                        console.log("callback is ", entry.cb);
                      }
*/
                    }
                }

            } catch (e) {
                console.error("Failed to create menu item.", e);
            }
        }
    };

    ///////////////////////////////////////////////////////////////////////////

    function hasTTSItemEnabled(page) {
        var accProps = page.getAccommodationProperties();
        return accProps && accProps.hasTTSItem();
    }

    function hasTTSPassageEnabled(page) {
        var accProps = page.getAccommodationProperties();
        return accProps && accProps.hasTTSStimulus();
    }

    function hasTTSEnabled(page) {
        return hasTTSItemEnabled(page) || hasTTSPassageEnabled(page);
    }

    /* Item */
    function ItemPlugin_TTS(page, entity, config) {
      console.log("JJONES ItemPlugin_TTS fires");
      console.dir(page);

    }

    // Override the check for whether tracking is enabled or not based to look for the accommodation.
    TTS.Config.isTrackingEnabled = function () {
        return window.ContentManager != null && window.ContentManager.getAccommodationProperties().isTTSTrackingEnabled();
    };

    function itemMatch(page, entity) {
        var accProps = page.getAccommodationProperties();
        if (accProps && entity instanceof ContentItem) {
            if (entity.isResponseType('EBSR')) return false;
            return accProps.hasTTSItem();
        }
        return false;
    }

    CM.registerEntityPlugin('item.tts', ItemPlugin_TTS, itemMatch, {
        priority: 299 // right before strikethrough
    });

    ItemPlugin_TTS.prototype.load = function () {

        console.log("JJONES prototype load fires");

        // check for elements that we want TTS to skip
        var page = this.page;
        var item = this.entity;
        var itemEl = item.getElement();
        if (itemEl) {
            // check for item tools container
            var markCommentEl = Util.Dom.getElementByClassName('markComment', 'span', itemEl);
            if (markCommentEl) {
                markCommentEl.setAttribute('data-tts-skip', 'true');
            }
            // check for item position header
            var posEl = Util.Dom.queryTag('h2', itemEl);
            if (posEl && Util.Dom.getTextContent(posEl) == item.position) {
                posEl.setAttribute('data-tts-skip', 'true');
            }
        }

        console.log("JJONES: attempting to add onclicks to hamburger menu (this actually works on mac, but sadly onclick won't fire on iOS!).");
        // why? well, these events may require this fix to fire: https://stackoverflow.com/questions/14795944/jquery-click-events-not-working-in-ios
        var menus = this.page.getDoc().getElementsByClassName("toolButton itemMenu");
        for (var i = 0; i < menus.length; ++i) {

          console.log("adding alert to menu " + i);
          // Both of these approaches to add onclicks below work on OSX Safari but not iOS Safari! Why?
          //menus[i].setAttribute("onclick","console.log('blah');");
          menus[i].onclick = function() {
            console.log("you clicked menu " + i);
            TTS.Manager.play("you clicked menu number " + i, "ENU");
            return true;
          };

          // this style modifying fix (the fix from SO URL above) doesn't work, probably because I can't figure out the proper syntax.
          // TODO: Maybe find HTML the hamburger menu is created in and add it there so it's present at load time?
          if (menus[i].style) {
            menus[i].style = "cursor:pointer; " + menus[i].style;
          } else {
            menus[i].style = "cursor:pointer";
          }
        }

        // Create TTS.Singleton
        TTS.createSingleton();

        var pageDoc = page.getDoc();
        if (pageDoc) {
            // check for comment box
            var commentBoxEl = pageDoc.getElementById('Item_CommentBox_' + item.position);
            if (commentBoxEl) {
                commentBoxEl.setAttribute('data-tts-skip', 'true');
            }
        }
    }

    ItemPlugin_TTS.prototype.showMenu = function(menu, evt, selection) {

        var page = this.page;
        var item = this.entity;
        var ctrl = TTS.getInstance();
        if (!ctrl.isAvailable()) return;

        var isMC = item.widgets.has('mc');
        if (isMC) {
//            return;
        }

        //Create the text to speech menu defaults.
        var pageWin = page.getActiveWin(); //for determining user highlight selection
        var languages = CM.getLanguage() != 'ENU' ? ['ESN', 'ENU'] : ['ENU'];
        var domToParse = [];

        //Add in major dom elements that will make up TTS parsing / play info
        var stem = item.getStemElement();
        if (stem) {
            domToParse.push(stem);
        }

        var illustration = item.getIllustrationElement();
        if (illustration) {
            domToParse.push(illustration);
        }

        //Actually load up the menu configuration plus hard coded stemTTS hacks.
        var ttsMenu = new TTS.Menu(languages);
        var menuCfg = ttsMenu.getMenuCfg(domToParse, selection, pageWin, item.stemTTS, page, item);

        console.log("JJONES Adding menu 1");
        TTS.MenuSystem.addMenuSetup(menu, menuCfg);
        TTS.Config.Debug && console.log("TTS On Item Menushow config", menuCfg);
    }

    ItemPlugin_TTS.prototype.hide = function () {
        // if we are playing audio stop it
        TTS.getInstance().stop();
    };

    /* Passage */
    function PassagePlugin_TTS(page, entity, config) {
    }

    CM.registerEntityPlugin('passage.tts', PassagePlugin_TTS, function itemMatch(page, entity) {
        var accProps = page.getAccommodationProperties();
        if (accProps && entity instanceof ContentPassage) {
            return accProps.hasTTSStimulus();
        }
        return false;
    });

    PassagePlugin_TTS.prototype.load = function () {
        // initialize TTS
        TTS.createSingleton();
    };

    PassagePlugin_TTS.prototype.showMenu = function (menu, evt, selection) {
        console.log("JJONES showMenu fires");
        var page = this.page;
        var passage = this.entity;

        // check if TTS is available yet
        if (!TTS.Manager.isAvailable()) return;

        //Create the text to speech menu defaults.
        var languages = CM.getLanguage() != 'ENU' ? ['ESN', 'ENU'] : ['ENU'];
        var ttsMenu = new TTS.Menu(languages);

        var menuCfg = ttsMenu.getMenuCfg(
            passage.getElement(), //Passage element
            selection,            //The selection that was on the page.
            page.getActiveWin(), //Active window
            passage.stemTTS,      //If defined will overwrite all passage html
            page,
            passage
        );

        TTS.Config.Debug && console.log("Passage menu show.", menuCfg);
      console.log("JJONES Adding menu 2");
        TTS.MenuSystem.addMenuSetup(menu, menuCfg);
    }

    PassagePlugin_TTS.prototype.hide = function () {
        // if we are playing audio stop it
        TTS.getInstance().stop();
    };

    /* Page */
    function PagePlugin_TTS(page, config) {
    }

    CM.registerPagePlugin('tts-page', PagePlugin_TTS, function pageMatch(page) {
      console.log("JJONES registerPagePlugin fires");
      console.dir(page);
        return hasTTSEnabled(page);
    });

    ///////////////////////////////////////////////////////////////////////////

    function ttsNotSpeaking() {
        var ttsInstance = TTS.getInstance();
        if (ttsInstance && ttsInstance.isPlaying()) {
            return false;
        } else {
            return true;
        }
    }

    TDS.Audio.Player.onBeforePlay.subscribe(function () {
      console.log("JJONES onBeforePlay fires");
        return ttsNotSpeaking();
    });

    TDS.Audio.Player.onBeforeResume.subscribe(function () {
        return ttsNotSpeaking();
    });

    // Always try to stop TTS if it is running.
    CM.onPageEvent('hide', function (page) {
        TTS.getInstance().stop();
    });

})(window.ContentManager);
