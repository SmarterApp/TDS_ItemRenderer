(function (window, webAudio) {
    "use strict";

    function Playlist() {
        this._playlist = [];
        this._nextId = 0;
        this._currentIndex = -1;
    }

    Playlist.prototype.addTracks = function () {
        var tracks = Array.prototype.slice.call(arguments),
            i, id, track, name, duration;

        for (i = 0; i < tracks.length; ++i) {
            track = tracks[i];
            id = this._nextId++;

            track.id = id;
            track.name = track.name || ('Track ' + (id + 1));

            this._playlist.push(track);
        }

        if (this._currentIndex < 0 && this._playlist.length > 0) {
            this._currentIndex = 0;
        }
    };

    Playlist.prototype.setTrack = function (track) {
        if (!this.getTrack(track.id)) {
            this.addTracks(track);
        }

        var i;

        for (i = 0; i < this._playlist.length; ++i) {
            if (track === this._playlist[i]) {
                this._currentIndex = i;
                break;
            }
        }
    };

    Playlist.prototype.removeTracks = function () {
        var ids = Array.prototype.slice.call(arguments),
            i, track;

        for (i = 0; i < this._playlist.length; ++i) {
            track = this._playlist[i];

            if (ids.indexOf(track.id) !== -1) {
                this._playlist.splice(i, 1);

                if (this._currentIndex > i) {
                    --this._currentIndex;
                }

                --i;
            }
        }

        if (this._playlist.length === 0) {
            this._currentIndex = -1;
        }
    };

    Playlist.prototype.removeAllTracks = function () {
        var ids = this._playlist.map(function (track) {
            return track.id;
        });

        this.removeTracks.apply(this, ids);
    };

    Playlist.prototype.getTrack = function (id) {
        var matches = this._playlist.filter(function (track) {
            return track.id === id;
        });

        return matches.length ? matches[0] : null;
    };

    Playlist.prototype.getCurrentTrack = function () {
        if (this._currentIndex < 0) {
            return null;
        }

        return this._playlist.length ? this._playlist[this._currentIndex] : null;
    };

    Playlist.prototype.advanceTrack = function () {
        if (this._currentIndex < 0) {
            return null;
        }

        if (this._currentIndex === this._playlist.length - 1) {
            if (this.loop) {
                this._currentIndex = 0;
            } else {
                return null;
            }
        } else {
            ++this._currentIndex;
        }

        return this.getCurrentTrack();
    };

    // exports
    webAudio.Playlist = Playlist;

})(window, window.webAudio);
