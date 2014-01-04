# 作って分かるJavaScriptでデータバインド

## STEP 3: 依存関係の検出と`dependencyDetection`

### 依存関係の検出

KnockoutJSには、`ko.computed`という他の`ko.observable`の値に依存したような`observable`なオブジェクトがあります。`ko.computed`は以下のように使います。

[JSFiddleで見る](http://jsfiddle.net/uedatakuya/52J5b)

```html
<div id="result"></div>
```

```javascript
var hoge = ko.observable(100);
var piyo = ko.observable(200);
var foo = ko.computed(function(){
    return hoge() + piyo();
});
foo.subscribe(function(v) {
    document.querySelector('#result').innerText = v;
});
hoge(300);
```

`foo`の値(引数なしで評価された値)は、`hoge`が`piyo`が変更された場合、自動的に更新されます。もちろん、`subscribe`しておけば、その変更は通知されます。
不思議ですよね？KnockoutJSはどのようにして、`foo`が`hoge`と`piyo`に依存していることを知っているのでしょう？

この不思議を解明するために、以下のように、`ko.computed`に渡す関数が評価される回数を数えてみましょう。

[JSFiddleで見る](http://jsfiddle.net/uedatakuya/MckQ8)

```html
<div id="result"></div>
```

```javascript
var hoge = ko.observable(100);
var piyo = ko.observable(200);
var count = 0;
var foo = ko.computed(function () {
    count++;
    document.querySelector('#result').innerText = count;
    return hoge() + piyo();
});
hoge(300);
```

直感的には、`hoge(300)`の変更の時に1度呼ばれているだけの様な気がしますが、結果は`2`となっています。何故でしょう？
実は、この関数は`ko.computed`に渡されたときに、1度評価されます。そして、その評価の時に評価された`observable`オブジェクト(ここでは、`hoge`と`piyo`)を記録することで、依存関係を検知しています。また、その時の評価値を初期値として設定しています。

これはKnockoutJSを使う上では非常に大切なことです。なぜならば、この`ko.computed`に渡す関数内で副作用のある処理をすると、意図しない結果になる場合があるからです。事前に呼び出されることをちゃんと知った上で、使わないと思わぬバグになってしまいます。

### `dependencyDetection`オブジェクト

KnockoutJSの`ko.dependencyDetection`は、前述の依存関係の検出を行なうオブジェクトです。`ko.dependencyDetection.begin`を実行した後に、評価された`obsrvable`オブジェクトを登録します。`dependencyDetection`オブジェクトには、依存関係の検出を始める`begin`メソッドと、依存関係に`subscribable`オブジェクトを追加する`registerDependency`メソッドが必要です。また、`go.observable`の方にも修正が必要です。読込みの場合に、依存関係を記録する必要があるため、引数なしで呼び出された場合の処理に追加しなければなりません。

それでは、KnockoutJSのソースコードを参考にしながら、`TODO`を埋めていきましょう。

* https://github.com/knockout/knockout/blob/v3.0.0/src/subscribables/dependencyDetection.js

```javascript
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
            // TODO: すでに依存関係にあった場合と1度もbeginが呼ばれていない場合は無視

            // TODO: subscribableを依存関係に追加
            // TODO: コールバックが設定してあったら呼び出す
        }
    };
    go.dependencyDetection = dependencyDetection;
})();
```

`TODO`をすべて埋めたらindex.htmlをブラウザで開いて、以下のテストプログラムの動作を確認してみましょう。

```javascript
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
```

以下のように出力されているはずです。

* "a"
* "b"

`observable`オブジェクトの値が読み込まれた時に、`go.dependencyDetection.registerDependency`が呼び出されているのが分かります。また、1度登録された`observable`オブジェクトは重複して登録されていません。これで十分に動くように見えますが、実はうまく動きません。しかし、`dependentObservable`(`computed`)を実装する際に、必要となってくるので、ここはこのまま進みましょう。

[<< STEP 2: 値の更新を通知するオブジェクト](step2/README.md)

[>> STEP 4: 計算結果の変更を検出する](step4/README.md)
