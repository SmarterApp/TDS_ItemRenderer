(function (audio) {

    function PlayerPlugin() {
        this._publicApi = [];
    }

    Object.defineProperties(PlayerPlugin.prototype, {
        publicApi: {
            get: function () {
                return this._publicApi;
            },
            enumerable: true, configurable: false
        }
    });

    PlayerPlugin.prototype.expose = function (name, publicName) {
        this.publicApi.push({
            plugin: this,
            name: name,
            publicName: publicName || name,
            isFunction: typeof this[name] === 'function'
        });
    };

    PlayerPlugin.prototype.initialize = function (player) {
        this.player = player;
    };

    PlayerPlugin.prototype.player = null;

    PlayerPlugin.prototype.onSoundCreated = function (source) {
    };

    PlayerPlugin.prototype.parseSource = function (element, source) {
    };

    // exports

    audio.PlayerPlugin = PlayerPlugin;

})(TDS.Audio);
