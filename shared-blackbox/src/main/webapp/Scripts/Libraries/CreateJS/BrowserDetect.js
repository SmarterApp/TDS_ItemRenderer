
var BrowserDetect ={};
 (function(){
    var platform = navigator.platform.toLowerCase();
    var ua = navigator.userAgent.toLowerCase();
	this.getAudioType = function(){   
	var os; 
	if (platform.indexOf("mac") != -1){
		os = "mac";
	} else if (platform.indexOf("win") != -1){
		os = "win";
	}
	else if(platform.indexOf("android") != -1){
	    os = "android";
	}
	else if(platform.indexOf("ipad") != -1||platform.indexOf("iphone") != -1){
	    os = "ios";
	} 
	else if(platform.indexOf("linux") != -1){
	    os = "linux";
	}
	
	switch (os){
		case "mac":
			if (ua.indexOf("airsecurebrowser") != -1){
				return "ogg";
			}
			else if(ua.indexOf("firefox") != -1){
			    return "ogg";
			}
			else if (ua.indexOf('safari')!=-1){
			    return "mp4";
			}
			break;
		case "win":
		    if (ua.indexOf('airsecurebrowser')!=-1){
		       return "ogg";
	        } else if (ua.indexOf('firefox')!=-1){
			   return "ogg";
			} else if(ua.indexOf('chrome')!=-1){
			   return "ogg";
			} else if (ua.indexOf('safari')!=-1){
			   return "mp4";
			} else if(ua.indexOf('msie')!=-1){
			   return "mp4";
			}
		    break;
        case "android":
             return "ogg";
        case "ios":
		     return "mp4";
	    case "linux":
			return "ogg";
		case "unix":
		    return "ogg";
		default:
		    return "ogg";
	}  
}

}).apply(BrowserDetect);