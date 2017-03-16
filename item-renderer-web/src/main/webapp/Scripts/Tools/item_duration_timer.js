function ItemDurationTimer () {};

ItemDurationTimer.startTimerForPage = function() {
    this.startTime = new Date();
};

ItemDurationTimer.getPageDuration = function () {
    if (this.startTime) {
        var duration = new Date().getTime() - this.startTime.getTime();
        delete this.startTime;
        return duration;
    } else {
        console.log("Timer has not been started for the current page. Cannot retrieve page duration.");
    }
};