//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
/**
 * Build a similar slideshow using SoundManager2 because we cannot support
 * video and we have to support IE8.  Flash audio is a very async, flaky and
 * slow process.   Events do not work cleanly, so you have to depend on SM2
 * events to know if anything is actually working.
 *
 * Provide TDS.slide.Tags if you need to override the existing ARIA information
 */
(function(){
  var SM = soundManager;
  var TDS = window.TDS || {};
  /**
   * Slideshow helper methods that deal with dom scans and creating the initial
   * set of widgets.   Could also kick off an additional browser on page ready
   * scan which might simplify the creation of the widgets.
   */
  var slide = {
    id: 0,             //Slide sequence ids
    Store: {},         //A lookup for slide instances 
    Config: {          //Fixed configuration
      TimerMove: 1000  //How often to allow ui elements to update.
    },
    Tags: TDS.AriaSlideTags || { //Accessiblity
      Play: 'Play Slideshow',
      Stop: 'Pause Slideshow',
      Prev: 'Previous Slide',
      Next: 'Next Slide'
    }
  };
    
  function createEvent() {
      return new Util.Event.Custom(this);
  }
  slide.onPlay = createEvent();
  slide.onIdle = createEvent();

  slide.scan = function(domOrId){ //Looks in dom or page for slideshows to be parsed
    dom = typeof domOrId == 'string' ? document.getElementById(domOrId) : domOrId;
    dom = dom && dom.querySelectorAll ? dom : document.body; 
    return dom.querySelectorAll('.slides_config');
  };
  slide.build = function(domOrId){//Builds a new slideshow given the dom element with the slides
    var domOrIds = typeof domOrId == 'string' ? [domOrId] : domOrId;
    var built = [];
    for(var i = 0; i < domOrIds.length; ++i){
      var d = domOrIds[i];
      d = typeof d == 'string' ? document.getElementById(d) : d;
      if(!d || !d.className || d.className.match('slides_parsed')) {
        continue;
      }
      var conf = slide.parseConfig(d);
      //console.log("Building a slideshow with these elements.", conf);
      built.push(new slide.Show(conf));
    }
    return built;
  };
  slide.parseConfig  = function(container){//find the slides container and audio
    if(!container) return;
    return {
      container: container,
      audio: container.querySelector('.slides_audio'),
      slides: container.querySelectorAll('.slide')
    };
  };
  slide.scanAndBuild = function(domOrId){//Look for slides & build the shows
    var build = slide.scan(domOrId);
    if(build.length){
      return slide.build(build);
    }
  };
  slide.pauseAll = function(){
    try{
      var store = slide.Store;
      for (var i in store){
        var s = store[i];
        s.pauseBtnClick();
      }
    }catch(e){
      console.error("Failed to pause all the slideshows.", e);
    }
  };

  /** 
   * Helpful creation from MathJax (replace with YUI2 as needed)
   */
  slide.Element = function (type,def,contents) {//Creates a new dom element
    var obj = document.createElement(type);
    if (def) {
      if (def.style) {
        var style = def.style; def.style = {};
        for (var id in style) {if (style.hasOwnProperty(id))
          {def.style[id.replace(/-([a-z])/g,this.ucMatch)] = style[id]}}
      }
      slide.Insert(obj,def);
    }
    if (contents) {
      if (!(contents instanceof Array)) {contents = [contents]}
      for (var i = 0; i < contents.length; i++) {
        if (contents[i] instanceof Array) {
          obj.appendChild(slide.Element(contents[i][0],contents[i][1],contents[i][2]));
        } else {
          obj.appendChild(document.createTextNode(contents[i]));
        }
      }
    }
    return obj;
  };
  slide.addElement = function (el,type,def,contents) { //Adds the Element to target element
    return el.appendChild(slide.Element(type,def,contents))
  };
  slide.ucMatch = function (match,c) {//Simply helper for upper case match
    return c.toUpperCase()
  };
  slide.Insert = function (dst,src) { //Inserts the properties into a created element
     for (var id in src) {if (src.hasOwnProperty(id)) {
       // allow for concatenation of arrays?
       if (typeof src[id] === 'object' && !(src[id] instanceof Array) &&
          (typeof dst[id] === 'object' || typeof dst[id] === 'function')) {
         this.Insert(dst[id],src[id]);
       } else {
         dst[id] = src[id];
       }
     }}
     return dst;
   };


  /**
   *  The slideshow widget represents a single slideshow of audio tied
   *  to the dom elements you want to show.   Nothing fancy, just 
   *  data-begin on some div elements tied to audio timestamps.
   */
  var S = function(args){
    this.id = 'slideshow' + (++(slide.id));
    this.intervals = []; //How many slides, what times
    this.pointer   = 0;  //Where are we now?
    this.slides    = []; //ref to the slides
    if(args){
      this.init(args);
    }
    slide.Store[this.id] = this;
  };
  S.prototype.init = function(args){ //Build a new slideshow (used to be pretty jQuery)
      try {
        this.container = args.container;
        this.audio     = args.audio;
        this.slides    = args.slides;

        this.initSlideVisibility(this.slides);
        this.initSoundManager(this.audio);

        if(!this.sm){
          //TODO: Fatal out the page if we determine slideshow failure = death.
          return;
        }
        this.container.id = this.id; //For Aria controls
        this.bindSlideToSound(this.sm, this.intervals, this.slides);
        YAHOO.util.Dom.removeClass(this.container, 'hidden');

        //We are not using HTML5 audio because of IE8, but in the future...
        this.createControls(this.audio);
        this.audio.parentNode.removeChild(this.audio);
      } catch (e) {
        console.error("Failed to hide?", e);
      }finally{ //Ensures we don't parse the same dom 2x
        YAHOO.util.Dom.addClass(this.container, 'slides_parsed');
      }
  };

  S.prototype.stopEvt = function(evt){ //Prevent an event from bubbling up (form submission prevented)
     evt = evt || window.event;
     if(evt){
       YAHOO.util.Event.stopEvent(evt);
     }
  };

  S.prototype.initSlideVisibility = function(slides) { //Should discard any element from the slides
       slides = slides || this.slides;
       if(!slides || !slides.length ) return;
       for(var i = 0; i < slides.length; ++i){
         var s = slides[i];
         if(s){
           YAHOO.util.Dom.addClass(s, 'hidden');
         }
         var t = s.getAttribute('data-begin');
         if (!isNaN(t)) {
             if (t.length === 6) {  // if the data-begin in format of 'hhmmss' (not accurate enough, but length of time string is the only thing we can use right now)
                 var tHour = parseInt(t.substr(0, 2)),
                     tMin = parseInt(t.substr(2, 2)),
                     tSec = parseInt(t.substr(4, 2));
                 if (tHour <= 23 && tMin <= 59 && tSec <= 59) { //data-begin value make sense for hhmmss format
                     t = tHour * 3600 + tMin * 60 + tSec * 1;  //convert 'hhmmss' to seconds
                 }
             } else {
                 console.log('The data-begin attribute is not in hhmmss format.');
             }
           this.intervals.push(t * 1000);
         }
       }
       YAHOO.util.Dom.removeClass(slides[0], 'hidden');
       console.log("Slideshow intervals.", this.intervals);
   };

   S.prototype.initSoundManager = function(audio){ //Initialize the soundManager object
     audio   = audio || this.audio;
     this.sm = null;
     if(audio) {
       for(var i = 0; i < audio.children.length; ++i){
         var source = audio.children[i];
         var src    = source.src ? decodeURIComponent(source.src) : null;
         if(src && SM.canPlayURL(src)){ //Doesn't always seem to work correctly?
           this.sm = SM.createSound({
             id: this.id, 
             url: src,
             whileplaying: this.audioMoveSlider.bind(this)
           });
           if(this.sm){
             this.sm.load();
             break;
           }
         }
       }
     }
     if(!this.sm){
       console.error("The sound was NOT initialized correctly, no sound.", audio, this.sm);
     }
     return this.sm;
   };

   S.prototype.bindSlideToSound = function(sm, intervals, slides){ //Bind each slide to audio times
     sm       = sm        || this.sm;
     intevals = intervals || this.intervals;
     slides   = slides    || this.slides;
     if(!sm || !intervals || !slides) return;

     for(var i = 0; i < intervals.length; ++i){
       var t = intervals[i];
     }
   };

   S.prototype.createControls = function(insertBefore){ //Create the hacky html controls 
      insertBefore = insertBefore || this.audio;

      //Insert a slide bar into the controls container.
      var main = slide.Element('span', {
        className: 'slide_controls_contain'
      });
      main.setAttribute('aria-controls', this.id);
        

      this.prevBtn = slide.addElement(main, 'button', {
        className: 'slide_controls_btn slide_controls_prev_btn',
        type: 'button', onclick: this.prev.bind(this)
      }, '<');
      this.prevBtn.setAttribute('aria-label', slide.Tags.Prev);

      this.playBtn = slide.addElement(main, 'button', {
        className: 'slide_controls_btn slide_controls_play_btn',
        type: 'button', onclick:  this.playBtnClick.bind(this)
      }, '►');
      this.playBtn.setAttribute('aria-label', slide.Tags.Play);

      this.pauseBtn = slide.addElement(main, 'button', {
        className: 'slide_controls_btn slide_controls_stop_btn hidden',
        type: 'button', onclick: this.pauseBtnClick.bind(this)
      }, '❚❚');
      this.pauseBtn.setAttribute('aria-label', slide.Tags.Stop);

      this.nextBtn = slide.addElement(main, 'button', {
        className: 'slide_controls_btn slide_controls_next_btn',
        type: 'button', onclick: this.next.bind(this)
      }, '>');
      this.nextBtn.setAttribute('aria-label', slide.Tags.Next);

      var sliderDom = this.createSlider();
      main.appendChild(sliderDom);
      //Add into the dom.
      this.container.insertBefore(main, insertBefore);
   };

   S.prototype.createSlider = function(dom){ //Create the YUI2 slider to control the audio
     var maxWidth = 190;
     var d   = slide.Element('div', {
       className: 'slide_controls_slider yui-h-slider',
       style: {width: maxWidth + 'px'}
     });

     try{
       var idBg  = 'slider_bg_' + this.id;
       var idImg = 'slider_image_' + this.id;

       //TODO: Remove fixed height
       var bg  = slide.addElement(d, 'div'  , {id: idBg, className: 'slide_controls_slider_bg'});
       var img = slide.addElement(bg, 'span' , {
         id: idImg, 
         className: 'slide_controls_img'
       });

       var slider   = YAHOO.widget.Slider.getHorizSlider(idBg, idImg, 0, maxWidth);
       slider.maxWidth = maxWidth;
       this.slider = slider;
       this.subscribeAll(this.slider);
     } catch(e){
       console.error('Failed to create a slider?', e);
     }
     return d;
   };

   S.prototype.subscribeAll = function(slider){
       slider.subscribe('change', this.sliderChange.bind(this));
       slider.subscribe('slideEnd', this.sliderEnd.bind(this));
   };

   S.prototype.sliderEnd = function(evt){ //End of a slider move
      if(this.slider.valueChangeSource == 1){//Drag vs setValue event.
        if(this.offset == null){
          return;
        }
        var change = (this.offset / this.slider.maxWidth);
        var time   = this.sm.durationEstimate * change;
        this.setPosition(time);
      }
   };

   S.prototype.lock = function(){ //Prevent audio from constantly updating every 10ms
     this.SliderMove = true; 
   };
   S.prototype.unlock = function(immediate){ //Unlock the slideshow, note this is not instant to deal with flash lag
      if(!this.unlockCb){
         this.unlockCb = function(){
           this.unlockCb = null;
           this.SliderMove = false;
         }.bind(this);
         if(!immediate){
           setTimeout(this.unlockCb, slide.Config.TimerMove);
         }else{
           this.unlockCb();
         }
      }
   };
   S.prototype.isLocked = function(){//Should the slider currently be locked from audio updates.
     return this.SliderMove;
   };

   S.prototype.sliderChange = function(offset){ //Slider changes
     try{
         this.lock();
         if(this.slider.valueChangeSource == 1){ //True if the user moved the slider.
           this.offset = offset;
         }else{
           this.offset = null;
         }
     }catch(e){
        console.error("Failed to slider change the position of the audio.", e); 
     }
     this.unlock();
   };


   S.prototype.setPauseCb = function(cb){ //This is required so that a play does not happen before pause is done
     this.audioPauseCb = cb;
   };

   S.prototype.audioPause = function(time){ //Called when the audio is paused
     if(typeof this.audioPauseCb == 'function'){
       try{
        this.audioPauseCb();
       }catch(e){
         console.error("Failed to run the audio callback.", e);
       }
       this.audioPauseCb = null;
     }
   };

   S.prototype.audioMoveSlider = function(time){//Move the slider as the audio changes.
     if(this.isLocked()) return;
     try{
       time     = time || this.sm.position || this.time;
       var pos  = this.slider.maxWidth * (this.sm.position / this.sm.durationEstimate);
       this.slider.setValue(Math.floor(pos));
       this.setSlideByTime(time);
     }catch(e){
       console.error("Failed to move the slider.", e);
     }
   };

   S.prototype.playBtnClick = function(evt, time){//Play and show the pause btn
    try{
      this.play(time);
      this.stopEvt(evt || window.event); 

      YAHOO.util.Dom.removeClass(this.pauseBtn, 'hidden');
      YAHOO.util.Dom.addClass(this.playBtn, 'hidden');
    } catch(e){
      console.error("Failed to start play.", e);
    }
   };

   S.prototype.pauseBtnClick = function(evt, cb){ //Pause audio and show the play button
    try {
      this.pause(cb);
      this.stopEvt(evt || window.event); 


      YAHOO.util.Dom.removeClass(this.playBtn, 'hidden');
      YAHOO.util.Dom.addClass(this.pauseBtn, 'hidden');
    }catch(e){
      console.error("Failed to pause the audio.", e);
    }
   };

   S.prototype.next = function(evt) {//Next slide & set the audio position
     try{
       this.stopEvt(evt);
       var index = this.getSlideIndexByTime(this.sm.position);
       if ((index+1) < this.slides.length) {
         var t = this.intervals[index+1];
         this.setPosition(t);
       }
     }catch(e){
       console.error("Failed to set position again?", e);
     }
   };
   S.prototype.prev = function(evt) { //set audio time as well as slide index
     try{
       this.stopEvt(evt);
       var index = this.getSlideIndexByTime(this.sm.position);
       if ((index-1) >= 0) {
         this.setPosition(this.intervals[index-1]);
       }
     }catch(e){
       console.error("Failed to set the previous position.", e);
     }
   };


   S.prototype.setPosition = function(time){ //Sets the position of the audio
     time = !isNaN(time) && time != null ?  time : (this.time || this.sm.position);
     try{
        //Will be called once the audio actually stops.
        time = Math.ceil(time);

        //If you attempt to play at a different location without first waiting for the pause
        //event to complete, SM2 and the flash buffer seeks will _not_ play nice.
        var playAtPosition = function(time){
          this.lock();
          this.time = time;
          this.setSlideByTime(time);
          this.sm.setPosition(time);
          
          this.playBtnClick(null, time);
          this.unlock();
       }.bind(this, time);

       this.pause(playAtPosition); //You have to wait till the audio is fully paused to set posotion
     }catch(e){
       console.error("Failed to setPosition on the slider.", e);
     }
   };
   S.prototype.getSlideIndexByTime = function(t){//Calculate the current slide index based on time
     var len = this.intervals.length
     for (var i=1; i < len; ++i){
       if(t <= this.intervals[i]){
         return i-1; 
       }
     }
     return len-1;
   };

   S.prototype.setSlideByTime = function(t) { //Sets the slide based on a time interval
     this.setSlide(this.getSlideIndexByTime(t));
   };
   S.prototype.hideAll = function(exceptAtIndex) { //Hide all the slides
     try {
       for(var i = 0; i < this.slides.length; ++i) {
         if(exceptAtIndex != null && i != exceptAtIndex){
           YAHOO.util.Dom.addClass(this.slides[i], 'hidden');
         }
       }
     } catch (e) {
       console.error("Failed to hide all the slides.", e);
     }
   };

   S.prototype.setSlide = function(index) { //Set the slide we are on (does _NOT_ move audio)
     if(index != this.position){
       this.position = index;
       this.hideAll(index);
       YAHOO.util.Dom.removeClass(this.slides[index], 'hidden');
     }
   };


   S.prototype.resetAudio = function(){//Get the audio ready to play again.
     try{
       var timeH = 1000;
       this.unlock(true);
       this.sm.setPosition(timeH);
       this.audioMoveSlider(timeH);
       this.time = timeH;
     }catch(e){
       console.error("Failed to reset the audio.", e);
     }
   };

   S.prototype.onFinish = function(){ //Called when finished to reset the UI
     this.pauseBtnClick(null, this.resetAudio.bind(this));
     slide.onIdle.fire();
   };

   S.prototype.play = function(time) { //Play the slideshow
     try{
       time = !isNaN(time) && time != null ? time : (this.time || this.sm.position || 0);
       this.sm && this.sm.play({
         position: time,  //The time to actually start the audio
         onpause: this.audioPause.bind(this), //Must be assigned on initial play
         whileplaying: this.audioMoveSlider.bind(this), //same thing
         onfinish: this.onFinish.bind(this)
       });
       slide.onPlay.fire();
     }catch(e){
       console.error("Failed to play the file.", e);
       slide.onIdle.fire();
     }
   };
   S.prototype.pause = function(cb) { //Pause the audio (flaky in flash)
     if(!this.sm.paused && this.sm.playState){ //If played, and not paused.
       this.setPauseCb(cb);
       this.sm && this.sm.pause();
       slide.onIdle.fire();  
     }else if(typeof cb == 'function'){
        cb(); 
     }
   };

   window.slide      = slide; //Namespace it globally now
   window.slide.Show = S;     //Define window.slide.Show... I guess
})();
