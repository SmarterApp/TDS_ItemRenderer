//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// fork getUserMedia for multiple browser versions, for those
// that need prefixes

navigator.getUserMedia = (navigator.getUserMedia ||
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia ||
                          navigator.msGetUserMedia);

// set up forked web audio context, for multiple browsers
// window. is needed otherwise Safari explodes

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var voiceSelect = document.getElementById("voice");
var source;
var stream;

// grab the mute button to use below

var mute = document.querySelector('.mute');

//set up the different audio nodes we will use for the app

var analyser = audioCtx.createAnalyser();
analyser.minDecibels = -90;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.85;

var gainNode = audioCtx.createGain();

var _tailNode = null;

// set up canvas context for visualizer

var canvas = document.querySelector('.visualizer');
var canvasCtx = canvas.getContext("2d");

var intendedWidth = document.querySelector('.wrapper').clientWidth;

canvas.setAttribute('width',intendedWidth);

var drawVisual;

//main block for doing the audio recording

function connectNode(headNode, tailNode) {
    source.disconnect();
    _tailNode && _tailNode.disconnect();
    
    headNode = headNode || analyser;
    _tailNode = tailNode || headNode;

    source.connect(headNode);
    _tailNode !== analyser && _tailNode.connect(analyser);
    _tailNode.connect(gainNode);
}

if (navigator.getUserMedia) {
   console.log('getUserMedia supported.');
   navigator.getUserMedia (
      // constraints - only audio needed for this app
      {
         audio: true
      },

      // Success callback
      function(stream) {
         source = audioCtx.createMediaStreamSource(stream);
         connectNode();
         gainNode.connect(audioCtx.destination);

      	 visualize();
         voiceChange();

      },

      // Error callback
      function(err) {
         console.log('The following gUM error occured: ' + err);
      }
   );
} else {
   console.log('getUserMedia not supported on your browser!');
}

function visualize() {
    WIDTH = canvas.width;
    HEIGHT = canvas.height;

    analyser.fftSize = 256;
    var bufferLength = analyser.frequencyBinCount;
    console.log(bufferLength);
    var dataArray = new Uint8Array(bufferLength);

    canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

    function draw() {
      drawVisual = requestAnimationFrame(draw);

      analyser.getByteFrequencyData(dataArray);

      canvasCtx.fillStyle = 'rgb(0, 0, 0)';
      canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

      var barWidth = (WIDTH / bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      for(var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        canvasCtx.fillStyle = 'rgb(' + (barHeight+100) + ',50,50)';
        canvasCtx.fillRect(x,HEIGHT-barHeight/2,barWidth,barHeight/2);

        x += barWidth + 1;
      }
    };

    draw();

}

function voiceChange() {
  var voiceSetting = voiceSelect.value;
  console.log(voiceSetting);

  if(voiceSetting == "hilopass") {
    var highpass = audioCtx.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 350;
    highpass.Q.value = -40;
    
    var lowpass = audioCtx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 3400;
    
    highpass.connect(lowpass);
    
    connectNode(highpass, lowpass);
  } else if (voiceSetting === 'bandpass') {
    var bandpass = audioCtx.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 2750;    // center of bandwidth
    bandpass.Q.value = 2;               // bandwidth inversely proportional to Q factor
    
    connectNode(bandpass);
  } else if(voiceSetting == "off") {
    console.log("Voice settings turned off");
    connectNode();
  }

}

voiceSelect.onchange = function() {
  voiceChange();
}

mute.onclick = voiceMute;

function voiceMute() {
  if(mute.id == "") {
    gainNode.gain.value = 0;
    mute.id = "activated";
    mute.innerHTML = "Unmute";
  } else {
    gainNode.gain.value = 1;
    mute.id = "";    
    mute.innerHTML = "Mute";
  }
}