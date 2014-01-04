# 作って分かるJavaScriptでデータバインド

## STEP 2: 値の更新を通知するオブジェクト

### `observable`オブジェクト

`subscribable`オブジェクトは、通知の登録(`subscribe`)と通知(`notify`)はできましたが、値そのものを保持することはできませんでした。
そこで、このステップでは内部に値を保持できる`observable`オブジェクトを作る関数を実装してみましょう。

KnockoutJSの`ko.observable`は、内部に値を保持できるオブジェクトを作る関数です。このオブジェクトは、関数オブジェクトで引数を渡して呼び出すと書き込み(write)になり、引数なしで呼び出すと読み出し(read)になります。`ko.observable`では、内部に保持する値の変更を`subscribe`することで、検知することができます。`subscribe`の機能は、`ko.subscribable`を継承することで実現しています。つまり、書き込み時に`notifySubscripters`を実行する事で、書き込みを通知します。具体的な使い方を見てみましょう。

```javascript
var foo = ko.observable(100);
foo.subscribe(function(v) {
    alert(v);
});
// 200とalertされる
foo(200);
// 200と出力される
console.log(foo());
```

上記の例では`var foo = ko.observable(100);`で初期化が行なわれ、`observable`オブジェクトが作られています。この時初期値として、`100`が設定されています。つづいて、`subcribable`で、変更を検知して、`alert`を呼び出すコールバック仕掛けます。`foo(200)`で書き込みが行なわれると、仕掛けたコールバックが呼ばれて、`alert`が行なわれます。`foo()`のように引数なしで呼ばれると、内部に保持している値をそのまま返すため、コンソールに`200`が出力されます。

それでは、KnockoutJSのソースコードを参考にしながら、`TODO`を埋めていきましょう。

* https://github.com/knockout/knockout/blob/v3.0.0/src/subscribables/observable.js

```javascript
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
```

`observable`オブジェクト（値が保持できて、変更の検知ができる）を作る関数を`go.observable`とします。`go.observable`の引数は、`observable`オブジェクトに設定する初期値を受取りましょう。戻り値はもちろん`observable`オブジェクトです。

`observable`という関数が2つ出てきてややこしいですが、外側の関数(`go.observable`)は`ko.observable`にあたる関数で、内側の関数が実際に値を保持する`observable`なオブジェクトになります。`go.observable`が呼び出される度に、内側の`observable`関数(`observable`オブジェクト)が作られます。`lastValue`は`observable`オブジェクト内に保持する値を入れる変数で、`go.observable`の引数で貰った値を初期値としています。通知する機能は`go.subscribable`で作っているため、`observable`オブジェクトは、`go.subscribable`を継承しています。

`observable`オブジェクトは2種類の呼ばれ方をしています。ひとつめが`foo(200)`のような引数がある呼ばれ方、ふたつめが`foo()`のような引数がない呼ばれ方です。前者が書き込みで後者が読み出しです。JavaScriptの関数の中では、`arguments`という引数を保持する配列っぽい特別なオブジェクトが使えます。`arguments`は、複数のパターンの引数をとる場合によく使われます。この場合は、`arguments.length`を見て、引数の有無で書き込み処理と読込み処理を分ければ良いでしょう。読み込み処理の場合は、単に最後に設定された値(`lastValue`)を返すだけでいいでしょう。書き込み処理も、第1引数の値を`lastValue`に入れれば良さそうです。書き込み処理では、もうひとつ大切な処理を行なう必要があります。新しい値が設定された場合、その事を`subscripter`に通知する処理です。これは`go.subscribable`から継承した`notifySubscripters`を使えば済みます。

`TODO`をすべて埋めたらindex.htmlをブラウザで開いて、以下のテストプログラムの動作を確認してみましょう。

```javascript
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
```

以下のように出力されているはずです。

* ["foo",1]
* ["bar",2]

値が新しい値に変更された場合のみ、通知が行なわれていることが分かります。

[<< STEP 1: subscribeとnotify](../step1/README.md)

[>> STEP 3: 依存関係の検出とdependencyDetection](../step3/README.md)
