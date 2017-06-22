//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
//	Custom plugin called to fix indent bug SB-451
// 	October 15,2014
//	NOTE: plugin does not change ul button types on indent (it keeps same image throughout list)
( function () {

    var pluginName = 'customindent';
	
	CKEDITOR.plugins.add(pluginName, {
		requires: 'indent,indentlist',
		init: function(editor) {
			//Add Key press functionality to editor for tabbing
			editor.on('key', function(e){
	        	
	            if(e.data.keyCode==9){
	            	if (editor.elementPath().contains('p') && !editor.elementPath().contains('li')){
	            		//
	            		editor.execCommand('indent');
	            	}
	            	else if (editor.elementPath().contains('li')){
	            		editor.execCommand('indentlist');
	            	}
	            }
	            
	            //add outindent functionality for SHIFT+TAB
	            if (e.data.keyCode ==9 + CKEDITOR.SHIFT ){
	            	
	            	//check if the current context is within a paragraph
	            	if (editor.elementPath().contains('p') && !editor.elementPath().contains('li')){
	            		//
	            		editor.execCommand('outdent');
	            	}
	            	else if (editor.elementPath().contains('li')){
	            		editor.execCommand('outdentlist');
	            	}
	            }
	         });
			
		}
	});

})();
