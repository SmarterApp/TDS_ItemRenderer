Simulator.Animation.FlashAnimationInterface = {};

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