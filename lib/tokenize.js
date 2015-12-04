var Lexer = require('lx');
var state = Lexer.state;
var back = Lexer.back;
var shift = Lexer.shift;
var token = function(name){
  var token = Lexer.token(name);
  return function(){
    var t = token.apply(this, arguments);
    Lexer.push.call(this, t);
  }
};
var noop = Lexer.noop;
var raise = Lexer.raise;

var content = Lexer()
var head = Lexer()
var attr = Lexer()
attr.value = Lexer()

content
.match(/<([\w\.\:\-]+)/, shift, token('tag.head'), state(head))
.match(/<\/([\w\.\:\-]+)>/, shift, token('tag.tail'))
.other(token('text'))

head
.match(/\s+([\w\.\:\-]+)/, shift, token('attr.name'), state(attr))
.match(/\/>/, token('tag.head.shortend'), back)
.match(/>/, token('tag.head.end'), back)

attr
.match(/=/, token('attr.name.end'), state(attr.value))
.match(/\/>/, token('tag.head.shortend'), back, back)
.match(/>/, token('tag.head.end'), back, back)

attr.value
.match(/\"([^\"]+)\"/, shift, token('attr.value'), back, back)
.match(/\'([^\']+)\'/, shift, token('attr.value'), back, back)
.match(/[\w\.\:\-]+/, token('attr.value'), back, back)

module.exports = function(string){
  var context = {tokens: []};
  content(string, context);
  return context.tokens;
};
