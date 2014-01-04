var global = this;
var go = {};

// log
(function (selector) {
    function log() {
        console.log.apply(console, arguments);
        var args = [].slice.apply(arguments);
        var logStr = (args.length > 1)? JSON.stringify(args) : JSON.stringify(args[0]);
        if (selector && global.document) {
            var lst = document.querySelector(selector + '>' + 'ul');
            if (!lst) {
                lst = document.createElement('ul');
                document.querySelector(selector).appendChild(lst);
            }
            lst.innerHTML += '<li>'+logStr+'</li>';
        }
    }
    go.log = log;
})('#result');

// extend
(function () {
    function extend(_super, sub) {
        for (var k in _super) {
            if (!_super.hasOwnProperty(k)) {
                continue;
            }

            if (Array.isArray(_super[k])) {
                sub[k] = _super[k].slice(0);
                for(var i = 0; i < _super[k].length; i++) {
                    if (typeof _super[k][i] === 'object') {
                        sub[k][i] = {};
                        extend(_super[k][i], sub[k][i]);
                    }
                }
            } else if (typeof _super[k] === 'object') {
                sub[k] = {};
                extend(_super[k], sub[k]);
            } else {
                sub[k] = _super[k];
            }
        }
    }
    go.extend = extend;
})();

// subscribable
(function () {
    var subscribable = {
        _subscriptions: [],
        subscribe: function (callback, callbackTarget) {
            var _subscribable = this;
            var subscription = {
                callback: callbackTarget? callback.bind(callbackTarget) : callback,
                dispose: function () {
                    this.isDisposed = true;
                    for (var i = 0; i < _subscribable._subscriptions.length; i++) {
                        if (_subscribable._subscriptions[i] === this) {
                            _subscribable._subscriptions.splice(i, 1);
                            break;
                        }
                    }
                },
                isDisposed: false
            };
            this._subscriptions.push(subscription);
            return subscription;
        },
        notifySubscripters: function (valueToNotify) {
            var _subscriptions = this._subscriptions.slice(0);
            for (var i = 0; i < _subscriptions.length; i++) {
                var subscription = _subscriptions[i];
                if (subscription && (subscription.isDisposed !== true)) {
                    subscription.callback(valueToNotify);
                }
            }
        }
    };
    go.subscribable = subscribable;
})();

// observable
(function () {
    var observable = function (initialValue) {
        var lastValue = initialValue;

        function observable() {
            if (arguments.length > 0) {
                // write
                var newValue = arguments[0];
                if (newValue !== lastValue) {
                    lastValue = newValue;
                    observable.notifySubscripters(lastValue);
                }
            } else {
                // read
                // TODO: 依存関係に追加(go.dependencyDetectionを使う)
                return lastValue;
            }
        }
        go.extend(go.subscribable, observable);
        return observable;
    };
    go.observable = observable;
})();

// dependencyDetection
(function () {
    var distinctDependencies, callback;
    var dependencyDetection = {
        begin: function (_callback) {
            // TODO: callbackを初期化
            // TODO: distinctDependenciesを初期化
        },
        registerDependency: function (subscribable) {
            // TODO: すでに依存関係にあった場合は無視

            // TODO: subscribableを依存関係に追加
            // TODO: コールバックが設定してあったら呼び出す
        }
    };
    go.dependencyDetection = dependencyDetection;
})();

// Test
(function () {
    var a = go.observable(100);
    var b = go.observable(200);
    var observables = [];
    go.dependencyDetection.begin(function(observable) {
        if (a === observable) {
            go.log('a');
        } else if (b === observable) {
            go.log('b');
        } else {
            go.log(observable);
        }
    });
    a();
    a();
    b();
})();
