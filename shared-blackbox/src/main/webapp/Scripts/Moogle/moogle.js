TDS.Moogle = (typeof (TDS.Moogle) == "undefined") ? {} : TDS.Moogle;

TDS.Moogle = function (identifier) {
};

// load search results from a parent element
TDS.Moogle.prototype.load = function(parent, spec) {

    parent = YUD.get(parent);

    var searchResultsTitle = Messages.get('TDSMoogle.searchResults');

    // create a div for moogle search esults
    var searchResultsDiv = document.createElement('div');
    var searchResultsHeaderH3 = document.createElement('h3');
    YUD.addClass(searchResultsHeaderH3, 'moogle-Header');
    var searchResultsText = document.createTextNode(searchResultsTitle);
    YUD.addClass(searchResultsText, 'moogle-title');
    searchResultsHeaderH3.appendChild(searchResultsText);
    searchResultsDiv.appendChild(searchResultsHeaderH3);
    YUD.setAttribute(searchResultsDiv, 'id', 'moogleSearchResults');

    var articleDiv = [];

    // get all resultElements
    var resultElements = YUD.getChildren(spec);

    // create a div for each result
    if (resultElements.length > 0) {
        var titleLink = [];
        for (var i = 0; i < resultElements.length; i++) {
            var result = resultElements[i];
            var resultDiv = document.createElement('div');
            YUD.setAttribute(resultDiv, 'id', 'moogleSearchResult_' + i);
            YUD.addClass(resultDiv, 'moogleSearchResultContainer');

            // create a div for title
            titleLink[i] = document.createElement('a');
            YUD.setAttribute(titleLink[i], 'id', 'moogleSearchResultTitle_' + i);
            YUD.addClass(titleLink[i], 'moogle-resultTitle');
            titleLink[i].innerHTML = result.children[1].textContent;
            resultDiv.appendChild(titleLink[i]);

            // create a div for thumbnail and snippet
            var thumbnailSnippetDiv = document.createElement('div');
            YUD.setAttribute(thumbnailSnippetDiv, 'id', 'moogleSearchResultThumbnailSnippet_' + i);

            var thumbnailSpan = document.createElement('span');
            YUD.setAttribute(thumbnailSpan, 'id', 'moogleSearchResultThumbnail_' + i);
            YUD.setAttribute(thumbnailSpan, 'moogle-thumbnailLeft');
            thumbnailSpan.innerHTML = result.children[0].textContent;
            thumbnailSnippetDiv.appendChild(thumbnailSpan);
            var snippetSpan = document.createElement('span');
            YUD.setAttribute(snippetSpan, 'moogle-snippetRight');
            YUD.setAttribute(snippetSpan, 'id', 'moogleSearchResultSnippet_' + i);
            snippetSpan.innerHTML = result.children[2].textContent;
            thumbnailSnippetDiv.appendChild(snippetSpan);
            
            resultDiv.appendChild(thumbnailSnippetDiv);

            searchResultsDiv.appendChild(resultDiv);
            YUD.addClass(searchResultsDiv, 'moogle-show'); // shown initially

            // create a div for each moogle search result article, but do not add it to searchResultsDiv
            articleDiv[i] = document.createElement('div');
            YUD.setAttribute(articleDiv[i], 'id', 'moogleSearchResultArticle_' + i);
            articleDiv[i].innerHTML = result.children[3].textContent;
            YUD.addClass(articleDiv[i], 'moogle-hide'); // hidden initially
        }
    }

    // create a back to index button
    var backToIndexLink = document.createElement('a');
    var backToIndexText = document.createTextNode('Back to Index');
    backToIndexLink.appendChild(backToIndexText);
    YUD.addClass(backToIndexLink, 'moogle-btiLink');
    YUD.addClass(backToIndexLink, 'moogle-hide'); // hidden initially

    // add everything to padding div
    var paddingEl = Util.Dom.getElementByClassName('padding', 'div', parent);
    if (paddingEl) {
        paddingEl.appendChild(searchResultsDiv);
        paddingEl.appendChild(backToIndexLink);
        for (var m = 0; m < articleDiv.length; m++) {
            paddingEl.appendChild(articleDiv[m]);
        }
    }

    YAHOO.util.Event.onDOMReady(function() {
        for (var j = 0; j < resultElements.length; j++) {
            YUE.addListener(titleLink[j], 'click', function(k) {
                return function() {
                    // hide searchResultsDiv
                    YUD.removeClass(searchResultsDiv, 'moogle-show');
                    YUD.addClass(searchResultsDiv, 'moogle-hide');
                    // show button and articleDiv
                    YUD.removeClass(backToIndexLink, 'moogle-hide');
                    YUD.addClass(backToIndexLink, 'moogle-show');
                    YUD.removeClass(articleDiv[k], 'moogle-hide');
                    YUD.addClass(articleDiv[k], 'moogle-show');

                    YUE.addListener(backToIndexLink, 'click', function() {
                        // hide button and articleDiv
                        YUD.removeClass(backToIndexLink, 'moogle-show');
                        YUD.addClass(backToIndexLink, 'moogle-hide');
                        YUD.removeClass(articleDiv[k], 'moogle-show');
                        YUD.addClass(articleDiv[k], 'moogle-hide');

                        // show searchResultsDiv
                        YUD.removeClass(searchResultsDiv, 'moogle-hide');
                        YUD.addClass(searchResultsDiv, 'moogle-show');
                    });
                };
            }(j));
        }
    });
};