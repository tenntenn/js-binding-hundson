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
                go.dependencyDetection.registerDependency(observable);
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
            callback = _callback;
            distinctDependencies = [];
        },
        registerDependency: function (subscribable) {
            if (!distinctDependencies || distinctDependencies.indexOf(subscribable) >= 0) {
                return;
            }
            distinctDependencies.push(subscribable);
            callback && callback(subscribable);
        }
    };
    go.dependencyDetection = dependencyDetection;
})();

// dependentObservable
(function () {
    var dependentObservable = function (readFunction) {
        var lastValue = null;
        var isBeingEvaluated = false;
        var hasBeenEvaluated = false;
        var subscriptionsToDependencies = [];

        function evaluateImmediate() {
            // TODO: evaluateImmediateが既に呼び出し済み(呼び出し済みフラグがtrue)なら何もしない

            // TODO: 呼び出し済みフラグをtrueにする

            // TODO: 記録しているsubscriptionsをdisposeして配列を空にする
            
            go.dependencyDetection.begin(function (subscribable) {
                // TODO: 検知されたsubscribableをsubscribeして、そのsubscriptionを記録
            });

            var newValue = readFunction();
            // TODO: 1度でも評価されているかどうかを表すフラグをtrueにする

            if (newValue !== lastValue) {
                lastValue = newValue;
                dependentObservable.notifySubscripters(lastValue);
            }

            // TODO: 呼び出し済みフラグをfalseにする
        }

        function dependentObservable() {
            if (arguments.length > 0) {
                // write
                throw new Error('Cannot write to computed');
            } else {
                // read                
                if (/* TODO: 一度も評価されていない場合 */) {
                    evaluateImmediate();
                }
                go.dependencyDetection.registerDependency(dependentObservable);
                return lastValue;
            }
        }

        go.extend(go.subscribable, dependentObservable);
        // TODO: 最初の評価と初期値の設定
        return dependentObservable;
    };
    go.dependentObservable = dependentObservable;
    go.computed = dependentObservable;
})();

// Test
(function () {
    var a = go.observable(100);
    var b = go.observable(200);
    var c = go.computed(function () {
        return a() + b();
    });
    go.log(a(), b(), c());
    a(400);
    go.log(a(), b(), c());
})();
