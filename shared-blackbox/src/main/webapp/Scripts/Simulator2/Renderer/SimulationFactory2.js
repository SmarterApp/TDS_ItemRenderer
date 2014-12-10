/*
This code is used for creating frames for simulator.
*/

SimulationFactory =
{
  _id: 0,
  _scriptsYUIPath: '',
  _scriptsRendererPath: '',
  _scriptsEvalPath: '',
  _stylesPath: '',
  _stylesCustom: [],
  _customFormatter: null // custom formatter func for css/js
};

// set a custom function for modifying css/js url's before they are added to iframe (e.x., manifest)
SimulationFactory.setCustomFormatter = function(formatterFunc) { this._customFormatter = formatterFunc; };

SimulationFactory.setYUIScriptsPath = function(path) { this._scriptsYUIPath = path; };
SimulationFactory.setRendererScriptsPath = function(path) { this._scriptsRendererPath = path; };
SimulationFactory.setEvaluationScriptsPath = function(path) { this._scriptsEvalPath = path; };
SimulationFactory.setStylesPath = function(path) { this._stylesPath = path; };

// add a custom CSS file outside the defaults
SimulationFactory.addStyle = function(file) { this._stylesCustom.push(file); };

SimulationFactory.create = function(container, callback)
{
  this._id++;
  this._createFrame(container, callback);
};

// create iframe for simulator
SimulationFactory._createFrame = function(container, callback)
{
  var containerDoc = container.ownerDocument;
  var id = 'sim_frame_' + this._id;

    // create frame
    var frameElement = (YAHOO.env.ua.ie > 0) ? containerDoc.createElement('<iframe name="' + id + '">') : containerDoc.createElement('iframe');

    // add attributes
    frameElement.setAttribute('id', id);
    frameElement.setAttribute('name', id);
    frameElement.setAttribute('border', 0);

  // append frame to dom
  container.appendChild(frameElement);

  // set frame options
  var frameOptions = {};
  frameOptions.scripts = this.getScripts();
  frameOptions.styles = this.getStyles();

  // set callback
  if (YAHOO.lang.isFunction(callback))
  {
    frameOptions.callbackName = '__callback_' + id;
    var containerwin = 'defaultView' in containerDoc ? containerDoc.defaultView : containerDoc.parentWindow;
    containerwin[frameOptions.callbackName] = callback;
  }

  // create frame html
  var frameBody = this._getBody();
  var frameHtml = this.createFrameHtml(frameBody, frameOptions); 

  //frameElement.appendChild(frameHtml);  // Added due to change from iFrame to div

  // write to frame - not needed since changed from iframe to div
  var frameDoc = frameElement.contentDocument ?
    frameElement.contentDocument : frameElement.contentWindow ?
    frameElement.contentWindow.document : frameElement.document;

  frameDoc.open();
    frameDoc.write(frameHtml);
    frameDoc.close();

  return frameElement;
};

SimulationFactory._getBody = function()
{
  var bodyHtml = [];

  bodyHtml.push('<div class="pageWrapper">');
  bodyHtml.push('<div class="layout27">');
  bodyHtml.push('<div class="bigTable layout27">');
  bodyHtml.push('<div class="thePassage contextArea">');
  bodyHtml.push('<div class="padding" id="padding">');
  bodyHtml.push('</div></div></div></div></div>');

  return bodyHtml.join('');
};

SimulationFactory.getScripts = function()
{
  // get all the scripts
  var yuiScripts = this._getYUIScripts();
  var rendererScripts = this._getRendererScripts();
  var evalScripts = this._getEvaluationScripts();

  // combine all scripts into single array and return them
  var scripts = yuiScripts.concat(rendererScripts).concat(evalScripts);
  return scripts;
};

SimulationFactory._getYUIScripts = function()
{
  var scripts =
  [
    'yahoo-dom-event/yahoo-dom-event.js',
    'dragdrop/dragdrop-min.js',
    'slider/slider-min.js'
  ];

  // fix root path
  for (var i = 0; i < scripts.length; i++) { scripts[i] = this._scriptsYUIPath + scripts[i]; }

  return scripts;
};

SimulationFactory._getRendererScripts = function()
{
  var scripts =
  [
    'SetSimNameSpace.js',
    'SWF/swfobject.js',
    'Object2.js',
    'HTML2JSMap2.js',
    'Constants2.js',
    'Whiteboard2.js',
    'Utils/Utils2.js',
    'Utils/Debug2.js',
    'Utils/Queue2.js',
    'Utils/Stack2.js',
    'Utils/String2.js',
    'Utils/Dictionary2.js',
    'Utils/Table2.js',
    'Utils/PersistentVariableDataBase2.js',
    'SimItem2.js',
    'Input/KeyboardInput2.js',
    'SimElement2.js',
//    'Input/KeyboardInput2.js',
    'DataDictionary2.js',
    'EventManager2.js',
    'EventDB2.js',
    'Event2.js',
    'Display/Layout2.js',
    'Simulator2.js',
    'SimulationManager2.js',
    'Display/Canvas2.js',
    'Display/Panel2.js',
    'Input/StaticElement2.js',
    'Input/HorizontalLine2.js',
    'Input/SectionDivider2.js',
    'Input/ImageElement2.js',
    'Input/TextConstant2.js',
    'Input/VerticalSpace2.js',
    'Animation/AnimationElement2.js',
    'Animation/AnimationRenderer2.js',
    'Animation/AnimationSet2.js',
    'Animation/AnimationThread2.js',
    'Animation/AnimationThreadElement2.js',
    'Input/Section2.js',
    'Input/InputElement2.js',
    'Input/GroupList2.js',
    'Input/ChoiceList2.js',
    'Input/DropList2.js',
    'Input/OptionList2.js',
    'Input/FieldSet2.js',
    'Input/TextField2.js',
    'Input/StaticElement2.js',
    'Input/VerticalSpace2.js',
    'Input/HorizontalLine2.js',
    'Input/UpDownCounter2.js',
    'Input/TextConstant2.js',
    'Control/CommandElement2.js',
    'Control/Button2.js',
    'Display/DataDisplayElement2.js',
    'Display/DataTable2.js',
    'Display/DialogPanel2.js',
//    'ResponseStateManager2.js',
    'SimulationLoader2.js'
  ];

  // fix root path
  for (var i = 0; i < scripts.length; i++) { scripts[i] = this._scriptsRendererPath + scripts[i]; }

  return scripts;
};

SimulationFactory._getEvaluationScripts = function()
{
  var scripts =
  [
	'SimParser.js',
   	'ParserItem.js',
    'SimUtils.js',
    'Parser.js',
    'ASCIIMathML.js',
    'xmlHelper.js',
    'Constraints.js',
    'ConstraintManager.js',
    'Permutations.js',
    'Functions.js',
    'FunctionManager.js',
    'FilterEvaluation.js',
    'Ranges.js',
    'RangeManager.js',
    'MinMaxRange.js',
    'IterationRange.js',
    'Variables.js',
    'VariableManager.js',
    'PersistentVariable.js',
    'ImplicitVariable.js',
    'LookupVariable.js',
    'BindableVariable.js',
    'ConstantVariable.js',
    'CumulativeVariable.js',
    'ResultVariable.js',
    'FunctionEvaluation.js',
    'EvaluationUnit.js'
  ];

  // fix root path
  for (var i = 0; i < scripts.length; i++) { scripts[i] = this._scriptsEvalPath + scripts[i]; }

  return scripts;
};

SimulationFactory.getStyles = function()
{
  var styles =
  [
    'accommodations.css',
    'simulator.css',
    'slider.css'
];
  
  styles = styles.concat(this._stylesCustom);

  // fix root path
  for (var i = 0; i < styles.length; i++) { styles[i] = this._stylesPath + styles[i];  }

  return styles;
};

SimulationFactory.getShellSWF = function()
{
    return this._scriptsRendererPath + 'SWF/SimulationShell.swf';
};

// returns the html that is used for an iframe
SimulationFactory.createFrameHtml = function(bodyHtml, options)
{
    // frameOptions: docType, baseURI, scripts, styles, bodyHtml, callbackName
    options = options || {};
    var html = [];

    // add doc type (or we use default)
    if (!YAHOO.lang.isString(options.docType))
    {
        options.docType = '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">';
    }

    html.push(options.docType);

    //add html
    html.push('<html xmlns="http://www.w3.org/1999/xhtml">');
    html.push('<head>');
    html.push('<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />');

    // set frames base url (used to resolve resources)
    if (!YAHOO.lang.isString(options.baseURI))
    {
        options.baseURI = document.baseURI || document.URL;
    }

    var frameURI = options.baseURI.replace(/[^\/]*$/, '');
    html.push('<base href="' + frameURI + '" />');

    // set frames scripts
    if (YAHOO.lang.isArray(options.scripts))
    {
        for (var i = 0; i < options.scripts.length; i++)
        {
            var script = options.scripts[i];
            if (YAHOO.lang.isFunction(this._customFormatter)) {
                script = this._customFormatter(script);
            }
            html.push('<script type="text/javascript" src="' + script + '"></script>');
        }
    }

    // set frames styles
    if (YAHOO.lang.isArray(options.styles))
    {
        for (var i = 0; i < options.styles.length; i++)
        {
            var style = options.styles[i];
            if (YAHOO.lang.isFunction(this._customFormatter)) {
                style = this._customFormatter(style);
            }
            html.push('<link type="text/css" rel="stylesheet" href="' + style + '" />');
        }
    }

    // set animation shell
    html.push('<script type="text/javascript">');
    html.push('var animationShellPath = "');
    html.push(SimulationFactory.getShellSWF());
    html.push('";');
    
    // Create the Simulator namespace
    //html.push('SetSimNameSpace();');
    html.push('</script>');
    
    //html.push('</head>');

    // if there is a callback function name then call it on the parent when frame loads
    if (YAHOO.lang.isString(options.callbackName))
    {
        html.push('<body onload="setTimeout(function() { parent.' + options.callbackName + '(new Simulator.Simulator(' + SimulationFactory._id + ')); }, 0);">');
    }
    else
    {
        html.push('<body>');
    }

    // set body html
    if (YAHOO.lang.isString(bodyHtml)) html.push(bodyHtml);

    html.push('</body></html>');

    return html.join('');
};
