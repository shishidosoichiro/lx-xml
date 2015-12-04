var stringify = module.exports = function(dom){
  if (typeof dom === 'string') {
    return escape(dom);
  }
  else if (dom.children.length === 0) {
    return '<' + dom.tag + attrs(dom.attrs) + ' />';
  }
  else {
    var string = '';
    string += '<' + dom.tag +  attrs(dom.attrs) + ' >';
    string += dom.children.map(stringify).join('');
    string += '</' + dom.tag + '>';
    return string;
  }
};

var attrs = function(attrs){
  var string = '';
  for (var name in attrs) {
    string += ' ' + name + '="' + attrs[name] + '"';
  }
  return string;
};

var regex = {
	amp: /&/g,
  lt: /</g,
  gt: />/g,
  quot: /"/g,
  squot: /'/g
};
var escape = function(str) {
  return str.replace(regex.amp, '&amp;')
            .replace(regex.lt, '&lt;')
            .replace(regex.gt, '&gt;')
            .replace(regex.quot, '&quot;')
            .replace(regex.squot, '&#039;');
};
