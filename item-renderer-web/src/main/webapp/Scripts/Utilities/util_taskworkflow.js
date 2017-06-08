//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
// This class allows you to create a queue of ordered tasks that execute one after another until completed
// Inspiration: 
// https://github.com/tinyhippos/jWorkflow/
// http://tinyhippos.com/2010/09/15/jworkflow-a-javascript-workflow-framework/
Util.TaskWorkflow = function(globalContext)
{
    // collections of tasks to execute
    var _tasks = [];

    // the final callback when all tasks are complete
    var _callback = null;

    // the class that processes the tasks
    var _executer = (function()
    {
        var _stopped = false;

        return {

            wait: function()
            {
                _stopped = true;
            },

            resume: function(result)
            {
                var task;
                _stopped = false;

                // execute task functions
                if (_tasks.length > 0)
                {
                    task = _tasks.shift();
                    result = task.func.apply(task.context, [_executer, result, task.obj]);

                    if (!_stopped)
                    {
                        _executer.resume(result);
                    }
                }
                // execute completed callback
                else if (_callback && _callback.func)
                {
                    _callback.func.apply(_callback.context, [_callback.obj]);
                }
            },

            cancel: function()
            {
                _stopped = true;
                _tasks = [];
                _callback = null;
            }

        };
    } ());

    // add a task to the queue
    this.add = function(func, obj, overrideContext)
    {
        if (!YAHOO.lang.isFunction(func))
        {
            throw "expected function but was " + typeof (func);
        }

        var context = globalContext;

        if (overrideContext)
        {
            if (overrideContext === true) context = obj;
            else context = overrideContext;
        }

        _tasks.push({ func: func, context: context, obj: obj });
        return this;
    };

    // start processing all tasks
    this.start = function(func, context, obj)
    {
        context = context || globalContext;
        _callback = { func: func, context: context, obj: obj };
        _executer.resume();
    };
};

// a helper function for processing functions passed into arguments
Util.TaskWorkflow.process = function()
{
    var taskQueue = new Util.TaskWorkflow();

    for (var i = 0; i < arguments.length; i++)
    {
        taskQueue.add(arguments[i]);
    }

    taskQueue.start();
};

/*
TASK QUEUE SAMPLE:

var logNum = function(result)
{
    if (result == null) result = 1;
    console.log('task #' + result);
    return ++result; // <-- the result returned gets passed to the next task function
};

var logNumAsync = function(result, executer)
{
    executer.wait();

    setTimeout(function()
    {
        result = logNum(result);
        executer.resume(result); // <-- the result passed in resume() gets passed to the next task function
    }, 2000);
};

Util.TaskWorkflow.process(
    logNum,
    logNum,
    logNumAsync,
    logNum);

*/
