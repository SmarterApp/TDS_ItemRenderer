/////////////////////////////////////////////////
/////////////////////////////////////////////////
//
// Basic JavaScript File and Directory IO module
// By: MonkeeSage, v0.1
// See: http://kb.mozillazine.org/Dev_:_Extensions_:_Example_Code_:_File_IO_:_jsio
/////////////////////////////////////////////////
/////////////////////////////////////////////////


if (typeof (JSIO) != 'boolean' && typeof (Components) == 'object' && typeof (Components.interfaces) == 'object') {   // the last 2 checks are to make sure that we are using a mozilla based browser

	var JSIO = true;

	/////////////////////////////////////////////////
	// Basic file IO object based on Mozilla source 
	// code post at forums.mozillazine.org
	/////////////////////////////////////////////////

	// Example use:
	// var fileIn = FileIO.open('/test.txt');
	// if (fileIn.exists()) {
	// 	var fileOut = FileIO.open('/copy of test.txt');
	// 	var str = FileIO.read(fileIn);
	// 	var rv = FileIO.write(fileOut, str);
	// 	alert('File write: ' + rv);
	// 	rv = FileIO.write(fileOut, str, 'a');
	// 	alert('File append: ' + rv);
	// 	rv = FileIO.unlink(fileOut);
	// 	alert('File unlink: ' + rv);
	// }

	var FileIO = {

		localfileCID  : '@mozilla.org/file/local;1',
		localfileIID  : Components.interfaces.nsILocalFile,

		finstreamCID  : '@mozilla.org/network/file-input-stream;1',
		finstreamIID  : Components.interfaces.nsIFileInputStream,

		foutstreamCID : '@mozilla.org/network/file-output-stream;1',
		foutstreamIID : Components.interfaces.nsIFileOutputStream,

		sinstreamCID  : '@mozilla.org/scriptableinputstream;1',
		sinstreamIID  : Components.interfaces.nsIScriptableInputStream,

		suniconvCID   : '@mozilla.org/intl/scriptableunicodeconverter',
		suniconvIID   : Components.interfaces.nsIScriptableUnicodeConverter,

		open   : function(path) {
			try {
				var file = Components.classes[this.localfileCID]
								.createInstance(this.localfileIID);
				file.initWithPath(path);
				return file;
			}
			catch(e) {
				return false;
			}
		},

		read   : function(file, charset) {
			try {
				var data     = new String();
				var fiStream = Components.classes[this.finstreamCID]
									.createInstance(this.finstreamIID);
				var siStream = Components.classes[this.sinstreamCID]
									.createInstance(this.sinstreamIID);
				fiStream.init(file, 1, 0, false);
				siStream.init(fiStream);
				data += siStream.read(-1);
				siStream.close();
				fiStream.close();
				if (charset) {
					data = this.toUnicode(charset, data);
				}
				return data;
			} 
			catch(e) {
				return false;
			}
		},

		write  : function(file, data, mode, charset) {
			try {
				var foStream = Components.classes[this.foutstreamCID]
									.createInstance(this.foutstreamIID);
				if (charset) {
					data = this.fromUnicode(charset, data);
				}
				var flags = 0x02 | 0x08 | 0x20; // wronly | create | truncate
				if (mode == 'a') {
					flags = 0x02 | 0x10; // wronly | append
				}
				foStream.init(file, flags, 0664, 0);
				foStream.write(data, data.length);
				//foStream.flush();
				foStream.close();
				return true;
			}
			catch(e) {
				return false;
			}
		},

		create : function(file) {
			try {
				file.create(0x00, 0664);
				return true;
			}
			catch(e) {
				return false;
			}
		},

		unlink : function(file) {
			try {
				file.remove(false);
				return true;
			}
			catch(e) {
				return false;
			}
		},

		path   : function(file) {
			try {
				return 'file:///' + file.path.replace(/\\/g, '\/')
							.replace(/^\s*\/?/, '').replace(/\ /g, '%20');
			}
			catch(e) {
				return false;
			}
		},

		toUnicode   : function(charset, data) {
			try{
				var uniConv = Components.classes[this.suniconvCID]
									.createInstance(this.suniconvIID);
				uniConv.charset = charset;
				data = uniConv.ConvertToUnicode(data);
			} 
			catch(e) {
				// foobar!
			}
			return data;
		},

		fromUnicode : function(charset, data) {
			try {
				var uniConv = Components.classes[this.suniconvCID]
									.createInstance(this.suniconvIID);
				uniConv.charset = charset;
				data = uniConv.ConvertFromUnicode(data);
				// data += uniConv.Finish();
			}
			catch(e) {
				// foobar!
			}
			return data;
		},

		writeToFile: function (outputData, outputFileName) {
            // open the file
            var outputFile = this.open(outputFileName);
            if (!outputFile || !outputFile.exists()) {
                // file does not exist, create the file
                this.create(outputFile);
                // write audio data to file
                this.write(outputFile, outputData);
            } else {
                // write audio data to file
                this.write(outputFile, outputData);
            }
		},

		readFromFile: function (inputFileName) {
		    // open the file
		    var inputFile = this.open(inputFileName);
		    if (!inputFile || !inputFile.exists()) {
		        return null;
		    }

		    return this.read(inputFile);
		}

	}


	/////////////////////////////////////////////////
	// Basic Directory IO object based on JSLib 
	// source code found at jslib.mozdev.org
	/////////////////////////////////////////////////

	// Example use:
	// var dir = DirIO.open('/test');
	// if (dir.exists()) {
	// 	alert(DirIO.path(dir));
	// 	var arr = DirIO.read(dir, true), i;
	// 	if (arr) {
	// 		for (i = 0; i < arr.length; ++i) {
	// 			alert(arr[i].path);
	// 		}
	// 	}
	// }
	// else {
	// 	var rv = DirIO.create(dir);
	// 	alert('Directory create: ' + rv);
	// }

	// ---------------------------------------------
	// ----------------- Nota Bene -----------------
	// ---------------------------------------------
	// Some possible types for get are:
	// 	'ProfD'				= profile
	// 	'DefProfRt'			= user (e.g., /root/.mozilla)
	// 	'UChrm'				= %profile%/chrome
	// 	'DefRt'				= installation
	// 	'PrfDef'				= %installation%/defaults/pref
	// 	'ProfDefNoLoc'		= %installation%/defaults/profile
	// 	'APlugns'			= %installation%/plugins
	// 	'AChrom'				= %installation%/chrome
	// 	'ComsD'				= %installation%/components
	// 	'CurProcD'			= installation (usually)
	// 	'Home'				= OS root (e.g., /root)
	// 	'TmpD'				= OS tmp (e.g., /tmp)

	var DirIO = {

		sep        : '/',

		dirservCID : '@mozilla.org/file/directory_service;1',
	
		propsIID   : Components.interfaces.nsIProperties,
	
		fileIID    : Components.interfaces.nsIFile,

		get    : function(type) {
			try {
				var dir = Components.classes[this.dirservCID]
								.createInstance(this.propsIID)
								.get(type, this.fileIID);
				return dir;
			}
			catch(e) {
				return false;
			}
		},

		open   : function(path) {
			return FileIO.open(path);
		},

		create : function(dir) {
			try {
				dir.create(0x01, 0755);                //Balaji - changed to make is rwxr_xr_x
				return true;
			}
			catch(e) {
				return false;
			}
		},
        
        /*
         // SB07202010 error in this logic. nuking it.
        _read  : function(dirEntry, recursive) {
			var list = new Array();
			try {
				while (dirEntry.hasMoreElements()) {
					list.push(dirEntry.getNext()
									.QueryInterface(FileIO.localfileIID));
				}
				if (recursive) {
					var list2 = new Array();
					for (var i = 0; i < list.length; ++i) {
						if (list[i].isDirectory()) {
							files = list[i].directoryEntries;
							list2 = this._read(files, recursive);
						}
					}
					for (i = 0; i < list2.length; ++i) {
						list.push(list2[i]);
					}
				}
			}
			catch(e) {
			   // foobar!
			}
			return list;
		},
        */
         
		read   : function(dir, recursive) {
		    /*
		     * @param dir is an nsiFile interface
		     */
		    var addAll = function(targetList, sourceList)
		    {
		        if (targetList != null && sourceList != null)
		        {
		            for(var counter1 = 0; counter1 < sourceList.length; ++counter1)
		            {
		                targetList.push(sourceList[counter1]);
		            }
		        }
		        return targetList;
		        
		    }
		    
		    var list = [];
		    if (dir.isDirectory())
		    {
		        var directoryEntries = dir.directoryEntries;
		        while(directoryEntries.hasMoreElements())
                {
                
                    var nextEntry = directoryEntries.getNext().QueryInterface(Components.interfaces.nsILocalFile);
                    list.push(nextEntry.path);
                    if (recursive)
	                {
                        var listOfNewChildren = DirIO.read(nextEntry, recursive);
                        addAll(list, listOfNewChildren);
	                }
                }
            }
            return list; 	              
	    },

		unlink : function(dir, recursive) {
			try {
				if (recursive == null) {
					recursive = false;
				}
				dir.remove(recursive);
				return true;
			}
			catch(e) {
				return false;
			}
		},

		path   : function (dir) {
			return FileIO.path(dir);
		},

		split  : function(str, join) {
			var arr = str.split(/\/|\\/), i;
			str = new String();
			for (i = 0; i < arr.length; ++i) {
				str += arr[i] + ((i != arr.length - 1) ? 
										join : '');
			}
			return str;
		},

		join   : function(str, split) {
			var arr = str.split(split), i;
			str = new String();
			for (i = 0; i < arr.length; ++i) {
				str += arr[i] + ((i != arr.length - 1) ? 
										this.sep : '');
			}
			return str;
		}
	
	}

	if (navigator.platform.toLowerCase().indexOf('win') > -1) {
		DirIO.sep = '\\';
	}

}
