slide = {};
slide.Show = function(audioId, slideId, containerId) {
  this.contId  = $('#' + containerId);
  this.audioId = $('#' + audioId);
  this.slideId = $('#' + slideId);

  this.intervals = []; //How many slides, what times
  this.pointer   = 0;  //Where are we now?
  this.slides    = []; //ref to the slides
  this.init();

};
$.extend(slide.Show.prototype, {
  init: function() {
    try {
      this.initSlideVisibility();

      this.audioId.bind('play', this.play.bind(this));
      this.audioId.bind('pause', this.pause.bind(this));
      this.audioId.bind('timeupdate', this.timeupdate.bind(this));

      //this.addButtons();
    } catch (e) {
      console.error("Failed to hide?", e);
    }
  },
  addButtons: function() {
    try {
        this.contId.append(
          $('<button>', {text: '<', click: this.prev.bind(this), alt: 'Previous Slide' }),
          $('<button>', {text: '>', click: this.next.bind(this), alt: 'Next Slide' })
        );
    } catch (e) {
      console.error("Failed to create slideshow.", e);
    }
  },
  initSlideVisibility: function() { //Should discard any element from the slides
      var intervals = this.intervals;
      var slides    = this.slides;
      var c = this.slideId.children()
          c.each(function(i) {
            var e = $(this).hide();
            if (i != 0) {
              e.hide(); 
            } else {
              e.show();
            }
            var t = e.attr('t');
            if (!isNaN(t)) {
              intervals.push(t); 
              slides.push(this);
            }
          });
      this.slideId.removeClass("hidden");
      console.log(this.slides, this.intervals);
  },
  timeupdate: function(t) {
    //Check current interval
    this.setSlideByTime(this.audioId.get(0).currentTime);
  },
  next: function() {
    if (this.pointer < this.slides.length) {
      this.setSlide(++this.pointer);
      this.audioId.get(0).currentTime = this.intervals[this.pointer] || 0;
    }
  },
  prev: function() {
    //set audio time as well as slide index
    if (this.pointer - 1 >= 0) {
      this.setSlide(--this.pointer);
      this.audioId.get(0).currentTime = this.intervals[this.pointer] || 0;
    }
  },
  current: function() {
    return this.pointer;
  },
  setSlideByTime: function(t) {
    var curTime = this.intervals[this.pointer];
    if (t < curTime && this.pointer) { //The user probably clicked around the audio a bit.
      for (var i = this.pointer; i >= 0; --i) {
        if (this.intervals[i] > t) {
        } else {
          this.setSlide(i);
          return;
        }
      }
    } else {
      for (var i = this.pointer; i < this.slides.length; ++i) {
        if (this.intervals[i] && t > this.intervals[i] && this.pointer != i) {
          this.pointer = i;
          this.setSlide(i);
          return;
        }
      }
    }
  },
  hideAll: function() {
    try {
      for(var i = 0; i < this.slides.length; ++i) {
        $(this.slides[i]).hide();
      }
    } catch (e) {
      console.error("Failed to hide all the slides.", e);
    }
  },
  setSlide: function(index) {
    this.pointer = index;
    this.hideAll();
    var s = $(this.slides[index]).show();
  },
  play: function() {
    //In case we care for some reason...
  },
  pause: function() {
    //called on audio pause (we again don't really care yet)
  }
});
