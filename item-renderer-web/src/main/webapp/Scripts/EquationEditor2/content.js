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
if(!window.MathJax){return;}
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

    /***************************************************************/
    //LPN specific math symbols configuration 
    /***********************************************************/
  var numbers_utahlpn1 = {
      title: 'Numbers',
      type: 'grid',
      cols: 3,
      items: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '.'
    , { key: 'n!', value: '\\PH!', text: 'n!' }]
  };

  var row1_utahlpn1 = {
      title: 'Other',
      type: 'row',
      items: [
       'div',
       'ne', 'lt', 'le', '=', 'ge', 'gt',
       { key: 'pm', value: '\pm', text: eval('"\\u00b1"') },
       { key: 'infty', value: '\infty', text: eval('"\\u221e"') }
      ]
  };

  var row2_utahlpn1 = {
      title: 'Other',
      type: 'row',
      items: [
       'times',
        { key: '( )', value: '(\\PH)' },
        { key: 'abs', value: '\\lvert\\PH\\rvert', text: '| |' },
        { key: 'sub', value: '\\PH_\\PH' },
        { key: 'sup', value: '\\PH^\\PH' }
      ]
  };


  var row3_utahlpn1 = {
      title: 'Other',
      type: 'row',
      items: [
        '-',
        { key: 'fraction', value: '\\frac{\\PH}{\\PH}' },
        { key: 'sqrt', value: '\\sqrt{\\PH}' },
        { key: 'nrt', value: '\\sqrt[\\PH]{\\PH}' },
        { key: 'sum', value: '\sum', text: eval('"\\u2211"') },
        { key: 'intV', value: '\\int_\\PH^\\PH \\PH', css: 'mathjax_editor_button_intergal_vals', text: eval('"\\u222B"') }
      ]
  };

  var row4_utahlpn1 = {
      title: 'Other',
      type: 'row',
      items: [
        '+',
        'sin',
        'cos',
        'tan',
        'arcsin',
        'arccos',
        'arctan', 'ln', 'log'
      ]
  };


  var greek_utahlpn1 = {
      title: 'Greek',
      type: 'grid',
      cols: 8,
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

  MathJax.Editor.Config.Common = [
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
  
  MathJax.Editor.Config.Rows = {
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
  MathJax.Editor.Config.Tabs = {
      Order: ['Numbers', 'Basic', 'Algebra', 'Calculus', 'SBAC3', 'SBAC4', 'SBAC5', 'SBAC6', 'SBAC7', 'SBAC8', 'SBAC9', 'SBAC10', 'SBAC11', 'Utah3', 'Utah4', 'Utah5', 'Utah6', 'Utah7', 'Utah8', 'UtahSM1', 'UtahSM2', 'UtahSM3', 'UtahLPN1', 'UtahLPN2'],
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
    },
    UtahLPN1: {
        title: 'Math',
        rows: [numbers_utahlpn1, row1_utahlpn1, row2_utahlpn1, row3_utahlpn1, row4_utahlpn1]
    },
    UtahLPN2: {
        title: 'Greek Alphabet',
        rows: [greek_utahlpn1]
    }

  };
})();
