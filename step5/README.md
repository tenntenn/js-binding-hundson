# 作って分かるJavaScriptでデータバインド

## STEP 5: 問題点の改善

このステップでは、STEP 4での実装をうまく動かない例を示して、問題点を改善していきます。

### 入れ子にした場合

STEP 4までの実装では、以下のように`computed`が入れ子になっている場合にうまく動作しません。最初の出力では、`100 200`、2番目の出力では`150 300`と出力されて欲しいところですが、実際には2番目の出力は`150 200`となります。STEP 4までの実装では、`readFunction`の中で`go.dependenctyDetection.begin`を多重に呼び出すことを前提としていません。そのため、2度`begin`を呼び出すと前回の呼び出しの分の`distinctDependencies`が消えてしまいます。そこで、`distinctDependencies`をスタックで管理するようにしましょう。スタックで管理すれば、入れ子に呼び出されても問題ありません。

```javascript
    var a = go.observable(100);

    var b = go.computed(function () {
        var c = go.computed(function () {
            return a() * 2;
        });
        return c();
    });

    go.log(a(),b());
    a(150);
    go.log(a(),b());

```

それでは、KnockoutJSのソースコードを参考にしながら、`TODO`を埋めていきましょう。

* https://github.com/knockout/knockout/blob/v3.0.0/src/subscribables/dependencyDetection.js
* https://github.com/knockout/knockout/blob/v3.0.0/src/subscribables/dependentObservable.js

```javascript
// dependencyDetection
(function () {
  var frames = [];
  var dependencyDetection = {
    begin: function (callback) {
        // TODO: 新しいframeをpushして、依存関係の検出を開始する。callbackが無かったら、undefinedをpushする
    },
    end: function () {
        // TODO: 先頭のframeをpopして、依存関係の検出を終了する
    },
    registerDependency: function (subscribable) {
      if (frames.length > 0) {
        var topFrame = frames[frames.length - 1];
        // TODO: topFrameがundefinedの場合とすでにsubscribableが登録してあったら何もしない

        topFrame.distinctDependencies.push(subscribable);
        topFrame.callback(subscribable);
      }
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
      if (isBeingEvaluated) {
        return;
      }
      isBeingEvaluated = true;
      for (var i = 0; i < subscriptionsToDependencies.length; i++) {
        subscriptionsToDependencies[i].dispose();
      }
      subscriptionsToDependencies = [];
      go.dependencyDetection.begin(function (subscribable) {
        subscriptionsToDependencies.push(subscribable.subscribe(evaluateImmediate));
      });
      var newValue = readFunction();
      hasBeenEvaluated = true;
      if (newValue !== lastValue) {
        lastValue = newValue;
        dependentObservable.notifySubscripters(lastValue);
      }
      // TODO: 依存関係の検出を終了する
      isBeingEvaluated = false;
    }

    function dependentObservable() {
      if (arguments.length > 0) {
        // write
        throw new Error('Cannot write to computed');
      } else {
        // read                
        if (!hasBeenEvaluated) {
          evaluateImmediate();
        }
        go.dependencyDetection.registerDependency(dependentObservable);
        return lastValue;
      }
    }

    go.extend(go.subscribable, dependentObservable);
    evaluateImmediate();
    return dependentObservable;
  };
  go.dependentObservable = dependentObservable;
  go.computed = dependentObservable;
})();
```

スタックを`frames`という名前にし、`begin`でスタックに積み、`end`でスタックから取り除くようにしています。また、`dependentObservable`の`evaluateImmediate`も循環で呼び出されないようにしましょう。`begin`したら`end`するのを忘れないようにしましょう。

`TODO`をすべて埋めたらindex.htmlをブラウザで開いて、以下のテストプログラムの動作を確認してみましょう。

```javascript
// Test
(function () {
    var a = go.observable(100);

    // 入れ子にしても問題ないか？
    var b = go.computed(function () {
        var c = go.computed(function () {
            return a() * 2;
        });
        return c();
    });

    go.log(a(),b());
    a(150);
    go.log(a(),b());
})();
```

以下のように出力されているはずです。

* [100,200]
* [150,300]

`b`の依存関係と`b`の`readFunction`の中で作られている`c`の依存関係はスタックを使うことで別物として扱うことができるようになりました。`a`を変更すると、`b`と`c`に変更が通知され、それぞれの`evaluateImmediate`が実行されます。もちろん、`c`は`b`の`readFunction`が呼ばれる度に生成されるので、普通はこのような呼び方はしないでしょう。

## まとめ

KnockoutJSの以下のオブジェクトの簡易実装を作ってみました。KnockoutJSのデータバインドは`dependenctyDetection`がキモで、この機構があるおかげで、明示的に依存関係を定義する必要がありません。しかしながら、その仕組みをあまり理解せずに使用していると、思わぬバグに遭遇して困るのではないでしょうか。ここでは、説明が複雑になるので、`ko.applyBindings`を使ったHTMLとの双方向バインディングの仕組みについて触れませんでしたが、ソースを軽く見た感じでは`computed`をうまく使って実装されているようです。また時間があれば、そちらの実装の方もまとめたいと思います。これを書いている間もmasterブランチのソースコードが結構変わっているので、内容が古くなるかもしれませんが、このまとめが誰かの役に立てば幸いです。
