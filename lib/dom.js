// convert tokens to vdom;
module.exports = function(tokens){
  var stack = [];
  var top = {attrs: {}, children: []};
  var current = top;
  var attr;
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];        
    if (token.name === 'tag.head') {
      var tag = {tag: token.value, attrs: {}, children: [], index: token.index, status: 'head'};
      current.children.push(tag);
      stack.push(current);
      current = tag;
      attr = undefined;
    }
    else if (token.name === 'tag.head.end') {
      current.status = 'open';
      attr = undefined;
    }
    else if (token.name === 'tag.tail' && token.value === current.tag) {
      current.status = 'closed';
      current = stack[stack.length - 1];;
      stack.pop();
      attr = undefined;
    }
    else if (token.name === 'tag.head.shortend') {
      current.status = 'closed';
      current = stack[stack.length - 1];;
      stack.pop();
      attr = undefined;
    }
    else if (token.name === 'attr.name' && current.status != 'open') {
      current.attrs[token.value] = true;
      current.status = 'attr name: ' + token.value;
      attr = token;
    }
    else if (token.name === 'attr.name.end' && attr) {
      current.status = 'attr eq: ' + attr.value;
    }
    else if (token.name === 'attr.value' && attr) {
      var value = current.attrs[attr.value] = unescape(token.value);
      value.index = token.index;
      current.status = 'attr value: ' + attr.value;
      attr = undefined;
    }
    else if (token.name === 'text') {
      token.value.index = token.index;
      current.children.push(unescape(token.value));
      attr = undefined;
    }
    else {
      throw new Error('unknown token.');
    }
  }
  return top.children[0];
};

var regex = {
  amp: /\&amp\;/g,
  lt: /\&lt\;/g,
  gt: /\&gt\;/g,
  quot: /\&quot\;/g,
  squot: /\&\#039\;/g
};
var unescape = function(str) {
  return str.replace(regex.amp, '&')
            .replace(regex.lt, '<')
            .replace(regex.gt, '>')
            .replace(regex.quot, '"')
            .replace(regex.squot, '\'');
};
