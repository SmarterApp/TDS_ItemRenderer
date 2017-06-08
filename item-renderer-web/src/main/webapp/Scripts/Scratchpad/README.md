
ScratchPad Overview http://zwibbler.com/api.html
================================================================================================
Scratchpad = Zwibbler

The scratchpad code is divided into a main control interface that handles basic boolean configuration
of tools, processing code, and state transition diff code.   Each element added applies a new
json diff object, and the end result is the current view.

The current plan for use in the application is simply as a notepad and an item type.  The notepad
idea is a single global instance(as of this writing).   The item type is a vague, screwy piece
of magic that has yet to be defined.

Zwibbler uses Canvas, so it is not going to work in IE8.

To build this file, simply get the Mercurial repo and run ./jzbuild.py, once compiled and tested
you can copy it into the CVS directory.

ScratchPad Plan
================================================================================================
 Create the scratchpad module scratchpad (associate with all the required YUD dialog cruft)
 Get all the dialogs working and popping up (just a YUD dialog on comment click)
 Produce an item type (because XML...) => Use XML to Json
 Create a scratchpad item type for test purposes.
 Load the scratchpad library without any compile errors


Scratchpad https://bugz.airast.org/kiln/Code/TDS-Student-Labs/Widgets/Scratchpad
================================================================================================
The HG repo will have any of the updated changes, what we will check into cvs is purely image
paths and the compiled information.

The actual code is _not_ created by AIR.  It is a modification of the code at


The main differences between our code and the main external repo is that their code has a 
lot of additional server side save code, sha1 hashes, crypto etc.   We use a simplified drawing
version of the zwibbler app.

Scratchpad Structure
================================================================================================

