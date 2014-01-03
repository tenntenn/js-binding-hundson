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

go.log('hello');

var a = {
    hoge: 'hoge',
    piyo: [1, 2, 3]
};
var b = {};
go.extend(a, b);
b.piyo.push(4);
go.log("a", a);
go.log("b", b);
