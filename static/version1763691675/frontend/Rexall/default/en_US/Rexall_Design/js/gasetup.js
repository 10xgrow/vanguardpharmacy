define(function() {
    var window = this || (0, eval)('this');

    window.GoogleAnalyticsObject = '__ga__';
    window.__ga__ = function() {
        for (var i = 0; i < arguments.length; i++) {
            var arg = arguments[i];
            if (arg.constructor == Object && arg.hitCallback) {
                arg.hitCallback();
            }
        }
    };
    window.__ga__.q = [
        ['create', 'UA-3955111-1', 'auto']
    ];
    window.__ga__.l = Date.now();
});