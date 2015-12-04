var tokenize = require('./lib/tokenize');
var dom = require('./lib/dom');
var stringify = require('./lib/stringify');

module.exports = function(string){
  var tokens = tokenize(string);
  return dom(tokens);
};

module.exports.tokenize = tokenize;
module.exports.dom = dom;
module.exports.stringify = stringify;
