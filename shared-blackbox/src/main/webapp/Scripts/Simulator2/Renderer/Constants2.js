
/**
 * ***********************************************************************************
 * @class Constants
 * @abstract - no instance 
 * @superclass none
 * @return Nothing
 * The Constants class consists only of class variables which are constants
 * They must be UPPERCASE since JavaScript has no real constant type.
 * Since they are constants, there is no point in making it a concrete class
 * Note: All of the variables defined are global and their values must not be changed!
 **************************************************************************************
 */
Simulator.Constants = function() {};

// Class variables
Simulator.Constants.HIDDEN = false;
Simulator.Constants.VISIBLE = true;
Simulator.Constants.SUCCESS = 1;
Simulator.Constants.NONE = 0;
Simulator.Constants.FAILURE = -1;
Simulator.Constants.YES = 1;
Simulator.Constants.NO = 0;
Simulator.Constants.SIM_CONTAINER_NAME = 'container';
Simulator.Constants.TIME_BASED_ANIMATION = 'timeline';
Simulator.Constants.INTERACTIVE_ANIMATION = 'interactive';
Simulator.Constants.STATIC_ANIMATION = 'static';
Simulator.Constants.INPUT_PANEL_NAME = 'inputPanel';
Simulator.Constants.ANIMATION_PANEL_NAME = 'animationPanel';
Simulator.Constants.DATA_DISPLAY_PANEL_NAME = 'dataOutputPanel';
Simulator.Constants.CONTROL_PANEL_NAME = 'controlElementsPanel';
Simulator.Constants.ITERATION_DELIMITTER = '\\0x1D\\';  // Use to be ';'
Simulator.Constants.KEY_VALUE_DELIMITTER = '\\0x1F\\';   // Use to be ':'
Simulator.Constants.PAIR_DELIMITTER = '\\0x1E\\';  // Use to be ','
Simulator.Constants.MULTIPLE_VALUE_DELIMITTER = '|';
Simulator.Constants.SPEECH_LABEL_PREFIX = 'Move To ';
Simulator.Constants.SPEECH_ITEM_VALUE_PREFIX = 'Select ';
Simulator.Constants.SPEECH_CMD_ITEM_PREFIX = 'Click ';
Simulator.Constants.ANIMATION_FINISHED = 'animationFinished';
Simulator.Constants.ANIMATION_STARTED = 'animationStarted';
Simulator.Constants.ANIMATION_THREAD_FINISHED = 'animationThreadFinished';
Simulator.Constants.ANIMATION_LOADED = 'animationLoaded';
Simulator.Constants.ANIMATION_REPORT_STATUS = 'reportStatus';
Simulator.Constants.ANIMATION_REPORTING = 'animationReporting';
Simulator.Constants.ANIMATION_UNRESPONSIVE = 'animationUnresponsive';
Simulator.Constants.ANIMATION_ABORTED = 'animationAborted';
Simulator.Constants.ANIMATION_UNABLE_TO_START = 'animationUnableToStart';
Simulator.Constants.ANIMATION_NOT_READY = 0;
Simulator.Constants.PARAM_COMMAND = 'command';
Simulator.Constants.PARAM_INFO = 'info';
Simulator.Constants.PARAM_DATA = 'data';
Simulator.Constants.PARAM_INPUT = 'input';
Simulator.Constants.PARAM_UPDATE = 'update';
Simulator.Constants.PARAM_OUTPUT = 'output';
Simulator.Constants.PARAM_DEBUG_OUTPUT = 'debug';
Simulator.Constants.PARAM_ERROR = 'error';
Simulator.Constants.PARAM_ALT_TEXT = 'altText';
Simulator.Constants.SET_ID_CMD = 'setID';
Simulator.Constants.PLAY_CMD = 'play';
Simulator.Constants.STOP_CMD = 'stop';
Simulator.Constants.REWIND_CMD = 'rewind';
Simulator.Constants.RESTART_CMD = 'restart';
Simulator.Constants.OUTPUT_REQ_CMD = 'outputRequest';
Simulator.Constants.ALT_TEXT_REQ_CMD = 'altTextRequest';
Simulator.Constants.INPUT_NAME_PART = 0;
Simulator.Constants.INPUT_VALUE_PART = 1;
Simulator.Constants.START_FRAME = 'startFrame';
Simulator.Constants.ANIMATION_COMPLETED = 'animationCompleted';
Simulator.Constants.ANIMATION_PLAYING = 'animationPlaying';
Simulator.Constants.ANIMATION_PAUSED = 'animationPaused';
Simulator.Constants.ANIMATION_STOPPED = 'animationStopped';
Simulator.Constants.ANIMATION_REWOUND = 'animationRewound';
Simulator.Constants.ANIMATION_READY = 'animationReady';
Simulator.Constants.ANIMATION_ERROR = 'animationError';
Simulator.Constants.ANIMATION_PROPERTIES = 'properties';
Simulator.Constants.GET_ANIMATION_PROPERTIES = 'properties';
Simulator.Constants.ANIMATION_ALIVE = 'alive';
Simulator.Constants.SIM_CALLBACK = 'Simulator.Animation.FlashAnimationInterface.AnimationMediaOutput';
Simulator.Constants.DEFAULT_INITIAL_TRIAL_NUM = 0;
Simulator.Constants.NO_DATA_INDICATOR = '';
Simulator.Constants.HTML5_ANIMATION = 'html5';
Simulator.Constants.FLASH_ANIMATION = 'flash';
Simulator.Constants.IMAGE_ANIMATION = 'image';
Simulator.Constants.HOTTEXT_ANIMATION = 'hotText';


