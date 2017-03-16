 /**
 Copyright © 2012 American Institute for Research. All Rights Reserved.
 
 Redistribution and use in source and binary forms, with or without modification, are permitted provided that the         following conditions are met:
 
 1. Redistributions of source code must retain the above copyright notice, this list of conditions and the following      disclaimer.
 
 2. Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following   disclaimer in the documentation and/or other materials provided with the distribution.
 
 3. The name of the author may not be used to endorse or promote products derived from this software without specific     prior written permission.
 
 THIS SOFTWARE IS PROVIDED BY [LICENSOR] "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO,    THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE     AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)        HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR   OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
*  These are some of the default layouts for common editing tabs.   These are used when
* in a configuration mode to provide the user with easy to configure button options.
*/
(function(){
    if (!window.MathEditorContent) { window.MathEditorContent = {}; }
  var greek = {
    title: 'Greek',
    type: 'row',
    items: [
      'alpha',
      'beta',
      'gamma',
      'delta',
      'epsilon',
      'zeta',
      'eta',
      'theta',
      'iota',
      'kappa',
      'lambda',
      'mu',
      'nu',
      'xi',
      'omicron',
      'pi',
      'rho',
      'sigma',
      'tau',
      'upsilon',
      'phi',
      'chi',
      'psi'
    ]
  };

  var trig = {
    title: 'Trigonometry',
    type: 'row',
    items: [
      'sin',
      'cos',
      'tan',
      'arcsin',
      'arccos',
      'arctan'
    ]
  };

  //UGH
  var numbers = {
    title: 'Numbers',
    type: 'grid',
    cols: 3,
    items: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 
      '.',
      {key: 'fraction', text: 'fraction', value: '\\frac{\\PH}{\\PH}', css: 'mathjax_editor_button_fraction'}
    ]
  };

  var numbersminus = {
    title: 'Numbers',
    type: 'grid',
    cols: 3,
    items: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.', '-']
  };

  var numpad = {
    title: 'Number Pad',
    type: 'numpad',
    //func: A func on the numpad type will be a ref used only on "enter"
    //rather than the default for the buttons.  Defaults to updateMath
    items: [
      '7', '8', '9', '4', '5', '6', '1', '2', '3', '0', '.'
    ]
  };

  var decimalnumbers = {
      title: 'Numbers',
      type: 'grid',
      cols: 3,
      items: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.']
  };

  var operations = {
    title: 'Operations_After_Grade_6',
    type: 'row',
    items: [
      '+', '-', {key: '*', text: '*'}, 'div'
    ]
  };

  var operations_muldot = {
      title: 'OperationsWithCDot',
      type: 'row',
      items: [
        '+', '-', { key: '*', value: '\\bullet', css: 'mje_button_dot'/*text: eval('"\\u25CF"')*/ }, 'div']
  };

  var operations_calc = {
    title: 'Operations',
    type: 'row',
    items: [
      '+', 
      '-', 
      {key: '*', text: '*'}, 
      'div', 
      {key: 'nrt',    value: '\\sqrt[\\PH]{\\PH}',      css: 'mathjax_editor_button_nrt'},
      {key: 'fraction',   value: '\\frac{\\PH}{\\PH}',  css: 'mathjax_editor_button_fraction'},
      {key: 'intV',   value: '\\int_\\PH^\\PH \\PH',    css: 'mathjax_editor_button_intergal_vals',		text:eval('"\\u222B"')},
      {key: 'sub',    value: '\\PH_\\PH',               css: 'mathjax_editor_button_sub'},            
      {key: 'sup',     value: '\\PH^\\PH',              css: 'mathjax_editor_button_sup'}
    ]
  };

  var operation_simple = {
      title: 'Operations',
      type: 'row',
      items: ['+', '-', 'times', 'div']
  };


  var signs_basic = {
      title: 'Signs',
      type: 'row',
      items: ['lt', '=', 'gt']
  };

  var signs = {
      title: 'Signs',
      type: 'row',
      items: ['lt', 'le', '=', 'ge', 'gt']
  };

  var basic_variables = {
      title: 'Variables',
      type: 'row',
      items: [
        'x', 
        'y'
      ]
  };

  var variables = {
      title: 'Variables',
      type: 'row',
      items: [
        'f', 
        'n', 
        'x', 
        'y', 
        { key: 'sub', value: '\\PH_{\\PH}' }, 
        { key: '| |', value: '\\lvert\\PH\\rvert' }, 
        { key: '( )', value: '(\\PH)' }]
  };

  var fractions = {
    title: 'Fractions',
    type: 'row',
    items: [
      {key: 'fraction', value: '\\frac{\\PH}{\\PH}'}
    ]
  };

  var calc = {
      title: 'Calculus',
      type: 'row',
      items: [
        { key: 'subsup', value: '\\PH_{\\PH}^{\\PH}', css: '' },
      ]
  };

  var other = {
      title: 'Other',
      type: 'row',
      items: [
        { key: '| |', value: '\\lvert\\PH\\rvert', css: '' }, 
        { key: '( )', value: '(\\PH)' }
      ]
  };
  var functions = {
    title: 'Functions',
    type: 'grid',
    cols: 2,
    items: [
      '(', ')',
      'sin', 'cos',
      'tan', {key: 'e^x', value: 'e^{\\PH}', text: 'e^exp'},
      'ln',  'log',
      {key: 'n!', value: '\\PH!', text: 'n!'}, 
      {key: 'FBoxes', value: '\\frac{\\PH}{\\PH}', text: 'fraction'},
      {key: 'x^y', text: 'x^y', value: 'x^y'}, {key: 'x^2', value: 'x^2', text: 'x^2'},
      {key: 'x^3', text: 'x^3', value: 'x^3'}, 'pi',
      'abs'
    ]
  };

 var row3_sbac4 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: '( )', value: '(\\PH)' }
      ]
  };

  var row3_sbac5 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'sup', value: '\\PH^\\PH' }, 
        { key: '( )', value: '(\\PH)' }
      ]
  };

  var row3_sbac6 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' }, 
        { key: 'sup', value: '\\PH^\\PH' }, 
        { key: '( )', value: '(\\PH)' }, 
        { key: '| |', value: '\\lvert\\PH\\rvert' }
      ]
  };

  var row3_sbac7 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' }, 
        { key: 'sup', value: '\\PH^\\PH' }, 
        { key: '( )', value: '(\\PH)' }, 
        { key: '| |', value: '\\lvert\\PH\\rvert' }, 
        "pi"
      ]
  };

  var row3_sbac8 = {
      title: 'Other',
      type: 'row',
      items: [
      { key: 'fraction', value: '\\frac{\\PH}{\\PH}' }, 
      { key: 'sup', value: '\\PH^\\PH' }, 
      { key: '( )', value: '(\\PH)' }, 
      { key: '| |', value: '\\lvert\\PH\\rvert' }, 
      { key: 'sqrt', value: '\\sqrt{\\PH}' }, 
      { key: 'nrt', value: '\\sqrt[\\PH]{\\PH}' }, 
      "pi"
      ]
  };

  var row3_sbac10 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' }, 
        { key: 'sup', value: '\\PH^\\PH' }, 
        { key: 'sub', value: '\\PH_\\PH'},
        { key: '( )', value: '(\\PH)' }, 
        { key: '| |', value: '\\lvert\\PH\\rvert' }, 
        { key: 'sqrt', value: '\\sqrt{\\PH}' }, 
        { key: 'nrt', value: '\\sqrt[\\PH]{\\PH}' }, 
        "pi", 
        "i"
      ]
  };

  var row3_utah3 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' },
        { key: '( )', value: '(\\PH)' }
      ]
  };

  var row3_utah4 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' },
        { key: '( )', value: '(\\PH)' }
      ]
  };

  var row3_utah5 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' },
        { key: 'sup', value: '\\PH^\\PH' },
        { key: '( )', value: '(\\PH)' }
      ]
  };

  var row3_utah6 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' },
        { key: 'sup', value: '\\PH^\\PH' },
        { key: '( )', value: '(\\PH)' },
        { key: '| |', value: '\\lvert\\PH\\rvert' }, 
      ]
  };

  var row3_utah7 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' },
        { key: 'sup', value: '\\PH^\\PH' },
        { key: '( )', value: '(\\PH)' },
        { key: '| |', value: '\\lvert\\PH\\rvert' },
        { key: 'sqrt', value: '\\sqrt{\\PH}' },
        { key: 'nrt', value: '\\sqrt[\\PH]{\\PH}' },
        "pi"
      ]
  };

  var row3_utah8 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' },
        { key: 'sup', value: '\\PH^\\PH' },
        { key: '( )', value: '(\\PH)' },
        { key: '| |', value: '\\lvert\\PH\\rvert' },
        { key: 'sqrt', value: '\\sqrt{\\PH}' },
        { key: 'nrt', value: '\\sqrt[\\PH]{\\PH}' },
        "pi"
      ]
  };

  var row3_utahsm1 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' },
        { key: 'sup', value: '\\PH^\\PH' },
        { key: 'sub', value: '\\PH_\\PH' },
        { key: '( )', value: '(\\PH)' },
        { key: '| |', value: '\\lvert\\PH\\rvert' },
        { key: 'sqrt', value: '\\sqrt{\\PH}' },
        { key: 'nrt', value: '\\sqrt[\\PH]{\\PH}' },
        "pi"
      ]
  };

  var row3_utahsm2 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' },
        { key: 'sup', value: '\\PH^\\PH' },
        { key: 'sub', value: '\\PH_\\PH' },
        { key: '( )', value: '(\\PH)' },
        { key: '| |', value: '\\lvert\\PH\\rvert' },
        { key: 'sqrt', value: '\\sqrt{\\PH}' },
        { key: 'nrt', value: '\\sqrt[\\PH]{\\PH}' },
        "pi",
        "i"
      ]
  };


  var row3_utahsm3 = {
      title: 'Other',
      type: 'row',
      items: [
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' },
        { key: 'sup', value: '\\PH^\\PH' },
        { key: 'sub', value: '\\PH_\\PH' },
        { key: '( )', value: '(\\PH)' },
        { key: '| |', value: '\\lvert\\PH\\rvert' },
        { key: 'sqrt', value: '\\sqrt{\\PH}' },
        { key: 'nrt', value: '\\sqrt[\\PH]{\\PH}' },
        "pi",
        "i"
      ]
  };

  MathEditorContent.Config = MathEditorContent.Config || {};
  MathEditorContent.Config.Common = [
    {key: 'Box',    value: '\\Box',                text: eval('"\\u2610"')},
    {key: 'int',    value: '\\int\\PH',            text: eval('"\\u222B"')},
    {key: 'abs',    value: '\\lvert\\PH\\rvert',   text: '| |'},
    {key: 'sqrt',   value: '\\sqrt\\PH',           text: eval('"\\u221A"')},
    {key: 'nrt',    value: '\\sqrt[\\PH]{\\PH}',      css: 'mathjax_editor_button_nrt'},
    {key: 'fraction',   value: '\\frac{\\PH}{\\PH}',  css: 'mathjax_editor_button_fraction'},
    {key: 'intV',   value: '\\int_\\PH^\\PH \\PH',    css: 'mathjax_editor_button_intergal_vals',		text:eval('"\\u222B"')},
    {key: 'sub',    value: '\\PH_\\PH',               css: 'mathjax_editor_button_sub'},            
    {key: 'sup',     value: '\\PH^\\PH',              css: 'mathjax_editor_button_sup'},
    {key: 'subsup', value: '\\PH_\\PH^\\PH',          css: 'mathjax_editor_button_subsup'}
  ];
  
  MathEditorContent.Config.Rows = {
    Numbers: numbers,
    NumPad: numpad,
    Signs: signs,
    Functions: functions,
    Other: other,
    Operations: operations,
    SimpleOperation: operation_simple,
    OperationsWithCDot: operations_muldot,
    Greek: greek,
    Trigonometry: trig,
    Algebra: basic_variables,
    Fraction: fractions
  };

  //A common set of tabs, order is the array ordering,
  MathEditorContent.Config.Tabs = {
      Order: ['Numbers', 'Basic', 'Algebra', 'Calculus', 'SBAC3', 'SBAC4', 'SBAC5', 'SBAC6', 'SBAC7', 'SBAC8', 'SBAC9', 'SBAC10', 'SBAC11', 'Utah3', 'Utah4', 'Utah5', 'Utah6', 'Utah7', 'Utah8', 'UtahSM1', 'UtahSM2', 'UtahSM3' ],
    Numbers: {
      title: 'Numbers',
      rows: [
        numbers
      ]
    },
    Basic: {
      title: 'Basic', 
      rows: [numbers, operation_simple, signs_basic, fractions]
    },
    Algebra: {
      title: 'Algebra',
      rows: [
        numbers,
        basic_variables,
        operations,
        signs,
        other
      ]
    },
    Calculus: {
      title: 'Calculus',
      rows: [
          numbers,
          variables,
          operations_calc,
          signs,
          trig
        ]
    },
    SBAC3: {
        title: 'SBAC3',
        rows: [numbers, operation_simple, signs_basic, row3_sbac4]
    },
    SBAC4: {
        title: 'SBAC4',
        rows: [numbers, operation_simple, signs_basic, row3_sbac4]
    },
    SBAC5: {
        title: 'SBAC5',
        rows: [numbers, operation_simple, signs_basic, row3_sbac5]
    },
    SBAC6: {
        title: 'SBAC6',
        rows: [numbersminus, operations, signs_basic, row3_sbac6]
    },
    SBAC7: {
        title: 'SBAC7',
        rows: [numbersminus, operations, signs, row3_sbac7]
    },
    SBAC8: {
        title: 'SBAC8',
        rows: [numbersminus, operations, signs, row3_sbac8]
    },
    SBAC9: {
        title: 'SBAC9',
        rows: [numbersminus, operations, signs, row3_sbac8]
    },
    SBAC10: {
        title: 'SBAC10',
        rows: [numbersminus, operations, signs, row3_sbac10]
    },
    SBAC11: {
        title: 'SBAC11',
        rows: [numbersminus, operations, signs, row3_sbac10, trig]
    },
    Utah3: {
        title: 'Utah3',
        rows: [decimalnumbers, operation_simple, signs_basic, row3_utah3]
    },
    Utah4: {
      title: 'Utah4',
      rows: [decimalnumbers, operation_simple, signs_basic, row3_utah4]
    },
    Utah5: {
        title: 'Utah5',
        rows: [decimalnumbers, operation_simple, signs_basic, row3_utah5]
    },
    Utah6: {
        title: 'Utah6',
        rows: [numbersminus, operations_muldot, signs_basic, row3_utah6]
    },
    Utah7: {
        title: 'Utah7',
        rows: [numbersminus, operations_muldot, signs, row3_utah7]
    },
    Utah8: {
        title: 'Utah8',
        rows: [numbersminus, operations_muldot, signs, row3_utah8]
    },
    UtahSM1: {
        title: 'UtahSM1',
        rows: [numbersminus, operations_muldot, signs, row3_utahsm1]
    },
    UtahSM2: {
        title: 'UtahSM2',
        rows: [numbersminus, operations_muldot, signs, row3_utahsm2, trig]
    },
    UtahSM3: {
        title: 'UtahSM3',
        rows: [numbersminus, operations_muldot, signs, row3_utahsm3, trig]
    }

  };

    //translator obj
  MathEditorContent.Config.Translator = {
      _itemCollectioBuildComplete: false,
      itemCollection: {
          keys: [],
          values: []
      },
      _ignoreItems: [],
      buildItemCollection: function () {
          //build ignore items
          this._ignoreItems.push('(');
          this._ignoreItems.push(')');

          var keys = [], values = [];
          keys.push('Box'); values.push({ key: 'Box', text: '&#x25a1;', cmd: '\\Box', title: 'box', arialabel: 'box' });


          keys.push('1'); values.push({ key: '1', text: '1', title: 'one', arialabel: 'one' });
          keys.push('2'); values.push({ key: '2', text: '2', title: 'two', arialabel: 'two' });
          keys.push('3'); values.push({ key: '3', text: '3', title: 'three', arialabel: 'three' });
          keys.push('4'); values.push({ key: '4', text: '4', title: 'four', arialabel: 'four' });
          keys.push('5'); values.push({ key: '5', text: '5', title: 'five', arialabel: 'five' });
          keys.push('6'); values.push({ key: '6', text: '6', title: 'six', arialabel: 'six' });
          keys.push('7'); values.push({ key: '7', text: '7', title: 'seven', arialabel: 'seven' });
          keys.push('8'); values.push({ key: '8', text: '8', title: 'eight', arialabel: 'eight' });
          keys.push('9'); values.push({ key: '9', text: '9', title: 'nine', arialabel: 'nine' });
          keys.push('0'); values.push({ key: '0', text: '0', title: 'zero', arialabel: 'zero' });

          keys.push('+'); values.push({ key: '+', text: '+', title: 'plus', arialabel: 'plus' });
          keys.push('-'); values.push({ key: '-', text: '-', title: 'minus', arialabel: 'minus' });
          keys.push('.'); values.push({ key: '.', text: '.', title: 'period', arialabel: 'period' });

          //math operators
          keys.push('div'); values.push({ key: 'div', text: '&#xF7;', title: 'divison', arialabel: 'divison' });
          keys.push('*'); values.push({ key: '*', text: '&#x2217;', cmd: '\\ast', title: 'asterisk', arialabel: 'multiply' });
          keys.push('mje_button_dot'); values.push({ key: 'cdot', text: '&#x2219;', css: 'mje_button_dot', title: 'cdot', arialabel: 'multiply' });
          keys.push('times'); values.push({ key: 'times', text: '&#215;', title: 'times', arialabel: 'multiply' });
          keys.push('fraction'); values.push({ key: 'fraction', cmd: '/', css: 'mje_button_fraction', title: 'fraction', arialabel: 'fraction' });
          keys.push('FBoxes'); values.push({ key: 'FBoxes', cmd: '/', css: 'mje_button_fraction', title: 'fboxes', arialabel: 'fraction' });

          //conditional operators: signs
          keys.push('lt'); values.push({ key: 'lt', text: '&#x3C;', title: 'lt', arialabel: 'Less Than' });
          keys.push('le'); values.push({ key: 'le', text: '&#x2264;', title: 'le', arialabel: 'Less Than Equal To' });
          keys.push('='); values.push({ key: '=', text: '&#x3D;', title: 'eq', arialabel: 'Equals' });
          keys.push('ge'); values.push({ key: 'ge', text: '&#x2265;', title: 'ge', arialabel: 'Greater Than' });
          keys.push('gt'); values.push({ key: 'gt', text: '&#x3E;', title: 'gt', arialabel: 'Greater Than Equal To' });

          //calculus operators
          keys.push('sqrt'); values.push({ key: 'sqrt', cmd: '\\sqrt', css: 'mje_button_sqrt', title: 'sqroot', arialabel: 'Square Root' });
          keys.push('nrt'); values.push({ key: 'nrt', cmd: '\\nthroot', css: 'mje_button_nrt', title: 'nthroot', arialabel: 'Nth Root' });
          keys.push('intV'); values.push({ key: 'intV', text: '&#x0222B;', title: 'integral', arialabel: 'Integral' }); //integral not found in desmos
          keys.push('sup'); values.push({ key: 'sup', cmd: '^', css: 'mje_button_sup', title: 'exponent', arialabel: 'exponent' });
          keys.push('sub'); values.push({ key: 'sub', cmd: '_', css: 'mje_button_sub', title: 'subscript', arialabel: 'subscript' });
          keys.push('( )'); values.push({ key: '( )', text: '( )', cmd: '(', title: 'parentheses', arialabel: 'parentheses' });
          keys.push('| |'); values.push({ key: '| |', text: '| |', cmd: '|', title: 'absvalue', arialabel: 'absolute value' });
          keys.push('prod'); values.push({ key: 'prod', text: '&#x3C0;', cmd: '\\pi', title: 'pi', arialabel: 'PI' });

          //functions
          keys.push('log'); values.push({ key: 'log', text: 'log', cmd: '\\log', title: 'log', arialabel: 'logarithm' });
          keys.push('ln'); values.push({ key: 'ln', text: 'ln', cmd: '\\ln', title: 'ln', arialabel: 'natural logarithm' });
          keys.push('n!'); values.push({ key: 'n!', text: '!', title: 'factorial', arialabel: 'factorial' });
          keys.push('pi'); values.push({ key: 'pi', text: '&#x3C0;', cmd: '\\pi', title: 'pi', arialabel: 'pi' });
          keys.push('abs'); values.push({ key: 'abs', text: '| |', cmd: '|', title: 'abs', arialabel: 'absolute value' });

          //trignomentry
          keys.push('sin'); values.push({ key: 'sin', text: 'sin', cmd: '\\sin', title: 'sin', arialabel: 'sine', wrapargs: 'true' });
          keys.push('cos'); values.push({ key: 'cos', text: 'cos', cmd: '\\cos', title: 'cos', arialabel: 'cosine', wrapargs: 'true' });
          keys.push('tan'); values.push({ key: 'tan', text: 'tan', cmd: '\\tan', title: 'tan', arialabel: 'tangent', wrapargs: 'true' });
          keys.push('arcsin'); values.push({ key: 'arcsin', text: 'arcsin', cmd: '\\arcsin', title: 'arcsin', arialabel: 'secant', wrapargs: 'true' });
          keys.push('arccos'); values.push({ key: 'arccos', text: 'arccos', cmd: '\\arccos', title: 'arccos', arialabel: 'cosecant', wrapargs: 'true' });
          keys.push('arctan'); values.push({ key: 'arctan', text: 'arctan', cmd: '\\arctan', title: 'arctan', arialabel: 'cotangent', wrapargs: 'true' });

          //greek symbols
          keys.push('alpha'); values.push({ key: 'alpha', text: '&#x03B1;', cmd: '\\alpha', title: 'alpha', arialabel: 'alpha' });
          keys.push('beta'); values.push({ key: 'beta', text: '&#x03B2;', cmd: '\\beta', title: 'beta', arialabel: 'beta' });
          keys.push('gamma'); values.push({ key: 'gamma', text: '&#x03B3;', cmd: '\\gamma', title: 'gamma', arialabel: 'gamma' });
          keys.push('delta'); values.push({ key: 'delta', text: '&#x03B4;', cmd: '\\delta', title: 'delta', arialabel: 'delta' });
          keys.push('epsilon'); values.push({ key: 'epsilon', text: '&#x03B5;', cmd: '\\epsilon', title: 'epsilon', arialabel: 'epsilon' });

          keys.push('zeta'); values.push({ key: 'zeta', text: '&#x03B6;', cmd: '\\zeta', title: 'zeta', arialabel: 'zeta' });
          keys.push('eta'); values.push({ key: 'eta', text: '&#x03B7;', cmd: '\\eta', title: 'eta', arialabel: 'eta' });
          keys.push('theta'); values.push({ key: 'theta', text: '&#x03B8;', cmd: '\\theta', title: 'theta', arialabel: 'theta' });
          keys.push('iota'); values.push({ key: 'iota', text: '&#x03B9;', cmd: '\\iota', title: 'iota', arialabel: 'iota' });
          keys.push('kappa'); values.push({ key: 'kappa', text: '&#x03BA;', cmd: '\\kappa', title: 'kappa', arialabel: 'kappa' });
          keys.push('lambda'); values.push({ key: 'lambda', text: '&#x03BB;', cmd: '\\lambda', title: 'lambda', arialabel: 'lambda' });

          keys.push('mu'); values.push({ key: 'mu', text: '&#x03BC;', cmd: '\\mu', title: 'mu', arialabel: 'mu' });
          keys.push('nu'); values.push({ key: 'nu', text: '&#x03BD;', cmd: '\\nu', title: 'nu', arialabel: 'nu' });
          keys.push('xi'); values.push({ key: 'xi', text: '&#x03BE;', cmd: '\\xi', title: 'xi', arialabel: 'xi' });
          ////////////// Verify with Sandeep B.            
          keys.push('omicron'); values.push({ key: 'omicron', text: '&#x03BF;', title: 'omicron', arialabel: 'omicron' });
          keys.push('rho'); values.push({ key: 'rho', text: '&#x03C1;', cmd: '\\rho', title: 'rho', arialabel: 'rho' });

          keys.push('sigma'); values.push({ key: 'sigma', text: '&#x03C3;', cmd: '\\sigma', title: 'sigma', arialabel: 'sigma' });
          keys.push('tau'); values.push({ key: 'tau', text: '&#x03C4;', cmd: '\\tau', title: 'tau', arialabel: 'tau' });
          keys.push('upsilon'); values.push({ key: 'upsilon', text: '&#x03C5;', cmd: '\\upsilon', title: 'upsilon', arialabel: 'upsilon' });
          keys.push('phi'); values.push({ key: 'phi', text: '&#x03C6;', cmd: '\\phi', title: 'phi', arialabel: 'phi' });
          keys.push('chi'); values.push({ key: 'chi', text: '&#x03C7;', cmd: '\\chi', title: 'chi', arialabel: 'chi' });
          keys.push('psi'); values.push({ key: 'psi', text: '&#x03C8;', cmd: '\\psi', title: 'psi', arialabel: 'psi' });


          keys.push('x^y'); values.push({ key: 'x^y', text: 'x^y', cmd: 'x^y', insertraw: 'true', title: 'xpowery', arialabel: 'x to the power y' });
          keys.push('x^2'); values.push({ key: 'x^2', text: 'x^2', cmd: 'x^2', insertraw: 'true', title: 'xpower2', arialabel: 'x to the power 2' });
          keys.push('x^3'); values.push({ key: 'x^3', text: 'x^3', cmd: 'x^3', insertraw: 'true', title: 'xpower3', arialabel: 'x to the power 3' });

          this.itemCollection.keys = keys;
          this.itemCollection.values = values;

          this._itemCollectioBuildComplete = true;
      },
      getItem: function (key) {
          if (!this._itemCollectioBuildComplete)
              this.buildItemCollection();

          var ind = this.itemCollection.keys.indexOf(key);
          if (ind === -1)
              return key;

          return this.itemCollection.values[ind];
      },
      ignoreKey: function (key) {
          if (!this._itemCollectioBuildComplete)
              this.buildItemCollection();

          if (this._ignoreItems.indexOf(key) === -1)
              return false;
          return true;
      },
      hasKey: function (key) {
          var ind = this.itemCollection.keys.indexOf(key);
          if (ind === -1)
              return false;
          return true;
      }

  };
  MathEditorContent.Config.EquationAdapter = {
      _translator: MathEditorContent.Config.Translator,
      _PLACEHOLDER: '&##&',
      _FORMATTER: '\r\n',
      _Empty: '',      
      convertToDesmosXml: function (xml) {
          return this._parser(xml);
      },
      getTabXml: function (key) {
          var tab = MathEditorContent.Config.Tabs[key];
          return '<tab title="' + tab.title + '">' + this._FORMATTER + this._rowsToXml(tab.rows) + this._FORMATTER + '</tab>';
      },
      getRowXml: function (key) {
          var row = MathEditorContent.Config.Rows[key];
          return this._rowsToXml([row]);
      },
      getItemXml: function (key) {
          if (this._translator.ignoreKey(key)) {
              return this._Empty;
          }

          var item = this._getItem(key);
          return this._toItemXml(item);
      },
      hasKey: function (key) {
          return this._translator.hasKey(key);
      },
      _getItem: function (key) {
          var item = this._translator.getItem(key);
          if (item === key) //base item
              item = { key: key, title: key, arialabel: key, text: key, css: 'mje_button_variable' };
          return item;
      },
      _parser: function (xml) {
          //create xmldocument
          var xmlDoc = null, xmlSerializer= new XMLSerializer();
          if (window.DOMParser) {
              var parser = new DOMParser();
              xmlDoc = parser.parseFromString(xml, "text/xml");
          }
          else // Internet Explorer
          {
              xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
              xmlDoc.async = false;
              xmlDoc.loadXML(xml);
          }
          var node = xmlDoc.childNodes[0]; //root

          var desmosXml = '';

          //build answerboxes or editorRows and labels
          var mathml = $(node).find('editorconfig mathML'),//node.getElementsByTagName("mathML"),
              labels = $(node).find('editorconfig editorLabels')/*node.getElementsByTagName("editorLabels")*/, lblen = labels.length;
          for (var i = 0; i < mathml.length; i++) {              
              //labels = node.getElementsByTagName("editorLabels"),
              // desmosXml += '<editorRow>' + (i < lblen ? labels[i].textContent + '\\MathQuillMathField{}</editorRow>' : '\\MathQuillMathField{}</editorRow>');
              //<math xmlns="http://www.w3.org/1998/Math/MathML" title=""><mstyle><mo/></mstyle></math>
              desmosXml += '<editorRow>' + '<editorLabels>' + (i < lblen ? labels[i].textContent : '') + '</editorLabels>' + xmlSerializer.serializeToString(mathml[i].firstChild) + '</editorRow>';
          }          

          //get tabcontent from the content.js
          var tabContent = MathEditorContent.Config.Tabs;

          //build keypad or tabConfig
          var keypad = '';
          var tabConfigEl = $(node).find('editorconfig tabConfig');//node.getElementsByTagName("tabConfig"); //collect tabConfigs    
          if (tabConfigEl.length > 0) {
              var tabStr = '';
              var orders = $(tabConfigEl[0]).find('Order');//tabConfigEl[0].getElementsByTagName("Order"); //collect orders
              //console.log('$$ num of tabs: ' + orders.length);

              //process orders
              for (i = 0, len = orders.length; i < len; i++) {
                  var tName = orders[i].firstChild.nodeValue;
                  tabStr = '<tab title="' + tName + '" >' + this._FORMATTER + this._PLACEHOLDER + '</tab>';
                  var rows = [];
                  //console.log('$$ process tab: ' + tName);
                  var tab = $(tabConfigEl[0]).find(tName);//tabConfigEl[0].getElementsByTagName(tName);
                  if (tab.length > 0) {
                      //build custom rows
                      var rowEls = $(tab[0]).find('rows');//tab[0].getElementsByTagName('rows');
                      for (var j = 0, elLen = rowEls.length; j < elLen; j++) {
                          var r = { title: '', type: '', items: [] };
                          for (var k = 0, plen = rowEls[j].childNodes.length; k < plen; k++) {
                              if (rowEls[j].childNodes[k].nodeName === 'title') {
                                  r.title = rowEls[j].childNodes[k].firstChild.nodeValue;
                              } else if (rowEls[j].childNodes[k].nodeName === 'type') {
                                  r.type = rowEls[j].childNodes[k].firstChild.nodeValue;
                              } else if (rowEls[j].childNodes[k].nodeName === 'items') {
                                  if (rowEls[j].childNodes[k].childNodes.length > 1) { //handle parsed items 
                                      var itObj = {};
                                      $.each(rowEls[j].childNodes[k].childNodes, function(idx) {
                                          if (rowEls[j].childNodes[k].childNodes[idx].nodeName === 'isparsed') {
                                              itObj.isParsed = rowEls[j].childNodes[k].childNodes[idx].firstChild.nodeValue;
                                          } else if (rowEls[j].childNodes[k].childNodes[idx].nodeName === 'key') {
                                              itObj.key = rowEls[j].childNodes[k].childNodes[idx].textContent;
                                              itObj.arialabel = rowEls[j].childNodes[k].childNodes[idx].firstChild.nodeValue;
                                          } else if (rowEls[j].childNodes[k].childNodes[idx].nodeName === 'text' && rowEls[j].childNodes[k].childNodes[idx].firstChild != null) {
                                              itObj.text = rowEls[j].childNodes[k].childNodes[idx].firstChild.nodeValue;
                                          } else if (rowEls[j].childNodes[k].childNodes[idx].nodeName === 'value' && rowEls[j].childNodes[k].childNodes[idx].firstChild != null) {
                                              itObj.value = rowEls[j].childNodes[k].childNodes[idx].firstChild.nodeValue;
                                          } else if (rowEls[j].childNodes[k].childNodes[idx].nodeName === 'css' && rowEls[j].childNodes[k].childNodes[idx].firstChild != null) {
                                              itObj.css = rowEls[j].childNodes[k].childNodes[idx].firstChild.nodeValue;
                                          }
                                      });
                                      r.items.push(itObj);
                                  ////0 is key, 1 is text, 2 is value, 3 is isParsed
                                  } else {
                                      r.items.push(rowEls[j].childNodes[k].firstChild.nodeValue);
                                  }
                              }
                          }
                          rows.push(r);
                      }
                  } else {
                      //build rows from content config
                      try {
                          rows = tabContent[tName].rows;
                      } catch (e) {
                          console.log('$$$$$$ row configuration not found.');
                          continue;
                      }                       
                  }

                  tabStr = tabStr.replace(this._PLACEHOLDER, this._rowsToXml(rows));
                  keypad += tabStr + this._FORMATTER;
              }
          }

          desmosXml = '<editorconfig>' + desmosXml + '<tabConfig>' + this._FORMATTER + keypad + '</tabConfig>' + '</editorconfig>';
          //return converted desmos xml
          return desmosXml;

      },
      _rowsToXml: function (rows) {
          var keypad = '';
          for (var j = 0, rlen = rows.length; j < rlen; j++) {
              var r = rows[j];

              //check type attr (text)
              if (r.type === "grid" || r.type === "numpad") {
                  //grid
                  keypad += '<grid cols="3" title="' + r.title + '">' + this._PLACEHOLDER + '</grid>' + this._FORMATTER;
              } else {
                  //row
                  keypad += '<row title="' + r.title + '">' + this._PLACEHOLDER + '</row>' + this._FORMATTER;
              }

              //process items attr (array)                    
              var items = r.items;
              var itemStr = '';
              for (var k = 0, ilen = items.length; k < ilen; k++) {
                  if (typeof items[k] === "object") {
                      if (typeof items[k].isParsed != "undefined" && items[k].isParsed) //custom buttom
                      {
                          itemStr += this._toItemXml({ key: items[k].key, title: items[k].key, arialabel: items[k].key, text: items[k].text, css: 'mje_button_variable' });
                      } else if (items[k].key == '*' && items[k].css) {
                          itemStr += this.getItemXml(items[k].css);
                      }
                      else {
                          itemStr += this.getItemXml(items[k].key);
                      }
                  }
                  else
                      itemStr += this.getItemXml(items[k]);
              }
              keypad = keypad.replace(this._PLACEHOLDER, this._FORMATTER + itemStr);
          } //close rows
          return keypad;
      },
      _toItemXml: function (item) { //builder
          var xmlVal = '<item title="' + item.title + '" aria-label="' + item.arialabel + '" ';
          if (typeof item.cmd != "undefined")
              xmlVal += 'cmd="' + item.cmd + '" ';

          if (typeof item.css != "undefined")
              xmlVal += 'class="' + item.css + '" ';

          if (typeof item.insertraw != "undefined")
              xmlVal += 'insert-raw="' + item.insertraw + '" ';

          if (typeof item.wrapargs != "undefined")
              xmlVal += 'wrap-args="' + item.wrapargs + '" ';

          if (typeof item.text != "undefined")
              xmlVal += '>' + item.text + '';
          else
              xmlVal += '>';

          xmlVal += '</item>' + this._FORMATTER;
          return xmlVal;

      }
  };
    //preview formatter obj
    MathEditorContent.Config.PreviewFormatter = {
        getPreviewXmlDoc: function (configXml) {
            var MATHQUILL_PLACEHOLDER_TAG = '##';
            var newXmlDoc = $.parseXML(configXml);
            var cdotRows = $(newXmlDoc).find("item[title='cdot']").each(function () {
                if (!$(this).attr('class')) {
                    $(this).text('∙');
                    $(this).attr('class', 'mje_button_dot');
                }
            });
            var rows = $(newXmlDoc).find('editorconfig editorRow');//newXmlDoc.getElementsByTagName('editorRow');
            for (var i = 0, len = rows.length; i < len; i++) {
                var mathml = $(rows[i]).find('math')//rows[i].getElementsByTagName("math")
                    , latexCmd = '';                
                if (mathml.length > 0) {                    
                    latexCmd = window.MathEditorWidget.convertMathMlToLatex(mathml[0]);
                    if (latexCmd.indexOf(MATHQUILL_PLACEHOLDER_TAG) != -1) {
                        latexCmd = latexCmd.replace(/##/g, "\\MathQuillMathField{}");//window.EquationReviewWidget.MATHQUILL_PLACEHOLDER_TAG
                    } else {
                        //latexCmd = "\\MathQuillMathField{" + latexCmd + "}";
                    }
                } else {
                    //latexCmd = "\\MathQuillMathField{}";
                }

              //find editorlabels for backward compatibility
              var labels = $(rows[i]).find('editorLabels')
                  , labelVal = (labels.length > 0 ? labels[0].textContent : '');
              labelVal = labelVal.replace(/ /g, '\\space ');
              if (labelVal != '') rows[i].textContent = labelVal + '\\MathQuillMathField{}';
              else rows[i].textContent = labelVal + latexCmd;
          }
          return newXmlDoc;
      }
  };

})();
