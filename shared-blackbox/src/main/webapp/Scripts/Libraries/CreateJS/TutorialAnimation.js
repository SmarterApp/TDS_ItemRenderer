/************** TutorialAnimation.js version July-20-2014 ****************/
var canvas, stage, exportRoot;
var mp4Data;
var oggData;
var soundClip;
var oggData;
var DEFAULT_WIDTH= 600;
var DEFAULT_HEIGHT = 400;
var newWidth;
var newHeight;  
var widthRatio;
var heightRatio;
var resizeRatio; 	
var controlAnimation;
var config;
var finalWidth;
var finalHeight;
var setMedia;
var checksetMedia;
var tutorialAnim;
var totalAnimFrame;
var scrubberMaxWidth =440;
var START_SCRUBBER_X=145;
var addBarWidth=45;
var baseWidthOrigin=540;
var baseScrubberMax;
var scrubberStep;
var START_SCRUBBER_X=100;
var baseBarX=100;
var scrubberPlayHead;
var btnPause;
var btnPlay;
var btnMute;
var btnUnMute;
var btnRewind;
var lowerBound;
var myAudio;
var newPos;
var offset;
var trackBarClip;
var baseBarClip;
var isPlaying;
var source;
var position;
var startTime;
var myAudioContext;
var myAudioBuffer;
var gainNode;
var contentVersion;
var position=0;
var soundSource;
var startTime;
var myAudioContext,myAudioBuffer;
var soundDuration;
var androidVersion = ["4.2","4.2.1","4.2.2","4.3","4.3.2","4.4","4.4.1","4.4.2"];
var platform = navigator.platform.toLowerCase();
var touchDevice;
function init() {
	canvas = document.getElementById("canvas");
	tutorialAnim = new lib.Animation();
	exportRoot = tutorialAnim.tutorialTimelineAnimation;	
	stage = new createjs.Stage(canvas);
	stage.autoClear = true;
	controlAnimation= new tutorialShellLib.TimelineController();
    if(exportRoot == undefined){
	     exportRoot = new lib.Animation();
	      stage.addChild(exportRoot);
	}	
	else{
	   stage.addChild(tutorialAnim);
	}
		
	stage.addChild(controlAnimation); 
	 
	btnPause = controlAnimation.controlBar.btnPause;
	btnPlay = controlAnimation.controlBar.btnPlay;
	btnMute = controlAnimation.controlBar.btnMute;
	btnUnMute = controlAnimation.controlBar.btnUnmute;
	btnRewind = controlAnimation.controlBar.btnRewind;	
	trackBarClip =controlAnimation.controlBar.trackBar;
	baseBarClip = controlAnimation.controlBar.baseBar;	
    checkAnimationVersion();		
    resizeAnimation();     
	totalAnimFrame = exportRoot.timeline.duration-1;	
	scrubberStep = scrubberMaxWidth/totalAnimFrame;  
	scrubberPlayHead = controlAnimation.controlBar.playHeadButton;
	
	controlScrubber();	
	scrubberPlayHead.addEventListener("tick",listenTimeline);
	 touchDevice=(window.hasOwnProperty('ontouchstart'));
	 var UAString = navigator.userAgent;
	 
	  if(platform.indexOf("win")> -1){
	            console.log("this is windows");
	            console.log("using window 8 IE 10" +UAString); 
	          if (UAString.indexOf("Trident") !== -1 && UAString.indexOf("rv:11") !== -1 && !touchDevice ){  
                    console.log("using window 8 IE 10" +navigator.appName +"/" +navigator.appVersion);  
                   
               }

               else{
                   if (createjs.Touch.isSupported()){
	                  createjs.Touch.enable(stage);
                      stage._handleMouseDown = function(e) {
                      this._handlePointerDown(-1, e, e.pageX, e.pageY);
                      };
            
                     }
                  
               }
	       
	       }
	        else{
	             if (createjs.Touch.isSupported()){
	                  createjs.Touch.enable(stage);
                      stage._handleMouseDown = function(e) {
                      this._handlePointerDown(-1, e, e.pageX, e.pageY);
                      };
            
                     }
	        
	        }
	 
	
        
       stage.enableDOMEvents(true);
       
          // enabled mouse over / out events
         stage.enableMouseOver(50);     
       
          
    var newContentVersion;
          if(controlAnimation.contentVersion !=undefined){
              contentVersion= controlAnimation.contentVersion.text;
          }

          
          if(contentVersion==null||contentVersion==undefined){
              contentVersion = null;
              newContentVersion="1";
          }
          else{
              newContentVersion = contentVersion;
          }
          var controlVersionClip= controlAnimation.controlBar.versionControl;
           console.log(controlVersionClip.getNumChildren());
          for(var i=0; i<controlVersionClip.getNumChildren();i++){

              var contentV = controlVersionClip["contentVersion"+i];
                  contentV.visible=false;

          }
          //console.log("newContentVersion  "+newContentVersion);
          var newContentVersion=controlVersionClip["contentVersion"+newContentVersion];
          newContentVersion.visible=true;
         
       if(platform.indexOf("ipad")> -1){
              //console.log("using device"+ navigator.platform);
             pauseIpadAnimation();
            
          }
	stage.update();
	createjs.Ticker.setFPS(18);
	createjs.Ticker.addEventListener("tick", stage);	
}


function controlScrubber(){
   scrubberPlayHead.addEventListener("mousedown",function(evt){  
      pauseAnimation();
        btnPause.visible=false;
        btnPlay.visible=true;
		isPLaying=true;
		var newPos;
		//var offset = scrubberPlayHead.globalToLocal(evt.stageX,evt.stageY);
        var offset = {x:evt.target.x-evt.stageX};
         evt.addEventListener("mousemove",function(ev) {
		    isPLaying = false;
            ev.target.x = ev.stageX+offset.x;			
             scrubberPlayHead.x = ev.target.x;    
            //console.log("scrubberPlayHead.x "+scrubberPlayHead.x);
            if (ev.target.x >baseScrubberMax) {			
                ev.target.x =baseScrubberMax;
                exportRoot.stop();            }
            else if (ev.target.x <START_SCRUBBER_X) {
                ev.target.x = START_SCRUBBER_X;
				 trackBarClip.scaleX=ev.target.x-START_SCRUBBER_X;
                newPos=0;				
            }
			else{  			 
			   trackBarClip.scaleX=ev.target.x-START_SCRUBBER_X;
			   var pos = (ev.target.x/scrubberMaxWidth)-lowerBound; 
			   newPos= Math.ceil(pos*totalAnimFrame);	
              //console.log("newMousePost "+newPos);		   
			 }
             exportRoot.gotoAndStop(newPos);     		      
        });
       evt.addEventListener("mouseup",function(ev) {             		
		    var pos = (ev.target.x/scrubberMaxWidth)-lowerBound; 
             //console.log(pos +"/ evt.target.x "+ev.target.x);	
              newPos= Math.ceil(pos*totalAnimFrame);			 
            isPLaying=true;		
            
            if(config.hasSound){		
                  if(platform.indexOf("ipad")> -1){
				     if('webkitAudioContext' in window){
                      position = pos * parseInt(myAudioBuffer.duration);
                      //console.log("position "+position);
                      playTimelineAnimation(position);
                     }
				  }			
                 
                 else{			     
					   if(soundClip.duration == 'Infinity'){
						  if (soundDuration != undefined) {
                                soundClip.currentTime = pos * parseInt(soundDuration);								
                           } else {                              
                                soundClip.currentTime = pos * parseInt(soundClip.duration);
                            }
					   }
					   else{
						   soundClip.currentTime = pos * parseInt(soundClip.duration);
					   }
                       soundClip.play();
                 }            
               //console.log("soundClip.duration "+soundClip.duration);				 
            }
            
            btnPause.visible=true;
            btnPlay.visible=false;	
             //console.log("exportRoot.currentFrame "+ exportRoot.currentFrame );			
			exportRoot.play();
			scrubberPlayHead.addEventListener("tick",listenTimeline);
			stage.update(); 		
		    createjs.Ticker.addEventListener("tick", stage);				   
        });
    });
}

function listenTimeline(){
     //console.log("exportRoot.currentFrame "+exportRoot.currentFrame + "/" +totalAnimFrame);
	 var positionHeadX=scrubberStep * exportRoot.currentFrame;
	 scrubberPlayHead.x = START_SCRUBBER_X +positionHeadX;
	 trackBarClip.scaleX=positionHeadX;			 
    if(exportRoot.currentFrame==totalAnimFrame){	 	
	    //console.log("totalAnimFrame "+totalAnimFrame);
		 stopAnimation();		 
       }
}

function checkAnimationVersion(){
 if(checksetMedia==false){
   config = new getAnimationConfig();
   if(config.hasSound){
       if ('webkitAudioContext' in window) {
	               if(platform.indexOf("ipad")> -1){   
	                  myAudioContext = new webkitAudioContext();
                      var arrayBuff = Base64Binary.decodeArrayBuffer(mp4Data);
                      myAudioContext.decodeAudioData( arrayBuff, function( audioData ) {
                      myAudioBuffer = audioData;
          				connectSoundSource(myAudioContext,myAudioBuffer);
                       } );
			    }
        }
   }
    checkAudio(config);

	if (config.hasControlBar){		
	  controlAnimation.visible=true; 	
      controlAnimation.controlBar.btnPause.addEventListener("click", pauseAnimation);
      controlAnimation.controlBar.btnPlay.addEventListener("click", playTimelineAnimation);
      controlAnimation.controlBar.btnMute.addEventListener("click", mute);
	  controlAnimation.controlBar.btnUnmute.addEventListener("click", unMute);
      controlAnimation.controlBar.btnRewind.addEventListener("click", rewind);	
	} else {	
	  controlAnimation.visible=false;	  
	}		 
 }
 
}

function connectSoundSource(myAudioContext,myAudioBuffer){
    myAudioContext =myAudioContext;
    myAudioBuffer =myAudioBuffer;
}

function playTimelineAnimation(){
   if(exportRoot.currentFrame==totalAnimFrame){
              exportRoot.gotoAndPlay(0);
              if(config.hasSound){
			      if(platform.indexOf("ipad")> -1){
				       if('webkitAudioContext' in window){
                            resumeSoundAnimation(0);
                      }
				  }
                  else{
                      soundClip.load();
                      soundClip.play();
                  }
              }           
          }
          else{
              exportRoot.play();
              resumeSoundAnimation(position);
          }
          btnPlay.visible=false;
          btnPause.visible=true;
          scrubberPlayHead.addEventListener("tick",listenTimeline);
          stage.update();
          createjs.Ticker.addEventListener("tick", stage);
}

function resumeSoundAnimation(post){

          if(config.hasSound){
		     if(platform.indexOf("ipad")> -1){
		         if('webkitAudioContext' in window){
                 connectAudio();
                 position = typeof post === 'number' ? post : position || 0;
                 startTime = myAudioContext.currentTime - ( position || 0 );
                 soundSource.start(myAudioContext.currentTime, position);
                 isPlaying = true;
                 }
		     }   
              else{
                 soundClip.play();
             }

          }
}


function checkAudio(sound){

          if(sound.hasSound){
		     //console.log("tutorial has sound");
             soundClip= document.getElementById("mySound"); 
			 var soundType=getAudioFormat();
             //console.log("soundType "+soundType);
			 if(platform.indexOf("ipad")> -1){
			       if ('webkitAudioContext' in window) {
                     //playTimelineAnimation(0);
                   }
			 }
              
              else{
                  
                  if(soundType == "ogg"){
                      soundClip.src ="data:audio/ogg;base64," + oggData;
                  } else if (soundType == "mp4"){
                      soundClip.src = "data:audio/mp4;base64,"+ mp4Data;
                  }
                   
                  soundClip.load();
                  if(soundDuration !=undefined){
                      soundClip.duration = soundDuration;
                  }
                  soundClip.addEventListener("loadedmetadata",loadSound);
        
              }
              baseBarClip.scaleX = this.scrubberMaxWidth;
              baseScrubberMax = this.baseWidthOrigin;
              scrubberMaxWidth = 440;
          }
          else{
              
              baseBarClip.scaleX = scrubberMaxWidth + addBarWidth;
              baseScrubberMax = baseWidthOrigin+ addBarWidth;
              scrubberMaxWidth = baseScrubberMax-100;
              btnMute.visible=false;
              btnUnMute.visible=false;             
          }
          lowerBound=baseBarX/scrubberMaxWidth;
          scrubberStep = scrubberMaxWidth/totalAnimFrame;
      }
      
      function connectAudio(){
          if(isPlaying){
             pauseAnimation();
          }
           connectSoundSource();
          soundSource =  myAudioContext.createBufferSource();
          //console.log("myAudioBuffer.duration"+myAudioBuffer.duration);
          soundSource.buffer = myAudioBuffer;
          gainNode = myAudioContext.createGain();
          soundSource.connect( gainNode );
          gainNode.connect(myAudioContext.destination);
      }

      
function loadSound(){
          soundClip.removeEventListener("loadedmetadata", loadSound);
          soundClip.play();
      }

function getAudioFormat(){

          var result;
         //console.log("myAudio.canPlayType: "+myAudio.canPlayType);
          if (soundClip.canPlayType) {
                // canPlayType returns maybe, probably, or an empty string.
              if (soundClip.canPlayType("audio/ogg") != ""){
                  result = "ogg";
              } else if (soundClip.canPlayType("audio/mp4") != ""){
                  result = "mp4";
              }
          } else {
              result = "null";
          }
          return result;
      }

function setMedia(width,height){
   newWidth = width;
   newHeight = height;  
   checksetMedia=true;
    
}
function reset(){
 if(exportRoot == undefined){
     stage.removeChild(tutorialAnim);
	}	
 else{
	 stage.removeChild(exportRoot);  
 }
	
}
function setContentSize(width,height){
   newWidth = width;
   newHeight = height;
   checksetMedia =false;  
}
function resizeAnimation(){   
	  widthRatio = DEFAULT_WIDTH /newWidth;
	  heightRatio =DEFAULT_HEIGHT /newHeight;
	  resizeRatio = (widthRatio > heightRatio) ? heightRatio : widthRatio;
	  finalWidth = parseInt(newWidth * resizeRatio);
      finalHeight = parseInt(newHeight * resizeRatio);	  
      canvas.width  = finalWidth;
      canvas.height = finalHeight;     
      stage.scaleX=resizeRatio;
      stage.scaleY=resizeRatio;		  
}

function mute(){
         	
		 if(platform.indexOf("ipad")> -1){
		   if('webkitAudioContext' in window){
                gainNode.gain.value=0;
              }
		}
		else{
		  soundClip.muted=true;
		}
		 controlAnimation.controlBar.btnMute.visible=false;
		 controlAnimation.controlBar.btnUnmute.visible=true;		       
}

function unMute(){
      		
		if(platform.indexOf("ipad")> -1){
		   if('webkitAudioContext' in window){
                gainNode.gain.value=1;
              }
		}
		else{
		   soundClip.muted=false;
		}
		controlAnimation.controlBar.btnMute.visible=true;
		controlAnimation.controlBar.btnUnmute.visible=false;
}



function rewind(){
   
	if(config.hasSound){
	   if(platform.indexOf("ipad")> -1){
	       if('webkitAudioContext' in window){
                resumeSoundAnimation(0);
              }
	   }
		
        else{
                  soundClip.load();
                  soundClip.play();
            }
	}
	controlAnimation.controlBar.btnPlay.visible=false;	
	controlAnimation.controlBar.btnPause.visible=true;
	//console.log("exportRoot.currentFrame "+exportRoot.currentFrame +"total Frame"+totalAnimFrame);
	exportRoot.gotoAndPlay(0);
	if(exportRoot.currentFrame==totalAnimFrame||exportRoot.currentFrame==0){
	   scrubberPlayHead.addEventListener("tick",listenTimeline);
       stage.update();	
	   createjs.Ticker.addEventListener("tick", stage);
	}
	

}

function pauseIpadAnimation(){
      
	   if(config.hasSound){
	      
	       if(platform.indexOf("ipad")> -1){
		      if('webkitAudioContext' in window){
                    if (soundSource ) {
                          soundSource.stop(0);
                          soundSource = null;
                          position = myAudioContext.currentTime - startTime;
                          isPlaying = false;
                  }
               }
		   }
		       controlAnimation.controlBar.btnPlay.visible=true;	
	           controlAnimation.controlBar.btnPause.visible=false;
               exportRoot.stop(); 
			   scrubberPlayHead.removeEventListener("tick",listenTimeline);
	   }
	   else{
	      exportRoot.play(); 
		  controlAnimation.controlBar.btnPlay.visible=false;	
	      controlAnimation.controlBar.btnPause.visible=true;
		   scrubberPlayHead.addEventListener("tick",listenTimeline);
	   }
     
     	
}

function pauseAnimation(){	
	   controlAnimation.controlBar.btnPlay.visible=true;	
	   controlAnimation.controlBar.btnPause.visible=false;
	   if(config.hasSound){
	       if(platform.indexOf("ipad")> -1){
		      if('webkitAudioContext' in window){
                    if (soundSource ) {
                          soundSource.stop(0);
                          soundSource = null;
                          position = myAudioContext.currentTime - startTime;
                          isPlaying = false;
                  }
               }
		   }
              else{
                  soundClip.pause();
              }
	   }
     exportRoot.stop();   
     scrubberPlayHead.removeEventListener("tick",listenTimeline);	  
}

function resumeAnimation(post){
    exportRoot.play();	
	  if(config.hasSound){
	     if(platform.indexOf("ipad")> -1){
		       if('webkitAudioContext' in window){
                  connectAudio();
                  position = typeof post === 'number' ? post : position || 0;
                  startTime = myAudioContext.currentTime - ( position || 0 );
                  soundSource.start(myAudioContext.currentTime, position);
                  isPlaying = true;
              }
		 }
	   
         else{
                  soundClip.play();
         }
	   } 
	
 controlAnimation.controlBar.btnPlay.visible=false;	
 controlAnimation.controlBar.btnPause.visible=true;	
 scrubberPlayHead.addEventListener("tick",listenTimeline);
}

function playAnimation(){       
  
       exportRoot.gotoAndPlay(0);
        if(config.hasSound){
		         if(platform.indexOf("ipad")> -1){
				    if('webkitAudioContext' in window){
                      resumeSoundAnimation(0);
                    }
				 }
                  else{
                      soundClip.currentTime=0;
                      soundClip.play();
                  }

           }
          
          controlAnimation.controlBar.btnPlay.visible=false;
          controlAnimation.controlBar.btnPause.visible=true;
          scrubberPlayHead.addEventListener("tick",listenTimeline);
          stage.update();
          createjs.Ticker.addEventListener("tick", stage);
}



function stopAnimation(){   
 controlAnimation.controlBar.btnPlay.visible=true;	
 controlAnimation.controlBar.btnPause.visible=false;
  //console.log("animation is stopped");
     if(config.hasSound){
		 if(platform.indexOf("ipad")> -1){
			 if('webkitAudioContext' in window){
                  if (soundSource ) {
                      soundSource.stop(0);
                      soundSource = null;
                      position = 0;
                      isPlaying = false;
                  }
            }
		 }
          else{
               soundClip.pause();  
           }
             
	 }
 exportRoot.stop(); 
 scrubberPlayHead.removeEventListener("tick",listenTimeline);
 createjs.Ticker.removeEventListener("tick", stage);
}


//********* Fixing Mouse Event on Windows8 IE 10/11 ***************//






//************** Fixing Mouse Event for Android ********************//
(function () {

    var stageMouseDownHandler = createjs.Stage.prototype._handlePointerDown;
    var stageMouseUpHandler = createjs.Stage.prototype._handlePointerUp;
    var mouseInterval = {};
    var MIN_CLICK_TIME = 20;


    if (navigator.userAgent.indexOf("Android "+androidVersion[0]) > -1||navigator.userAgent.indexOf("Android "+androidVersion[1]) > -1|| navigator.userAgent.indexOf("Android "+androidVersion[2]) > -1||navigator.userAgent.indexOf("Android "+androidVersion[3]) > -1||navigator.userAgent.indexOf("Android "+androidVersion[4]) > -1||navigator.userAgent.indexOf("Android "+androidVersion[5]) > -1||navigator.userAgent.indexOf("Android "+androidVersion[6]) > -1||navigator.userAgent.indexOf("Android "+androidVersion[7]) > -1) {
        console.log("navigator.userAgent  2...."+navigator.userAgent);
        createjs.Stage.prototype._handlePointerDown = function (event) {
            var lastTime = mouseInterval.mousedown;
            var now = new Date().getTime(); // Slower than Date.now(), but compatible with IE8 and others.
            if (lastTime == null || now - lastTime > MIN_CLICK_TIME) {
                mouseInterval.mousedown = now;
                stageMouseDownHandler.call(this, event);
            }
        }
        createjs.Stage.prototype._handlePointerUp = function (event) {
            var lastTime = mouseInterval.mouseup;
            var now = new Date().getTime();
            if (lastTime == null || now - lastTime > MIN_CLICK_TIME) {
                mouseInterval.mouseup = now;
                stageMouseUpHandler.call(this, event);
            }
        }
    }

}());



//************** End Fixing Mouse Event for Android *******************//




//*************** Convert Audio Base 64 to work with IPAD (WEBKITAUDIO) ********//


var Base64Binary = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    /* will return a  Uint8Array type */
    decodeArrayBuffer: function( input ) {
        var bytes = (input.length / 4) * 3;
        var ab = new ArrayBuffer( bytes );
        this.decode( input, ab );

        return ab;
    },

    decode: function( input, arrayBuffer ) {
        //get last chars to see if are valid
        var lkey1 = this._keyStr.indexOf( input.charAt( input.length - 1 ) );
        var lkey2 = this._keyStr.indexOf( input.charAt( input.length - 2 ) );

        var bytes = (input.length / 4) * 3;
        if ( lkey1 == 64 ) {
            bytes--;
        } //padding chars, so skip
        if ( lkey2 == 64 ) {
            bytes--;
        } //padding chars, so skip

        var uarray;
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        var j = 0;

        if ( arrayBuffer ) {
            uarray = new Uint8Array( arrayBuffer );
        }
        else {
            uarray = new Uint8Array( bytes );
        }

        input = input.replace( /[^A-Za-z0-9\+\/\=]/g, "" );

        for ( i = 0; i < bytes; i += 3 ) {
            //get the 3 octects in 4 ascii chars
            enc1 = this._keyStr.indexOf( input.charAt( j++ ) );
            enc2 = this._keyStr.indexOf( input.charAt( j++ ) );
            enc3 = this._keyStr.indexOf( input.charAt( j++ ) );
            enc4 = this._keyStr.indexOf( input.charAt( j++ ) );

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            uarray[i] = chr1;
            if ( enc3 != 64 ) {
                uarray[i + 1] = chr2;
            }
            if ( enc4 != 64 ) {
                uarray[i + 2] = chr3;
            }
        }

        return uarray;
    }
};

//*************** END OF Convert Audio Base 64 to work with IPAD (WEBKITAUDIO) ********//


// <<<<<<<<<<<<<   Assets  Control Bar              >>>>>>>>>//
(function (tutorialShellLib, img, cjs) {

    var p; // shortcut to reference prototypes

// stage content:
    (tutorialShellLib.TimelineController = function() {
        this.initialize();

        // Layer 1
        this.controlBar = new tutorialShellLib.TutorialTimelineControllerGraphic();
        this.controlBar.setTransform(300,390.1,1,1,0,0,0,300,15.1);

        this.addChild(this.controlBar);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(0,375,600,25.4);


// symbols:
    (tutorialShellLib.trackBar = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill("#000000").beginStroke().moveTo(-0.5,4).lineTo(-0.5,-4).lineTo(0.5,-4).lineTo(0.5,4).closePath();
        this.shape.setTransform(0.5,0);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(0,-3.9,1,8);


    (tutorialShellLib.scrubBar = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginLinearGradientFill(["#5D5D5D","#E3E3E3","#FFFFFF","#EAEAEA","#4D4D4D"],[0,0.267,0.506,0.718,1],0,-2.4,0,2.5).beginStroke().moveTo(-0.5,2.5).lineTo(-0.5,-2.5).lineTo(0.5,-2.5).lineTo(0.5,2.5).closePath();
        this.shape.setTransform(-0.4,2.5);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-0.9,0,1,5);


    (tutorialShellLib.scrubberHead = function() {
        this.initialize();

        // Layer 2
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill().beginStroke("#000000").setStrokeStyle(1,1,1,3,true).moveTo(6.1,6.3).lineTo(-6.1,6.3).lineTo(-6.1,-6.3).lineTo(6.1,-6.3).closePath();
        this.shape.setTransform(0.2,0);

        // Layer 1
        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.beginLinearGradientFill(["#999999","#FFFFFF","#949494"],[0,0.486,1],-6,0,6.2,0).beginStroke().moveTo(-6.1,6.4).lineTo(-6.1,-6.4).lineTo(6.1,-6.4).lineTo(6.1,6.4).closePath();
        this.shape_1.setTransform(0.2,0);

        this.addChild(this.shape_1,this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-5.9,-6.3,12.3,12.7);


    (tutorialShellLib.iconspeaker = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginLinearGradientFill(["#242525","#67686A","#545455","#272727"],[0,0.396,0.62,1],8.2,-16.6,8.2,16.9).beginStroke().moveTo(-1.3,8.8).curveTo(-1.6,8.8,-1.8,8.7).lineTo(-2,8.7).curveTo(-2.4,8.8,-2.8,8.5).curveTo(-3.1,8.3,-3.1,7.8).curveTo(-4,0.5,-3.1,-7.9).curveTo(-3.1,-8.3,-2.8,-8.6).curveTo(-2.4,-8.9,-2,-8.8).lineTo(-1.8,-8.7).curveTo(-1.7,-8.7,-1.6,-8.8).curveTo(-1.6,-8.8,-1.5,-8.8).curveTo(-1.5,-8.8,-1.4,-8.8).curveTo(-1.4,-8.8,-1.3,-8.8).lineTo(3.5,-8.8).lineTo(3.5,8.8).closePath();
        this.shape.setTransform(6.9,16.8);

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.beginLinearGradientFill(["#242525","#67686A","#545455","#272727"],[0,0.396,0.62,1],-7.3,-16.7,-7.3,16.8).beginStroke().moveTo(0.2,16.6).lineTo(-8.1,9.2).lineTo(-8.1,-9.3).lineTo(0.2,-16.6).curveTo(0.5,-16.8,0.8,-16.8).curveTo(1.2,-16.8,1.6,-16.7).curveTo(2,-16.5,6.1,-8.3).curveTo(10.1,-0.2,5.9,8.1).curveTo(1.7,16.4,1.5,16.7).curveTo(1.2,16.8,0.8,16.8).curveTo(0.5,16.8,0.2,16.6).closePath();
        this.shape_1.setTransform(19.2,16.8);

        this.addChild(this.shape_1,this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(3.4,0,23.9,33.7);


    (tutorialShellLib.iconrestart = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginLinearGradientFill(["#818385","#67686A","#545455","#191919"],[0,0.357,0.667,0.855],0,-26.4,0,7.3).beginStroke().moveTo(-4.4,6.7).curveTo(-8.7,5.5,-11.7,2).curveTo(-14.9,-1.7,-16.1,-7.2).curveTo(-9.8,1,-3.4,2.3).curveTo(3.1,3.5,9.6,-2.1).lineTo(7,-4.6).lineTo(16,-4.9).lineTo(16.1,3.9).lineTo(13.5,1.6).curveTo(9.2,5.4,4.5,6.6).curveTo(2.1,7.2,-0.2,7.2).curveTo(-2.4,7.2,-4.4,6.7).closePath();
        this.shape.setTransform(16.1,25.2);

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.beginLinearGradientFill(["#A1A3A6","#67686A","#545455","#323233"],[0,0.357,0.667,0.855],0,-7.2,0,26.5).beginStroke().moveTo(3.4,-2.3).curveTo(-3.1,-3.5,-9.6,2.1).lineTo(-7,4.6).lineTo(-16,4.9).lineTo(-16.1,-3.9).lineTo(-13.5,-1.6).curveTo(-9.3,-5.4,-4.4,-6.6).curveTo(0.2,-7.9,4.5,-6.7).curveTo(8.8,-5.5,11.8,-2).curveTo(14.9,1.7,16.1,7.2).curveTo(9.8,-1,3.4,-2.3).closePath();
        this.shape_1.setTransform(16.1,7.3);

        this.addChild(this.shape_1,this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(0,0,32.1,32.5);


    (tutorialShellLib.iconpause = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginLinearGradientFill(["#8C8E91","#67686A","#545455","#353535"],[0,0.357,0.667,0.855],0,-13.7,0,18.3).beginStroke().moveTo(2.5,14.4).lineTo(2.5,-14.3).lineTo(9,-14.3).lineTo(9,14.4).closePath().moveTo(-9,14.4).lineTo(-9,-14.3).lineTo(-2.5,-14.3).lineTo(-2.5,14.4).closePath();
        this.shape.setTransform(9,14.4);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(0,0,18.1,28.7);


    (tutorialShellLib.iconarrowright = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginLinearGradientFill(["#818385","#67686A","#545455","#4C4C4D"],[0,0.357,0.667,0.855],0,-13.7,0,18.3).beginStroke().moveTo(-12.5,-14.4).lineTo(12.5,-0).lineTo(-12.5,14.4).closePath();
        this.shape.setTransform(12.5,14.4);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(0,0,25,28.8);


    (tutorialShellLib.buttonup = function() {
        this.initialize();

        // Layer 2
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill().beginStroke("#000000").setStrokeStyle(2,1,1).moveTo(48,32.5).lineTo(-48,32.5).lineTo(-48,-32.5).lineTo(48,-32.5).closePath();
        this.shape.setTransform(48,32.5);

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.beginLinearGradientFill(["#A4A4A4","#FFFFFF","#F2F2F2","#8A8A8A"],[0,0.447,0.565,1],0,-31.2,0,31.4).beginStroke().moveTo(-48,32.4).lineTo(-48,-32.5).lineTo(48,-32.5).lineTo(48,32.4).closePath();
        this.shape_1.setTransform(48,32.5);

        this.addChild(this.shape_1,this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(0,0,96,64.9);


    (tutorialShellLib.buttondown = function() {
        this.initialize();

        // Layer 2
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill().beginStroke("#000000").setStrokeStyle(2,1,1).moveTo(48,32.5).lineTo(-48,32.5).lineTo(-48,-32.5).lineTo(48,-32.5).closePath();
        this.shape.setTransform(48,32.5);

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.beginLinearGradientFill(["#747474","#CBCBCB","#C5C5C5","#5D5D5D"],[0,0.424,0.51,1],0,-31.2,0,31.4).beginStroke().moveTo(-48,32.4).lineTo(-48,-32.5).lineTo(48,-32.5).lineTo(48,32.4).closePath();
        this.shape_1.setTransform(48,32.5);

        this.addChild(this.shape_1,this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(0,0,96,64.9);


    (tutorialShellLib.bar = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginLinearGradientFill(["#9D9D9D","#999999","#666666","#ABABAB","#919191","#9C9C9C"],[0,0.133,0.463,0.78,0.906,1],144.6,-10.3,144.6,10.5).beginStroke().moveTo(-106.5,10.5).lineTo(-106.5,-10.5).lineTo(106.6,-10.5).lineTo(106.6,10.5).closePath();
        this.shape.setTransform(106.6,0);

        // Layer 2
        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.beginFill("#FFFFFF").beginStroke().moveTo(-106.5,15.1).lineTo(-106.5,-15.1).lineTo(106.5,-15.1).lineTo(106.5,15.1).closePath();
        this.shape_1.setTransform(106.5,5);

        this.addChild(this.shape_1,this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(0,-10.4,213.1,30.6);


    (tutorialShellLib.contentVersion9 = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill("#999999").beginStroke().moveTo(5.9,2.9).curveTo(5.4,2.5,5.2,1.7).lineTo(6.4,1.6).curveTo(6.5,1.9,6.7,2.1).curveTo(6.7,2.1,6.8,2.2).curveTo(6.8,2.2,6.9,2.2).curveTo(6.9,2.3,7,2.3).curveTo(7.1,2.3,7.1,2.3).curveTo(7.6,2.3,7.8,1.9).curveTo(8.1,1.6,8.1,0.5).curveTo(7.7,1,7,1).curveTo(6.3,1,5.7,0.4).curveTo(5.2,-0.2,5.1,-1.1).curveTo(5.2,-2.1,5.7,-2.7).curveTo(6.3,-3.3,7.2,-3.3).curveTo(8.2,-3.3,8.8,-2.5).curveTo(9.4,-1.8,9.5,-0).curveTo(9.4,1.7,8.8,2.5).curveTo(8.1,3.3,7.1,3.3).curveTo(6.3,3.3,5.9,2.9).closePath().moveTo(6.6,-2).curveTo(6.3,-1.7,6.3,-1.1).curveTo(6.3,-0.5,6.6,-0.2).curveTo(6.9,0.1,7.2,0.1).curveTo(7.5,0.1,7.8,-0.2).curveTo(8.1,-0.5,8,-1).curveTo(8.1,-1.6,7.8,-1.9).curveTo(7.5,-2.3,7.1,-2.3).curveTo(6.8,-2.3,6.6,-2).closePath().moveTo(3,3.2).lineTo(3,1.9).lineTo(4.2,1.9).lineTo(4.2,3.2).closePath().moveTo(-0.3,3.2).lineTo(-0.3,-1.5).curveTo(-1,-0.8,-2,-0.5).lineTo(-2,-1.7).curveTo(-1.5,-1.8,-0.9,-2.3).curveTo(-0.3,-2.7,-0.1,-3.3).lineTo(0.9,-3.3).lineTo(0.9,3.2).closePath().moveTo(-4.5,3.2).lineTo(-4.5,1.9).lineTo(-3.2,1.9).lineTo(-3.2,3.2).closePath().moveTo(-7.5,3.2).lineTo(-9.4,-1.5).lineTo(-8.2,-1.5).lineTo(-7,1.7).lineTo(-5.8,-1.5).lineTo(-4.6,-1.5).lineTo(-6.5,3.2).closePath();
        this.shape.setTransform(-0.1,-0.5);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-9.6,-3.8,18.9,6.6);


    (tutorialShellLib.contentVersion8 = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill("#999999").beginStroke().moveTo(5.9,2.8).curveTo(5.2,2.3,5.2,1.3).curveTo(5.2,0.8,5.4,0.4).curveTo(5.8,-0.1,6.3,-0.3).curveTo(5.8,-0.5,5.6,-0.9).curveTo(5.4,-1.2,5.4,-1.6).curveTo(5.4,-2.4,5.9,-2.8).curveTo(6.4,-3.3,7.3,-3.3).curveTo(8.3,-3.3,8.8,-2.8).curveTo(9.2,-2.4,9.3,-1.6).curveTo(9.3,-1.2,9,-0.8).curveTo(8.8,-0.5,8.4,-0.3).curveTo(8.9,-0.1,9.1,0.3).curveTo(9.5,0.7,9.5,1.3).curveTo(9.4,2.2,8.9,2.7).curveTo(8.3,3.3,7.3,3.3).curveTo(6.5,3.3,5.9,2.8).closePath().moveTo(6.7,0.5).curveTo(6.5,0.9,6.4,1.2).curveTo(6.4,1.7,6.7,2).curveTo(6.9,2.3,7.3,2.3).curveTo(7.7,2.3,8,2).curveTo(8.2,1.7,8.2,1.2).curveTo(8.2,0.8,7.9,0.5).curveTo(7.7,0.2,7.3,0.2).curveTo(6.9,0.2,6.7,0.5).closePath().moveTo(6.8,-2.1).curveTo(6.6,-1.9,6.6,-1.5).curveTo(6.6,-1.2,6.8,-1).curveTo(7,-0.8,7.3,-0.8).curveTo(7.6,-0.8,7.9,-1).curveTo(8.1,-1.2,8.1,-1.5).curveTo(8.1,-1.9,7.9,-2.1).curveTo(7.6,-2.3,7.3,-2.3).curveTo(7,-2.3,6.8,-2.1).closePath().moveTo(3,3.2).lineTo(3,1.9).lineTo(4.2,1.9).lineTo(4.2,3.2).closePath().moveTo(-0.3,3.2).lineTo(-0.3,-1.5).curveTo(-1,-0.8,-2,-0.5).lineTo(-2,-1.7).curveTo(-1.5,-1.8,-0.9,-2.3).curveTo(-0.3,-2.7,-0.1,-3.3).lineTo(0.9,-3.3).lineTo(0.9,3.2).closePath().moveTo(-4.5,3.2).lineTo(-4.5,1.9).lineTo(-3.2,1.9).lineTo(-3.2,3.2).closePath().moveTo(-7.5,3.2).lineTo(-9.4,-1.5).lineTo(-8.2,-1.5).lineTo(-7,1.7).lineTo(-5.8,-1.5).lineTo(-4.6,-1.5).lineTo(-6.5,3.2).closePath();
        this.shape.setTransform(-0.1,-0.5);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-9.6,-3.8,18.9,6.6);


    (tutorialShellLib.contentVersion7 = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill("#999999").beginStroke().moveTo(6.1,3.2).curveTo(6.1,1.9,6.7,0.5).curveTo(7.2,-0.9,8,-2).lineTo(5.2,-2).lineTo(5.2,-3.1).lineTo(9.5,-3.1).lineTo(9.5,-2.2).curveTo(9,-1.7,8.4,-0.8).curveTo(7.9,0.2,7.6,1.3).curveTo(7.3,2.4,7.3,3.2).closePath().moveTo(3,3.2).lineTo(3,2).lineTo(4.2,2).lineTo(4.2,3.2).closePath().moveTo(-0.3,3.2).lineTo(-0.3,-1.4).curveTo(-1,-0.8,-2,-0.5).lineTo(-2,-1.6).curveTo(-1.5,-1.8,-0.9,-2.2).curveTo(-0.3,-2.7,-0.1,-3.2).lineTo(0.9,-3.2).lineTo(0.9,3.2).closePath().moveTo(-4.5,3.2).lineTo(-4.5,2).lineTo(-3.2,2).lineTo(-3.2,3.2).closePath().moveTo(-7.5,3.2).lineTo(-9.4,-1.4).lineTo(-8.2,-1.4).lineTo(-7,1.7).lineTo(-5.8,-1.4).lineTo(-4.6,-1.4).lineTo(-6.5,3.2).closePath();
        this.shape.setTransform(-0.1,-0.5);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-9.6,-3.8,18.9,6.5);


    (tutorialShellLib.contentVersion6 = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill("#999999").beginStroke().moveTo(5.8,2.5).curveTo(5.2,1.8,5.2,0).curveTo(5.2,-1.7,5.8,-2.5).curveTo(6.5,-3.3,7.5,-3.3).curveTo(8.2,-3.3,8.8,-2.9).curveTo(9.2,-2.5,9.3,-1.7).lineTo(8.2,-1.6).curveTo(8.2,-1.9,8,-2.1).curveTo(7.8,-2.3,7.4,-2.3).curveTo(7.1,-2.3,6.8,-1.9).curveTo(6.6,-1.6,6.4,-0.5).curveTo(6.9,-1,7.6,-1).curveTo(8.4,-1,9,-0.4).curveTo(9.5,0.2,9.5,1.1).curveTo(9.5,2.1,8.9,2.7).curveTo(8.3,3.3,7.4,3.3).curveTo(6.4,3.3,5.8,2.5).closePath().moveTo(6.8,0.2).curveTo(6.6,0.5,6.5,1).curveTo(6.5,1.6,6.8,1.9).curveTo(7.1,2.3,7.5,2.3).curveTo(7.8,2.3,8.1,2).curveTo(8.3,1.7,8.3,1.1).curveTo(8.3,0.5,8.1,0.2).curveTo(7.8,-0.1,7.4,-0.1).curveTo(7,-0.1,6.8,0.2).closePath().moveTo(2.9,3.2).lineTo(2.9,1.9).lineTo(4.2,1.9).lineTo(4.2,3.2).closePath().moveTo(-0.4,3.2).lineTo(-0.4,-1.5).curveTo(-1.1,-0.8,-2,-0.5).lineTo(-2,-1.7).curveTo(-1.5,-1.8,-0.9,-2.3).curveTo(-0.3,-2.7,-0.1,-3.3).lineTo(0.9,-3.3).lineTo(0.9,3.2).closePath().moveTo(-4.5,3.2).lineTo(-4.5,1.9).lineTo(-3.3,1.9).lineTo(-3.3,3.2).closePath().moveTo(-7.6,3.2).lineTo(-9.5,-1.5).lineTo(-8.2,-1.5).lineTo(-7.1,1.7).lineTo(-5.9,-1.5).lineTo(-4.6,-1.5).lineTo(-6.5,3.2).closePath();
        this.shape.setTransform(-0.1,-0.5);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-9.6,-3.8,19,6.6);


    (tutorialShellLib.contentVersion5 = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill("#999999").beginStroke().moveTo(5.8,2.8).curveTo(5.3,2.3,5.2,1.5).lineTo(6.4,1.4).curveTo(6.5,1.8,6.7,2.1).curveTo(7,2.3,7.3,2.3).curveTo(7.7,2.3,8,2).curveTo(8.2,1.7,8.2,1).curveTo(8.2,0.4,8,0.1).curveTo(7.7,-0.2,7.3,-0.2).curveTo(6.7,-0.2,6.3,0.3).lineTo(5.3,0.2).lineTo(6,-3.2).lineTo(9.2,-3.2).lineTo(9.2,-2).lineTo(6.9,-2).lineTo(6.7,-0.9).curveTo(7.1,-1.1,7.5,-1.1).curveTo(8.4,-1.1,8.9,-0.5).curveTo(9.5,0.1,9.5,1).curveTo(9.5,1.8,9,2.4).curveTo(8.4,3.3,7.3,3.3).curveTo(6.4,3.3,5.8,2.8).closePath().moveTo(2.9,3.2).lineTo(2.9,1.9).lineTo(4.2,1.9).lineTo(4.2,3.2).closePath().moveTo(-0.4,3.2).lineTo(-0.4,-1.5).curveTo(-1.1,-0.8,-2,-0.5).lineTo(-2,-1.7).curveTo(-1.5,-1.8,-1,-2.3).curveTo(-0.4,-2.7,-0.2,-3.3).lineTo(0.8,-3.3).lineTo(0.8,3.2).closePath().moveTo(-4.6,3.2).lineTo(-4.6,1.9).lineTo(-3.3,1.9).lineTo(-3.3,3.2).closePath().moveTo(-7.6,3.2).lineTo(-9.5,-1.5).lineTo(-8.2,-1.5).lineTo(-7.1,1.7).lineTo(-5.9,-1.5).lineTo(-4.7,-1.5).lineTo(-6.5,3.2).closePath();
        this.shape.setTransform(0,-0.5);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-9.6,-3.8,19.1,6.6);


    (tutorialShellLib.contentVersion4 = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill("#999999").beginStroke().moveTo(7.6,3.2).lineTo(7.6,1.9).lineTo(4.9,1.9).lineTo(4.9,0.8).lineTo(7.7,-3.2).lineTo(8.7,-3.2).lineTo(8.7,0.8).lineTo(9.5,0.8).lineTo(9.5,1.9).lineTo(8.7,1.9).lineTo(8.7,3.2).closePath().moveTo(6,0.8).lineTo(7.6,0.8).lineTo(7.6,-1.4).closePath().moveTo(2.9,3.2).lineTo(2.9,2).lineTo(4.1,2).lineTo(4.1,3.2).closePath().moveTo(-0.4,3.2).lineTo(-0.4,-1.4).curveTo(-1.1,-0.8,-2.1,-0.5).lineTo(-2.1,-1.6).curveTo(-1.6,-1.8,-1,-2.2).curveTo(-0.4,-2.7,-0.2,-3.2).lineTo(0.8,-3.2).lineTo(0.8,3.2).closePath().moveTo(-4.6,3.2).lineTo(-4.6,2).lineTo(-3.3,2).lineTo(-3.3,3.2).closePath().moveTo(-7.6,3.2).lineTo(-9.5,-1.4).lineTo(-8.3,-1.4).lineTo(-7.1,1.7).lineTo(-5.9,-1.4).lineTo(-4.7,-1.4).lineTo(-6.6,3.2).closePath();
        this.shape.setTransform(0,-0.5);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-9.6,-3.8,19.1,6.5);


    (tutorialShellLib.contentVersion3 = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill("#999999").beginStroke().moveTo(5.9,2.8).curveTo(5.3,2.3,5.2,1.5).lineTo(6.4,1.3).curveTo(6.5,1.8,6.7,2).curveTo(7,2.3,7.3,2.3).curveTo(7.7,2.3,7.9,2).curveTo(8.2,1.7,8.2,1.2).curveTo(8.2,0.7,7.9,0.5).curveTo(7.7,0.2,7.3,0.2).lineTo(6.8,0.3).lineTo(6.9,-0.7).curveTo(7.4,-0.7,7.7,-1).curveTo(8,-1.2,7.9,-1.6).curveTo(7.9,-1.9,7.8,-2.1).curveTo(7.6,-2.3,7.2,-2.3).curveTo(6.9,-2.3,6.7,-2.1).curveTo(6.5,-1.8,6.4,-1.4).lineTo(5.3,-1.6).curveTo(5.4,-2.2,5.7,-2.5).curveTo(5.9,-2.9,6.3,-3.1).curveTo(6.7,-3.3,7.2,-3.3).curveTo(8.2,-3.3,8.8,-2.7).curveTo(9.2,-2.2,9.2,-1.6).curveTo(9.2,-0.8,8.2,-0.3).curveTo(8.8,-0.2,9.1,0.2).curveTo(9.5,0.7,9.5,1.2).curveTo(9.5,2.1,8.8,2.7).curveTo(8.3,3.3,7.3,3.3).curveTo(6.4,3.3,5.9,2.8).closePath().moveTo(3,3.2).lineTo(3,1.9).lineTo(4.2,1.9).lineTo(4.2,3.2).closePath().moveTo(-0.3,3.2).lineTo(-0.3,-1.5).curveTo(-1,-0.8,-2,-0.5).lineTo(-2,-1.7).curveTo(-1.5,-1.8,-0.9,-2.3).curveTo(-0.3,-2.7,-0.1,-3.3).lineTo(0.9,-3.3).lineTo(0.9,3.2).closePath().moveTo(-4.5,3.2).lineTo(-4.5,1.9).lineTo(-3.2,1.9).lineTo(-3.2,3.2).closePath().moveTo(-7.5,3.2).lineTo(-9.4,-1.5).lineTo(-8.2,-1.5).lineTo(-7,1.7).lineTo(-5.8,-1.5).lineTo(-4.6,-1.5).lineTo(-6.5,3.2).closePath();
        this.shape.setTransform(-0.1,-0.5);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-9.6,-3.8,18.9,6.6);


    (tutorialShellLib.contentVersion2 = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill("#999999").beginStroke().moveTo(5.1,3.2).curveTo(5.2,2.6,5.5,2).curveTo(5.9,1.4,6.9,0.4).lineTo(7.9,-0.6).curveTo(8.2,-1,8.2,-1.4).curveTo(8.2,-1.8,8,-2).curveTo(7.7,-2.2,7.4,-2.2).curveTo(7,-2.2,6.7,-2).curveTo(6.5,-1.8,6.5,-1.2).lineTo(5.2,-1.3).curveTo(5.4,-2.4,5.9,-2.8).curveTo(6.5,-3.2,7.4,-3.2).curveTo(8.3,-3.2,8.9,-2.7).curveTo(9.4,-2.2,9.4,-1.5).curveTo(9.4,-1,9.3,-0.6).lineTo(8.8,0.2).lineTo(8,1).lineTo(7.2,1.7).lineTo(7,2.1).lineTo(9.4,2.1).lineTo(9.4,3.2).closePath().moveTo(3,3.2).lineTo(3,2).lineTo(4.3,2).lineTo(4.3,3.2).closePath().moveTo(-0.3,3.2).lineTo(-0.3,-1.4).curveTo(-1,-0.8,-1.9,-0.5).lineTo(-1.9,-1.6).curveTo(-1.4,-1.8,-0.9,-2.2).curveTo(-0.3,-2.7,-0.1,-3.2).lineTo(0.9,-3.2).lineTo(0.9,3.2).closePath().moveTo(-4.5,3.2).lineTo(-4.5,2).lineTo(-3.2,2).lineTo(-3.2,3.2).closePath().moveTo(-7.5,3.2).lineTo(-9.4,-1.4).lineTo(-8.1,-1.4).lineTo(-7,1.7).lineTo(-5.8,-1.4).lineTo(-4.6,-1.4).lineTo(-6.4,3.2).closePath();
        this.shape.setTransform(-0.1,-0.5);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-9.6,-3.8,18.9,6.5);


    (tutorialShellLib.contentVersion1 = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill("#999999").beginStroke().moveTo(7.5,3.2).lineTo(7.5,-1.4).curveTo(6.9,-0.8,5.9,-0.5).lineTo(5.9,-1.6).curveTo(6.4,-1.8,7,-2.2).curveTo(7.6,-2.7,7.8,-3.2).lineTo(8.8,-3.2).lineTo(8.8,3.2).closePath().moveTo(3.7,3.2).lineTo(3.7,2).lineTo(4.9,2).lineTo(4.9,3.2).closePath().moveTo(0.3,3.2).lineTo(0.3,-1.4).curveTo(-0.3,-0.8,-1.3,-0.5).lineTo(-1.3,-1.6).curveTo(-0.8,-1.8,-0.2,-2.2).curveTo(0.4,-2.7,0.6,-3.2).lineTo(1.6,-3.2).lineTo(1.6,3.2).closePath().moveTo(-3.8,3.2).lineTo(-3.8,2).lineTo(-2.6,2).lineTo(-2.6,3.2).closePath().moveTo(-6.9,3.2).lineTo(-8.8,-1.4).lineTo(-7.5,-1.4).lineTo(-6.3,1.7).lineTo(-5.2,-1.4).lineTo(-3.9,-1.4).lineTo(-5.8,3.2).closePath();
        this.shape.setTransform(-0.8,-0.5);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-9.6,-3.8,17.6,6.5);


    (tutorialShellLib.contentVersion0 = function() {
        this.initialize();

        // Layer 1
        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill("#999999").beginStroke().moveTo(5.7,2.6).curveTo(5.2,1.8,5.2,-0).curveTo(5.2,-1.8,5.8,-2.6).curveTo(6.3,-3.3,7.2,-3.3).curveTo(8.2,-3.3,8.7,-2.6).curveTo(9.3,-1.8,9.3,-0).curveTo(9.3,1.8,8.7,2.6).curveTo(8.2,3.3,7.2,3.3).curveTo(6.3,3.3,5.7,2.6).closePath().moveTo(6.8,-2.1).lineTo(6.6,-1.6).curveTo(6.4,-1.1,6.4,-0).curveTo(6.4,1.1,6.6,1.6).lineTo(6.8,2.1).lineTo(7.2,2.3).curveTo(7.3,2.3,7.3,2.3).curveTo(7.4,2.3,7.5,2.2).curveTo(7.5,2.2,7.5,2.2).curveTo(7.6,2.2,7.6,2.1).curveTo(7.8,2,7.9,1.6).lineTo(8,-0).lineTo(7.9,-1.6).curveTo(7.8,-2,7.6,-2.1).curveTo(7.6,-2.2,7.5,-2.2).curveTo(7.5,-2.2,7.5,-2.2).curveTo(7.4,-2.3,7.3,-2.3).curveTo(7.3,-2.3,7.2,-2.3).lineTo(6.8,-2.1).closePath().moveTo(3.1,3.2).lineTo(3.1,1.9).lineTo(4.4,1.9).lineTo(4.4,3.2).closePath().moveTo(-0.2,3.2).lineTo(-0.2,-1.5).curveTo(-0.9,-0.8,-1.8,-0.5).lineTo(-1.8,-1.7).curveTo(-1.3,-1.8,-0.8,-2.3).curveTo(-0.2,-2.7,0,-3.3).lineTo(1,-3.3).lineTo(1,3.2).closePath().moveTo(-4.4,3.2).lineTo(-4.4,1.9).lineTo(-3.1,1.9).lineTo(-3.1,3.2).closePath().moveTo(-7.4,3.2).lineTo(-9.3,-1.5).lineTo(-8,-1.5).lineTo(-6.9,1.7).lineTo(-5.7,-1.5).lineTo(-4.5,-1.5).lineTo(-6.3,3.2).closePath();
        this.shape.setTransform(-0.2,-0.5);

        this.addChild(this.shape);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(-9.6,-3.8,18.7,6.6);


    (tutorialShellLib.Unmutebutton = function(mode,startPosition,loop) {
        this.initialize(mode,startPosition,loop,{});

        // Layer 1
        this.instance = new tutorialShellLib.iconspeaker("synched",0);
        this.instance.setTransform(-16,0,1.13,1.13,0,0,0,11.7,16.8);

        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill().beginStroke("#5E5E60").setStrokeStyle(2,1,1).moveTo(-12.8,-4.2).curveTo(-9.8,-4.2,-7.5,-3.6).curveTo(-6.5,-3.5,-5.7,-3.2).curveTo(-2.3,-2,-2.3,-0.3).curveTo(-2.3,1.4,-5.7,2.5).curveTo(-8.7,3.6,-12.8,3.7).moveTo(-5.2,-10).curveTo(-2.2,-9.8,0.1,-8.4).curveTo(1.1,-8,1.9,-7.3).curveTo(5.3,-4.1,5.3,0.3).curveTo(5.3,4.7,1.9,7.8).curveTo(-1.1,10.6,-5.2,11).moveTo(2.3,-15).curveTo(5.3,-14.7,7.7,-12.7).curveTo(8.6,-12.1,9.5,-11.1).curveTo(12.8,-6.5,12.8,-0.3).curveTo(12.8,6.1,9.5,10.5).curveTo(6.4,14.5,2.3,15);
        this.shape.setTransform(19.3,0.4);

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.beginFill().beginStroke("#373535").setStrokeStyle(2,1,1).moveTo(48,32.5).lineTo(-48,32.5).lineTo(-48,-32.5).lineTo(48,-32.5).closePath();

        this.shape_2 = new cjs.Shape();
        this.shape_2.graphics.beginLinearGradientFill(["#D5D6D6","#E9EAEB","#DBDCDD","#B2B3B3"],[0,0.302,1,1],45.1,-30.3,45.1,33.1).beginStroke().moveTo(-48,32.5).lineTo(-48,-32.5).lineTo(48,-32.5).lineTo(48,32.5).closePath().moveTo(28.8,10.9).curveTo(25.7,14.8,21.6,15.4).curveTo(25.7,14.8,28.8,10.9).curveTo(32.1,6.4,32.1,0.1).curveTo(32.1,-6.1,28.8,-10.7).curveTo(27.9,-11.7,27,-12.3).curveTo(24.6,-14.4,21.6,-14.7).curveTo(24.6,-14.4,27,-12.3).curveTo(27.9,-11.7,28.8,-10.7).curveTo(32.1,-6.1,32.1,0.1).curveTo(32.1,6.4,28.8,10.9).closePath().moveTo(21.2,8.2).curveTo(18.2,11,14.1,11.3).curveTo(18.2,11,21.2,8.2).curveTo(24.6,5.1,24.6,0.6).curveTo(24.6,-3.7,21.2,-6.9).curveTo(20.4,-7.6,19.4,-8).curveTo(17.1,-9.4,14.1,-9.6).curveTo(17.1,-9.4,19.4,-8).curveTo(20.4,-7.6,21.2,-6.9).curveTo(24.6,-3.7,24.6,0.6).curveTo(24.6,5.1,21.2,8.2).closePath().moveTo(13.6,2.9).curveTo(10.6,4,6.5,4.1).curveTo(10.6,4,13.6,2.9).curveTo(17,1.7,17,0.1).curveTo(17,-1.6,13.6,-2.9).lineTo(11.8,-3.2).curveTo(9.5,-3.8,6.5,-3.9).curveTo(9.5,-3.8,11.8,-3.2).lineTo(13.6,-2.9).curveTo(17,-1.6,17,0.1).curveTo(17,1.7,13.6,2.9).closePath();

        this.shape_3 = new cjs.Shape();
        this.shape_3.graphics.beginLinearGradientFill(["#B9BABA","#E9EAEB","#B2B3B3"],[0,0.302,1],45.1,-30.3,45.1,33.1).beginStroke().moveTo(-48,32.5).lineTo(-48,-32.5).lineTo(48,-32.5).lineTo(48,32.5).closePath().moveTo(28.8,10.9).curveTo(25.7,14.8,21.6,15.4).curveTo(25.7,14.8,28.8,10.9).curveTo(32.1,6.4,32.1,0.1).curveTo(32.1,-6.1,28.8,-10.7).curveTo(27.9,-11.7,27,-12.3).curveTo(24.6,-14.4,21.6,-14.7).curveTo(24.6,-14.4,27,-12.3).curveTo(27.9,-11.7,28.8,-10.7).curveTo(32.1,-6.1,32.1,0.1).curveTo(32.1,6.4,28.8,10.9).closePath().moveTo(21.2,8.2).curveTo(18.2,11,14.1,11.3).curveTo(18.2,11,21.2,8.2).curveTo(24.6,5.1,24.6,0.6).curveTo(24.6,-3.7,21.2,-6.9).curveTo(20.4,-7.6,19.4,-8).curveTo(17.1,-9.4,14.1,-9.6).curveTo(17.1,-9.4,19.4,-8).curveTo(20.4,-7.6,21.2,-6.9).curveTo(24.6,-3.7,24.6,0.6).curveTo(24.6,5.1,21.2,8.2).closePath().moveTo(13.6,2.9).curveTo(10.6,4,6.5,4.1).curveTo(10.6,4,13.6,2.9).curveTo(17,1.7,17,0.1).curveTo(17,-1.6,13.6,-2.9).lineTo(11.8,-3.2).curveTo(9.5,-3.8,6.5,-3.9).curveTo(9.5,-3.8,11.8,-3.2).lineTo(13.6,-2.9).curveTo(17,-1.6,17,0.1).curveTo(17,1.7,13.6,2.9).closePath();

        this.shape_4 = new cjs.Shape();
        this.shape_4.graphics.beginFill().beginStroke("#5E5E60").setStrokeStyle(2,1,1).moveTo(2.3,-15).curveTo(5.3,-14.7,7.7,-12.7).curveTo(8.6,-12.1,9.5,-11.1).curveTo(12.8,-6.5,12.8,-0.3).curveTo(12.8,6.1,9.5,10.5).curveTo(6.4,14.5,2.3,15).moveTo(-5.2,-10).curveTo(-2.2,-9.8,0.1,-8.4).curveTo(1.1,-8,1.9,-7.3).curveTo(5.3,-4.1,5.3,0.3).curveTo(5.3,4.7,1.9,7.8).curveTo(-1.1,10.6,-5.2,11).moveTo(-12.8,-4.2).curveTo(-9.8,-4.2,-7.5,-3.6).curveTo(-6.5,-3.5,-5.7,-3.2).curveTo(-2.3,-2,-2.3,-0.3).curveTo(-2.3,1.4,-5.7,2.5).curveTo(-8.7,3.6,-12.8,3.7);
        this.shape_4.setTransform(19.3,0.4);

        this.shape_5 = new cjs.Shape();
        this.shape_5.graphics.beginLinearGradientFill(["#888888","#E9EAEB","#989898"],[0,0.302,1],45.1,-30.3,45.1,33.1).beginStroke().moveTo(-48,32.5).lineTo(-48,-32.5).lineTo(48,-32.5).lineTo(48,32.5).closePath().moveTo(28.8,10.9).curveTo(25.7,14.8,21.6,15.4).curveTo(25.7,14.8,28.8,10.9).curveTo(32.1,6.4,32.1,0.1).curveTo(32.1,-6.1,28.8,-10.7).curveTo(27.9,-11.7,27,-12.3).curveTo(24.6,-14.4,21.6,-14.7).curveTo(24.6,-14.4,27,-12.3).curveTo(27.9,-11.7,28.8,-10.7).curveTo(32.1,-6.1,32.1,0.1).curveTo(32.1,6.4,28.8,10.9).closePath().moveTo(21.2,8.2).curveTo(18.2,11,14.1,11.3).curveTo(18.2,11,21.2,8.2).curveTo(24.6,5.1,24.6,0.6).curveTo(24.6,-3.7,21.2,-6.9).curveTo(20.4,-7.6,19.4,-8).curveTo(17.1,-9.4,14.1,-9.6).curveTo(17.1,-9.4,19.4,-8).curveTo(20.4,-7.6,21.2,-6.9).curveTo(24.6,-3.7,24.6,0.6).curveTo(24.6,5.1,21.2,8.2).closePath().moveTo(13.6,2.9).curveTo(10.6,4,6.5,4.1).curveTo(10.6,4,13.6,2.9).curveTo(17,1.7,17,0.1).curveTo(17,-1.6,13.6,-2.9).lineTo(11.8,-3.2).curveTo(9.5,-3.8,6.5,-3.9).curveTo(9.5,-3.8,11.8,-3.2).lineTo(13.6,-2.9).curveTo(17,-1.6,17,0.1).curveTo(17,1.7,13.6,2.9).closePath();

        this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.instance}]}).to({state:[{t:this.shape_3},{t:this.shape_1},{t:this.shape},{t:this.instance}]},1).to({state:[{t:this.shape_5},{t:this.shape_1},{t:this.shape_4},{t:this.instance}]},1).wait(1));

    }).prototype = p = new cjs.MovieClip();
    p.nominalBounds = new cjs.Rectangle(-47.9,-32.4,96,64.9);


    (tutorialShellLib.rewindbutton = function(mode,startPosition,loop) {
        this.initialize(mode,startPosition,loop,{});

        // Layer 1
        this.instance = new tutorialShellLib.iconrestart("synched",0);
        this.instance.setTransform(0.1,0,1,1,0,0,0,16.1,16.2);

        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill().beginStroke("#373535").setStrokeStyle(2,1,1).moveTo(48,-32.5).lineTo(48,32.5).lineTo(-48,32.5).lineTo(-48,-32.5).closePath();

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.beginLinearGradientFill(["#F0F1A4","#ECEDC2","#F0F1A6","#F0F1A4","#ECEDBD","#EBECD4","#ECEDC2"],[0,0,0.38,0.694,1,1,1],45.1,-30.3,45.1,33.1).beginStroke().moveTo(-48,32.5).lineTo(-48,-32.5).lineTo(48,-32.5).lineTo(48,32.5).closePath();

        this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.shape_1},{t:this.shape},{t:this.instance}]},1).to({state:[{t:this.instance}]},1).wait(1));

        // Layer 3
        this.instance_1 = new tutorialShellLib.buttondown("synched",0);
        this.instance_1.setTransform(0.1,0.1,1,1,0,0,0,48,32.5);
        this.instance_1._off = true;

        this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(2).to({startPosition:0,_off:false},0).wait(1));

        // Layer 2
        this.instance_2 = new tutorialShellLib.buttonup("synched",0);
        this.instance_2.setTransform(0.1,0.1,1,1,0,0,0,48,32.5);

        this.timeline.addTween(cjs.Tween.get(this.instance_2).to({_off:true},1).wait(2));

    }).prototype = p = new cjs.MovieClip();
    p.nominalBounds = new cjs.Rectangle(-47.9,-32.4,96,64.9);


    (tutorialShellLib.playbutton = function(mode,startPosition,loop) {
        this.initialize(mode,startPosition,loop,{});

        // Layer 1
        this.instance = new tutorialShellLib.iconarrowright("synched",0);
        this.instance.setTransform(0.1,0,1,1,0,0,0,12.5,14.4);

        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill().beginStroke("#003399").setStrokeStyle(2,1,1).moveTo(12.3,0.3).lineTo(-12.4,14.4).moveTo(-12.4,-14.4).lineTo(12.6,0).moveTo(-12.6,-14.2).lineTo(-12.6,13.8);

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.beginFill().beginStroke("#373535").setStrokeStyle(2,1,1).moveTo(48,-32.5).lineTo(48,32.5).lineTo(-48,32.5).lineTo(-48,-32.5).closePath();

        this.shape_2 = new cjs.Shape();
        this.shape_2.graphics.beginLinearGradientFill(["#B9BABA","#E9EAEB","#B2B3B3"],[0,0.302,1],45.1,-30.3,45.1,33.1).beginStroke().moveTo(-48,32.5).lineTo(-48,-32.5).lineTo(48,-32.5).lineTo(48,32.5).closePath().moveTo(-12.5,14.4).lineTo(12.2,0.3).closePath().moveTo(-12.6,13.8).lineTo(-12.6,-14.2).closePath().moveTo(12.5,-0).lineTo(-12.5,-14.4).closePath();

        this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.instance}]},1).to({state:[{t:this.shape},{t:this.instance}]},1).wait(1));

        // Layer 3
        this.instance_1 = new tutorialShellLib.buttondown();
        this.instance_1.setTransform(0.1,0.1,1,1,0,0,0,48,32.5);
        this.instance_1._off = true;

        this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(2).to({_off:false},0).wait(1));

        // Layer 2
        this.instance_2 = new tutorialShellLib.buttonup();
        this.instance_2.setTransform(0.1,0.1,1,1,0,0,0,48,32.5);

        this.timeline.addTween(cjs.Tween.get(this.instance_2).to({_off:true},1).wait(2));

    }).prototype = p = new cjs.MovieClip();
    p.nominalBounds = new cjs.Rectangle(-47.9,-32.4,96,64.9);


    (tutorialShellLib.pausebutton = function(mode,startPosition,loop) {
        this.initialize(mode,startPosition,loop,{});

        // Layer 1
        this.instance = new tutorialShellLib.iconpause("synched",0);
        this.instance.setTransform(3.5,0.1,1,1,0,0,0,12.5,14.4);

        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill().beginStroke("#373535").setStrokeStyle(2,1,1).moveTo(48,-32.5).lineTo(48,32.5).lineTo(-48,32.5).lineTo(-48,-32.5).closePath();

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.beginLinearGradientFill(["#F0F1A4","#ECEDC2","#F0F1A6","#F0F1A4","#ECEDBD","#EBECD4","#ECEDC2"],[0,0,0.38,0.694,1,1,1],45.1,-30.3,45.1,33.1).beginStroke().moveTo(-48,32.5).lineTo(-48,-32.5).lineTo(48,-32.5).lineTo(48,32.5).closePath();

        this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance}]}).to({state:[{t:this.shape_1},{t:this.shape},{t:this.instance}]},1).to({state:[{t:this.instance}]},1).wait(1));

        // Layer 3
        this.instance_1 = new tutorialShellLib.buttondown();
        this.instance_1.setTransform(0.1,0.1,1,1,0,0,0,48,32.5);
        this.instance_1._off = true;

        this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(2).to({_off:false},0).wait(1));

        // Layer 2
        this.instance_2 = new tutorialShellLib.buttonup();
        this.instance_2.setTransform(0.1,0.1,1,1,0,0,0,48,32.5);

        this.timeline.addTween(cjs.Tween.get(this.instance_2).to({_off:true},1).wait(2));

    }).prototype = p = new cjs.MovieClip();
    p.nominalBounds = new cjs.Rectangle(-47.9,-32.4,96,64.9);


    (tutorialShellLib.mutebutton = function(mode,startPosition,loop) {
        this.initialize(mode,startPosition,loop,{});

        // Layer 1
        this.instance = new tutorialShellLib.iconspeaker("synched",0);
        this.instance.setTransform(-16,0,1.13,1.13,0,0,0,11.7,16.8);

        this.shape = new cjs.Shape();
        this.shape.graphics.beginFill().beginStroke("#FF0000").setStrokeStyle(2,1,1).moveTo(-8.6,-8.8).curveTo(-4.8,-11.9,0.2,-11.9).curveTo(3.9,-11.9,6.8,-10.1).curveTo(7.8,-9.6,8.6,-8.8).curveTo(11.9,-5.1,11.9,-0.2).curveTo(11.9,4.8,8.6,8.4).curveTo(5.1,11.9,0.2,11.9).curveTo(-4.4,11.9,-7.7,9.1).curveTo(-8.2,8.6,-8.6,8.4).curveTo(-12,4.8,-12,-0.2).curveTo(-12,-5.1,-8.6,-8.8).closePath().moveTo(6.8,-10.1).lineTo(-7.7,9.1);
        this.shape.setTransform(16.6,-1.6);

        this.shape_1 = new cjs.Shape();
        this.shape_1.graphics.beginLinearGradientFill(["#D5D6D6","#E9EAEB","#DBDCDD","#B2B3B3"],[0,0.302,1,1],28.5,-28.6,28.5,34.8).beginStroke().moveTo(-7.7,9.1).lineTo(6.8,-10.1).lineTo(-7.7,9.1).curveTo(-8.1,8.6,-8.6,8.4).curveTo(-11.9,4.9,-11.9,-0.2).curveTo(-11.9,-5.1,-8.6,-8.7).curveTo(-4.8,-11.9,0.2,-12).curveTo(3.9,-12,6.8,-10.1).curveTo(7.7,-9.6,8.6,-8.7).curveTo(11.9,-5.1,11.9,-0.2).curveTo(11.9,4.9,8.6,8.4).curveTo(5.1,12,0.2,12).curveTo(-4.4,11.9,-7.7,9.1).closePath();
        this.shape_1.setTransform(16.6,-1.6);

        this.shape_2 = new cjs.Shape();
        this.shape_2.graphics.beginFill().beginStroke("#FF0000").setStrokeStyle(2,1,1).moveTo(6.8,-10.1).curveTo(7.8,-9.6,8.6,-8.8).curveTo(11.9,-5.1,11.9,-0.2).curveTo(11.9,4.8,8.6,8.4).curveTo(5.1,11.9,0.2,11.9).curveTo(-4.4,11.9,-7.7,9.1).curveTo(-8.2,8.6,-8.6,8.4).curveTo(-12,4.8,-12,-0.2).curveTo(-12,-5.1,-8.6,-8.8).curveTo(-4.8,-11.9,0.2,-11.9).curveTo(3.9,-11.9,6.8,-10.1).lineTo(-7.7,9.1);
        this.shape_2.setTransform(16.6,-1.6);

        this.shape_3 = new cjs.Shape();
        this.shape_3.graphics.beginFill().beginStroke("#373535").setStrokeStyle(2,1,1).moveTo(48,32.5).lineTo(-48,32.5).lineTo(-48,-32.5).lineTo(48,-32.5).closePath();

        this.shape_4 = new cjs.Shape();
        this.shape_4.graphics.beginLinearGradientFill(["#F0F09B","#EBECCC","#F2F289"],[0,0.502,1],45.1,-30.3,45.1,33.1).beginStroke().moveTo(-48,32.5).lineTo(-48,-32.5).lineTo(48,-32.5).lineTo(48,32.5).closePath().moveTo(4.6,-1.9).curveTo(4.6,3.2,8,6.7).curveTo(8.4,6.9,8.9,7.4).curveTo(12.2,10.2,16.8,10.3).curveTo(21.7,10.3,25.2,6.7).curveTo(28.5,3.2,28.5,-1.9).curveTo(28.5,-6.8,25.2,-10.4).curveTo(24.3,-11.3,23.4,-11.8).curveTo(20.5,-13.7,16.8,-13.7).curveTo(11.8,-13.6,8,-10.4).curveTo(4.6,-6.8,4.6,-1.9).lineTo(4.6,-1.9).closePath().moveTo(8.9,7.4).curveTo(8.4,6.9,8,6.7).curveTo(4.6,3.2,4.6,-1.9).curveTo(4.6,-6.8,8,-10.4).curveTo(11.8,-13.6,16.8,-13.7).curveTo(20.5,-13.7,23.4,-11.8).lineTo(8.9,7.4).lineTo(23.4,-11.8).curveTo(24.3,-11.3,25.2,-10.4).curveTo(28.5,-6.8,28.5,-1.9).curveTo(28.5,3.2,25.2,6.7).curveTo(21.7,10.3,16.8,10.3).curveTo(12.2,10.2,8.9,7.4).closePath().moveTo(23.4,-11.8).lineTo(23.4,-11.8).closePath();

        this.shape_5 = new cjs.Shape();
        this.shape_5.graphics.beginFill().beginStroke("#FF0000").setStrokeStyle(2,1,1).moveTo(0.2,-11.9).curveTo(3.9,-11.9,6.8,-10.1).curveTo(7.8,-9.6,8.6,-8.8).curveTo(11.9,-5.1,11.9,-0.2).curveTo(11.9,4.8,8.6,8.3).curveTo(5.1,11.9,0.2,11.9).curveTo(-4.4,11.9,-7.7,9.1).curveTo(-8.2,8.6,-8.6,8.3).curveTo(-12,4.8,-12,-0.2).curveTo(-12,-5.1,-8.6,-8.8).curveTo(-4.8,-11.9,0.2,-11.9).closePath().moveTo(6.8,-10.1).lineTo(-7.7,9.1);
        this.shape_5.setTransform(16.6,-1.6);

        this.shape_6 = new cjs.Shape();
        this.shape_6.graphics.beginLinearGradientFill(["#888888","#E9EAEB","#989898"],[0,0.302,1],28.5,-28.6,28.5,34.8).beginStroke().moveTo(-7.6,9.1).lineTo(6.8,-10.1).lineTo(-7.6,9.1).curveTo(-8.1,8.6,-8.5,8.3).curveTo(-12,4.9,-12,-0.2).curveTo(-12,-5.1,-8.5,-8.8).curveTo(-4.8,-11.9,0.2,-11.9).curveTo(3.9,-11.9,6.8,-10.1).curveTo(7.8,-9.6,8.6,-8.8).curveTo(12,-5.1,12,-0.2).curveTo(12,4.9,8.6,8.3).curveTo(5.1,11.9,0.2,11.9).curveTo(-4.4,11.9,-7.6,9.1).closePath();
        this.shape_6.setTransform(16.6,-1.6);

        this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape},{t:this.instance}]}).to({state:[{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.instance}]},1).to({state:[{t:this.shape_6},{t:this.shape_5},{t:this.instance}]},1).wait(1));

        // Layer 4
        this.instance_1 = new tutorialShellLib.buttondown();
        this.instance_1.setTransform(0.1,0.1,1,1,0,0,0,48,32.5);
        this.instance_1._off = true;

        this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(2).to({_off:false},0).wait(1));

        // Layer 3
        this.instance_2 = new tutorialShellLib.buttonup();
        this.instance_2.setTransform(0.1,0.1,1,1,0,0,0,48,32.5);

        this.timeline.addTween(cjs.Tween.get(this.instance_2).to({_off:true},1).wait(2));

    }).prototype = p = new cjs.MovieClip();
    p.nominalBounds = new cjs.Rectangle(-47.9,-32.4,96,64.9);


    (tutorialShellLib.controlVersion = function() {
        this.initialize();

        // version content Control9
        this.contentVersion9 = new tutorialShellLib.contentVersion9();
        this.contentVersion9.setTransform(576,22.7);

        // version content Control8
        this.contentVersion8 = new tutorialShellLib.contentVersion8();
        this.contentVersion8.setTransform(576,22.7);

        // version content Control7
        this.contentVersion7 = new tutorialShellLib.contentVersion7();
        this.contentVersion7.setTransform(576,22.7);

        // version content Control6
        this.contentVersion6 = new tutorialShellLib.contentVersion6();
        this.contentVersion6.setTransform(576,22.7);

        // version content Control5
        this.contentVersion5 = new tutorialShellLib.contentVersion5();
        this.contentVersion5.setTransform(576,22.7);

        // version content Control4
        this.contentVersion4 = new tutorialShellLib.contentVersion4();
        this.contentVersion4.setTransform(576,22.7);

        // version content Control3
        this.contentVersion3 = new tutorialShellLib.contentVersion3();
        this.contentVersion3.setTransform(576,22.7);

        // version content Control2
        this.contentVersion2 = new tutorialShellLib.contentVersion2();
        this.contentVersion2.setTransform(576,22.7);

        // version content Control1
        this.contentVersion1 = new tutorialShellLib.contentVersion1();
        this.contentVersion1.setTransform(576,22.7);

        // version content Control0
        this.contentVersion0 = new tutorialShellLib.contentVersion0();
        this.contentVersion0.setTransform(576,22.7);

        this.addChild(this.contentVersion0,this.contentVersion1,this.contentVersion2,this.contentVersion3,this.contentVersion4,this.contentVersion5,this.contentVersion6,this.contentVersion7,this.contentVersion8,this.contentVersion9);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(566.4,18.8,19.1,6.6);


    (tutorialShellLib.TutorialTimelineControllerGraphic = function() {
        this.initialize();

        // version Control
        this.versionControl = new tutorialShellLib.controlVersion();
        this.versionControl.setTransform(576,22.1,1,1,0,0,0,575.9,22.1);

        // play Head
        this.playHeadButton = new tutorialShellLib.scrubberHead();
        this.playHeadButton.setTransform(99.6,8.6,1,1.181);

        // track bar
        this.trackBar = new tutorialShellLib.trackBar();
        this.trackBar.setTransform(98.7,8.7,1,1.375);

        // scrubber Bar
        this.baseBar = new tutorialShellLib.scrubBar();
        this.baseBar.setTransform(98.8,8.7,0.896,2.6,0,0,0,-0.9,2.5);

        // btn Rewind
        this.btnRewind = new tutorialShellLib.rewindbutton();
        this.btnRewind.setTransform(64.5,8.6,0.28,0.229);
        new cjs.ButtonHelper(this.btnRewind, 0, 1, 2);

        // btn Mute
        this.btnMute = new tutorialShellLib.mutebutton();
        this.btnMute.setTransform(573.2,8.6,0.28,0.229);
        new cjs.ButtonHelper(this.btnMute, 0, 1, 2);

        // btn UnMute
        this.btnUnmute = new tutorialShellLib.Unmutebutton();
        this.btnUnmute.setTransform(573.2,8.6,0.28,0.229);
        new cjs.ButtonHelper(this.btnUnmute, 0, 1, 2);

        // btnPause2
        this.btnPause = new tutorialShellLib.pausebutton();
        this.btnPause.setTransform(21.5,8.6,0.28,0.229);
        new cjs.ButtonHelper(this.btnPause, 0, 1, 2);

        // btnPlay2
        this.btnPlay = new tutorialShellLib.playbutton();
        this.btnPlay.setTransform(21.5,8.6,0.28,0.229);
        new cjs.ButtonHelper(this.btnPlay, 0, 1, 2);

        // bar
        this.barGraphic = new tutorialShellLib.bar();
        this.barGraphic.setTransform(0,8.6,2.816,0.818);

        this.addChild(this.barGraphic,this.btnPlay,this.btnPause,this.btnUnmute,this.btnMute,this.btnRewind,this.baseBar,this.trackBar,this.playHeadButton,this.versionControl);
    }).prototype = p = new cjs.Container();
    p.nominalBounds = new cjs.Rectangle(0,0,600,25.4);

})(tutorialShellLib = tutorialShellLib||{}, images = images||{}, createjs = createjs||{});
var tutorialShellLib, images, createjs;