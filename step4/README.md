# 作って分かるJavaScriptでデータバインド

## STEP 4: 計算結果の変更を検出する

### `dependentObservable`オブジェクト

前述の通り、KnockoutJSには`ko.computed`関数を使うと他の`observable`オブジェクトを使って計算した結果を自身の値とする`dependentObservable`オブジェクトを作ることができます。また、`dependentObservable`オブジェクトが他の`dependentObservable`に依存しても問題ありません。もちろん、通常の`observable`オブジェクトと同様に、`subscribe`できる必要があります。そのため、以下のように読込み処理の時に毎回値を評価する方法では、効率が悪く、`subscribe`しても依存する`observable`オブジェクトの値が更新されても、次の読込み処理が走るまで`notify`することができません。

```javascript
// dependentObservable
(function () {
    var lastValue;
    var dependentObservable = function (readFunction) {
        function dependentObservable() {
            if (arguments.length > 0) {
                // write
                throw new Error('Cannot write to computed');
            } else {
                // read                                
                var newValue = readFunction();
                if (newValue !== lastValue) {
                    lastValue = newValue;
                    dependentObservable.notifySubscripters(lastValue);
                }
                go.dependencyDetection.registerDependency(dependentObservable);
                return lastValue;
            }
        }

        go.extend(go.subscribable, dependentObservable);
        return dependentObservable;
    };
    go.dependentObservable = dependentObservable;
    go.computed = dependentObservable;
})();
```

依存関係を検出するには、STEP 3で作成した`go.dependencyDetection`を使います。検出された依存する`observable`オブジェクトを`subscribe`して変更された場合に`readFunction`を読み込み`lastValue`を更新します。

それでは、KnockoutJSのソースコードを参考にしながら、`TODO`を埋めていきましょう。

* https://github.com/knockout/knockout/blob/v3.0.0/src/subscribables/dependentObservable.js

```javascript
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
```

`evaluateImmediate`は`readFunction`を呼び出し、保持している`observable`の値を更新します。また、その際に`go.dependencyDetection`を使って、依存する`subscribable`(`observable`)を検知します。検知した`subscribable`の`subscribe`する事で、更新された時に再度`evaluateImmediate`を呼び出されるようにします。`evaluateImmediate`が呼び出される度に、検知した依存関係を破棄し、`subscription`も破棄(`dispose`)するために、配列`subscriptionsToDependencies`で保持しています。`dependentObservable`オブジェクトも`observable`オブジェクトの一種なので、値が変更された場合は`notifySubscripters`で変更を通知します。`hasBeenEvaluated`は、一番最初の場合は問答無用で`evaluateImmediate`を呼び出すために使われます。

`TODO`をすべて埋めたらindex.htmlをブラウザで開いて、以下のテストプログラムの動作を確認してみましょう。

```javascript
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
```

以下のように出力されているはずです。

* [100,200,300]
* [400,200,600]

うまく動いているように見えます。しかし、これではうまく動かない場合があります。
次のステップでその部分を改良しましょう。

[>> STEP 5: 問題点の改善](step5/README.md)
