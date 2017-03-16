
File Information
-----------------------------------------------------------------------------------------
This is an HTML slideshow using the SoundManager2 (SM2) library. 
http://www.schillmania.com/projects/soundmanager2/doc/#api

Since we have to provide support for audio in IE8, flash is the only real option.

The file in use in TDS is sm2-show.js.   show.js is provided as an example version using
jQuery in case we ever get to that point and HTML5 audio is acceptable.

The test directory contains a test for the jQuery version of the slideshow, and a pure 
YUI2 version of the slideshow.   



Code Structure (SM2 Only)
-----------------------------------------------------------------------------------------
In this case the SM2 slideshow will require a small amount of initialization (done in TDS) 
includes, and then will use module slideshow.js to actually run a scan of the dom on each
item load.


//A simple lookup table for all the class instances that are created
slide.Store = {'slideshow' + (++(slide.id)) : slide.Show instance}

//Used to look for the css classes that indicate a slideshow 
slide.scan

//Will scan, and then build a slideshow for each element found in the page.
slide.scanAndBuild

//The class instance for each slideshow that is built into the page.  A wrapper around
//an SM2 instance and a YUI widget along with some css helpers.
slide.Show 


Basically it looks in the page for a css class, grabs it.  Searches around for valid audio
to play and then hands that audio off to SM2.   Then creates some UI widgets and the next
prev logic that is required for displaying a slideshow.

