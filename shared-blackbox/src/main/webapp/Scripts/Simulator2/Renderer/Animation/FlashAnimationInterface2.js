//*******************************************************************************
// Educational Online Test Delivery System
// Copyright (c) 2015 American Institutes for Research
//
// Distributed under the AIR Open Source License, Version 1.0
// See accompanying file AIR-License-1_0.txt or at
// http://www.smarterapp.org/documents/American_Institutes_for_Research_Open_Source_Software_License.pdf
//*******************************************************************************
﻿Simulator.Animation.FlashAnimationInterface = {};

Simulator.Animation.FlashAnimationInterface.ObjectMapper = [];

Simulator.Animation.FlashAnimationInterface.GetInstance = function (simID) {
    return Simulator.Animation.FlashAnimationInterface.ObjectMapper[simID];
}

Simulator.Animation.FlashAnimationInterface.MapInstance = function (simObject) {
    Simulator.Animation.FlashAnimationInterface.ObjectMapper[simObject.getSimID()] = simObject;
}

Simulator.Animation.FlashAnimationInterface.AnimationMediaOutput = function (simID, type, data) {
    var simulator = Simulator.Animation.FlashAnimationInterface.GetInstance(simID);
    if(simulator)
        simulator.getAnimationSet().animationMediaOutput(simID, type, data);
}