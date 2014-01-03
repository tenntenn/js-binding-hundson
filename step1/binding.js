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
                callback: /* TODO: callbackTargetがあったらバインドしてコールバックを設定*/,
                dispose: function () {
                    // TODO: 破棄したというフラグを立てておく

                    // TODO: _subscribable._subscriptionsの中に自身(this)を発見したら配列から取り除く
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
                // TODO: disposeされていなかったら、callback呼び出す
            }
        }
    };
    go.subscribable = subscribable;
})();

// Test
(function () {

    // 継承してみる
    var subscribable = {};
    go.extend(go.subscribable, subscribable);

    // 通知がきたら、ログに出力する
    var subscription = subscribable.subscribe(function (value) {
        go.log(value);
    });

    // subscripterに'hoge'を通知する
    subscribable.notifySubscripters('hoge');

    // disposeして破棄する
    subscription.dispose();

    // subscripterに'piyo'を通知する
    // しかし、subscriptionはdisposeされているので、通知されない
    subscribable.notifySubscripters('piyo');
})();
