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
