# 作って分かるJavaScriptでデータバインド

## STEP 1: `subscribe`と`notify`

### バインディングの魔法

私はバインディングという機能が好きで、JavaFXやAngularJS、そしてKnockoutJSのバインディングを色々ためしました。また、面白そうだったので、自分で[バインディングライブラリ](https://github.com/tenntenn/simple-binding.js)を作ってみたりしました。

KnockoutJSのバインディングはHTMLとJSのオブジェクトを双方向バインドすることができます。双方向なので、片方が変更されるともう片方も変更されます。
たとえば、以下の例を見てみると、`input`タグの`value`に、`vm.count`がバインディングされています。`vm.count`の値は、タイマーでカウントアップされ、その結果が`input`の`value`へと反映されます。また、`input`の`value`をフォームから変更することもでき、その変更は`vm.count`へと反映されます。

[JSFiddleで見る](http://jsfiddle.net/uedatakuya/HXPb4)

```html
counter: <input type="number" id="counter" data-bind="value: count" />

```

```javascript
var vm = {
    count: ko.observable(0),
};

ko.applyBindings(vm, document.body);

setInterval(function() {
    vm.count(parseInt(vm.count(), 10) + 1);
}, 1000);
```

上記の例を見ると、KnockoutJSのバインディングは魔法のようにオブジェクトとHTMLをバインドしているようです。
もちろん、魔法などではありません。バインドされているもう一方に変更を伝える仕組みが働いていて、変更に追従しているのです。
この変更を伝える仕組みをKockoutJSでは、`ko.subcribable`が担っています。
KnockoutJSでメインに使われる`ko.observable`や`ko.observableArray`、`ko.computed`(`ko.dependentObservable`のエイリアス)はこのオブジェクトの機能を継承しています。

### `subscribe`と`notify`

KnockoutJSの`ko.subcribable`は変更を伝える役目を担っており、以下の2つの機能から成っています。

* `subscribe`：変更を通知してもらうオブジェクト(`subscripter`)を登録する
* `notifySubscripter`：登録している`subscripter`に通知する

KnockoutJSのソースコードを参考にしながら、`TODO`を埋めていきましょう。

* https://github.com/knockout/knockout/blob/v3.0.0/src/subscribables/subscribable.js

```javascript
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
```

`subscription`は`callback`と`dispose`というプロパティを持っており、`callback`は引数で渡された`callback`に`callbackTarget`を`Function.bind`したものです。一方、`dispose`は`_subscriptoions`から自身を取り除く処理を行なう関数です。`_subscriptions`から取り除いただけでは、`subscription`オブジェクトから分からないので、フラグを立てておきます。`subscribe`は`subscription`を返すので、登録を破棄したければ、`dispose`を呼べば破棄されます。

つづいて、`notifySubscripters`を考えてみましょう。`notifySubscripters`は、`_subscriptions`に登録されている`subscription`の`callback`を呼び出す事によって、`subscript`しているオブジェクト(`subscripter`)に通知を送るメソッドです。`notifySubscripters`の引数は通知する値です。引数で渡された値は`subscription`の`callback`関数の引数として渡されます。

`TODO`をすべて埋めたらindex.htmlをブラウザで開いて、以下のテストプログラムの動作を確認してみましょう。

```javascript
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
```

以下のように出力されているはずです。

* "hoge"

コメントにも書かれていますが、1回目の`notifySubscripters`では、`subscription`の`callback`に通知されます。しかし、2回目は通知する`subscripter`がないので、どのオブジェクトにも通知されません。

[<< STEP 0: 前準備](step0/README.md)

[>> STEP 2: 値の更新を通知するオブジェクト](step2/README.md)
