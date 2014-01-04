# 作って分かるJavaScriptでデータバインド

## STEP 0: 前準備
まずは、前準備をしましょう。
このステップでは、特に`TODO`はありません。
他のステップで使う、いくつかの関数やオブジェクトを用意しましょう。

はじめに、グローバルオブジェクトを極力汚さないように、名前空間を用意しましょう。
名前空間の名前は特に意味はありませんが、KnockoutJSの`ko`をマネして、2文字くらいが使いやすいでしょう。
今回は、無作為に2文字選びました。

```javascript
var go = {};
```

つぎに、デバッグ用の`log`関数を用意しましょう。
`console.log`を使ってログをコンソールに出力し、ブラウザを使った場合には、JSON形式でHTMLのリストでも出力する関数です。

```javascript
var global = this;

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
```

さいごに、継承を行なうための関数を用意しましょう。
`go.extend`は第1引数で渡したオブジェクトのプロパティを第2引数で渡したオブジェクトにコピーする関数です。継承とはちょっと異なりますが、ここでは簡単の為にこうしておきましょう。この関数は深くコピーすることに注意しておきましょう。コピーしたプロパティのオブジェクト(配列)は別のオブジェクト(配列)となります。

```javascript
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
```

[>> STEP 1: subscribeとnotify](../step1/README.md)
