# 作って分かるJavaScriptでデータバインド

## はじめに

JavaScriptにおけるデータバインドの実装方法を双方向データバインドライブラリのKnockoutJSのソースコードを読み、自分で以下のような最低限の機能を実装をしていきます。

* 変更を`subscribe`できる`observable`オブジェクト
* 他の`observable`オブジェクトの値の変更を検知して、自身の値を変える`dependentObservable`オブジェクト

上記の機能を実現するために、KnockoutJSの以下のオブジェクトの仕組みを解析しました。

* ko.subscribable
* ko.observable
* ko.dependencyDetection
* ko.dependentObservable(ko.computed)

それぞれの機能をいくつかのステップに分けて説明します。各ステップは`step0`からディレクトリに分けられています。ステップ毎にスケルトンコードと説明(`README.md`)があります。スケルトンコードには`TODO`が書かれており、埋める事でコードを完成させることが出来ます。なお、各ステップの解答例は`answers`以下に同じディレクトリ構成で置かれています。

なお、この内容はKnockoutJSについて11月のALM（社内勉強会）で発表したものを基にしています。
勉強会のスライドはこちら。

* http://www.slideshare.net/takuyaueda967/knockout-js-alm11

また、この説明はQiitaにもまとめています。

* http://qiita.com/tenntenn/55fd8fc98cf29b1e43e5 

## 目次

* [STEP0 前準備](step0/README.md)
* [STEP1 subscribeとnotify](step1/README.md)
