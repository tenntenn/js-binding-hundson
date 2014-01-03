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
      if (/* TODO: 引数があれば書き込み */) {
        // write
        var newValue = arguments[0];
        // TODO: 値が変わっていれば、更新して、nofityする
      } else {
        // read
        return lastValue;
      }
    }
    // TODO: go.subscribableを継承する
    // TODO: observableなオブジェクトを返す
  };
  go.observable = observable;
})();

// Test
(function () {
    var observable = go.observable('hoge');
    var count = 0;
    var subscription = observable.subscribe(function () {
        count++;
        go.log(observable(), count);
    });
    observable('foo');
    observable('foo');
    observable('bar');
    subscription.dispose();
    observable('piyo');
})();
