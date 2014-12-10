(function (audio) {

    var _tracks = {};

    var _allowedKinds = ["subtitles", "captions", "descriptions", "captions", "metadata", "chapters"]; // WHATWG SPEC

    // a stand-in for an HTMLMediaElement (<video> or <audio>)
    function VirtualMediaContainer() {
        this.currentTime = 0;
        var timeupdateEventHandlers = [];

        this.addEventListener = function (event, handler, ignore) {
            if (event === "timeupdate" && handler instanceof Function) {
                timeupdateEventHandlers.push(handler);
            }
        };

        this.updateTime = function (newTime) {
            if (!isNaN(newTime)) {
                this.currentTime = newTime;
                timeupdateEventHandlers.forEach(function (handler) {
                    handler();
                });
            }
        };

        this._captionatorOptions = {
            processCueHTML: false
        };
    };

    VirtualMediaContainer.prototype.addTextTrack = function (id, kind, label, language, src, isDefault) {

        var newTrack;
        id = typeof (id) === "string" ? id : "";
        label = typeof (label) === "string" ? label : "";
        language = typeof (language) === "string" ? language : "";
        isDefault = typeof (isDefault) === "boolean" ? isDefault : false; // Is this track set as the default?

        // If the kind isn't known, throw DOM syntax error exception
        if (!_allowedKinds.indexOf(kind) === -1) {
            throw new Error("DOMException 12: SYNTAX_ERR: You must use a valid kind when creating a TimedTextTrack.");
        } else {
            newTrack = new captionator.TextTrack(id, kind, label, language, src, isDefault);
            if (newTrack) {
                if (!(this.textTracks instanceof Array)) {
                    this.textTracks = [];
                }

                this.textTracks.push(newTrack);
                newTrack.videoNode = this;
                return newTrack;
            } else {
                return false;
            }
        }
    };

    // by default, captionator wants to render cues as HTML on its own, and there is no way to override this with some parameter
    // so, we just override the function which does the rendering with our own render function
    captionator.rebuildCaptions = function () {
    };

    function ClosedCaptioningPlugin() {
        ClosedCaptioningPlugin.superclass.constructor.call(this);

        this.expose('getTextTracks');
        this.expose('onAddTrack');
    }

    YAHOO.lang.extend(ClosedCaptioningPlugin, audio.PlayerPlugin);

    ClosedCaptioningPlugin.prototype.parseSource = function (element, source) {
        var haveTextTrack = false;

        if (element instanceof HTMLAudioElement) {

            source.tracks = Array.prototype.map.call(element.getElementsByTagName('track'), function (track) {
                return {
                    src: track.src,
                    kind: track.kind,
                    lang: track.srclang,
                    label: track.label,
                    isDefault: track.default
                };
            });

        } else if (element instanceof HTMLAnchorElement && element.getAttribute('texttrack') !== null) {

            source.tracks = [{
                src: source.url.replace(/(file=\w+.)(?:\w+)/, '$1vtt'),
                kind: 'captions',
                lang: 'en',
                label: 'Captions',
                isDefault: true
            }];

            // TODO: figure out where in the item content the text track URL is going to be
        } else {

            source.tracks = [];
            console.warn('TDS.Audio.ClosedCaptioningPlugin: invalid item source element');

        }
    };

    ClosedCaptioningPlugin.prototype.onSoundCreated = function (id, source) {
        if (!source.tracks.length) {
            return;
        }

        var media = new VirtualMediaContainer(),
            player = this.player,
            self = this;

        var tracks = source.tracks.map(function (track, i) {
            return media.addTextTrack(id + '_track' + i, track.kind, track.label, track.lang, track.src, track.isDefault);
        });

        tracks.forEach(function (track) {

            // WARNING:
            // modifying track before the loadTrack callback is invoked may cause the text track to be XHR'd twice
            // this can result in extra bandwidth use and (even worse) duplicate cues in the track cue list

            track.loadTrack(track.src, function (cues) {

                var track = this;

                track.mode = track.default ? captionator.TextTrack.SHOWING : captionator.TextTrack.HIDDEN;

                // update the virtual media's time
                player.onTimeUpdate[id].subscribe(function (time) {
                    media.updateTime(time);
                });

                // when the media's time changes, update the active cues
                media.addEventListener('timeupdate', function () {
                    // update active cues
                    try {
                        track.activeCues.refreshCues();
                    } catch (error) { }
                });

                self.onAddTrack.fire(track);

            });

        });

        _tracks[id] = tracks;
    };

    ClosedCaptioningPlugin.prototype.getTextTracks = function (id) {
        return _tracks[id] || [];
    };

    ClosedCaptioningPlugin.prototype.onAddTrack = new Util.Event.Custom();

    audio.Player.register(new ClosedCaptioningPlugin());

})(TDS.Audio);
