/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {module.exports = global["xml"] = __webpack_require__(1);
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var tokenize = __webpack_require__(2);
	var dom = __webpack_require__(6);
	var stringify = __webpack_require__(7);

	module.exports = function(string){
	  var tokens = tokenize(string);
	  return dom(tokens);
	};

	module.exports.tokenize = tokenize;
	module.exports.dom = dom;
	module.exports.stringify = stringify;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Lexer = __webpack_require__(3);
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


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(4);
	var Store = __webpack_require__(5);

	var defaults = {
	  flags: 'mg'
	};

	var Lexer = module.exports = function(options){
	  options = options || {};
	  _.inherits(options, defaults);
	  var app = function(string, context){
	    context = context || {};
	    context.state = app;
	    context.index = 0;
	    context.stack = [];
	    while (string != ''){
	      string = context.state.lex.call(context, string);
	    }
	  };

	  var store = Store(options);

	  var defined = function(arg){
	    return arg != undefined;
	  };
	  var get = function(matched){
	    var position = _.findIndex(matched.slice(1), defined) + 1;
	    return store.get(position);
	  } 

	  app.match = function(regex){
	    var position = store.last.position + store.last.count;
	    var src = _.source(regex);

	    var rule = {
	      source: src,
	      action: _.flow(_.slice(arguments, 1)),
	      count: _.captureCount(src) + 1,
	      position: position
	    }
	    store.put(position, rule);
	    return app;
	  };
	  var other = _.noop;
	  app.other = function(){
	    other = _.flow(_.slice(arguments));
	    return app;
	  };
	  app.lex = function(string){
	    if (store.last.position === 0) {
	      other.call(this, string, this.index);
	      return '';
	    }
	    var matched = store.regex.call(this).exec(string);
	    if (!matched) {
	      other.call(this, string, this.index);
	      return '';
	    }

	    var rule = get(matched);
	    var index = matched.index;

	    // unmatchd part
	    if (matched.index > 0) other.call(this, string.substring(0, matched.index));

	    // matched part
	    this.index += matched.index;
	    var captured = matched.slice(rule.position, rule.position + rule.count);
	    rule.action.apply(this, captured);

	    this.index += matched[0].length;
	    return string.substr(matched.index + matched[0].length);
	  }
	  return app;
	};
	Lexer.noop = _.noop;
	Lexer.shift = _.shift;
	Lexer.flow = _.flow;
	Lexer.state = function(state){
	  return function(){
	    this.stack.push(this.state);
	    this.state = state;
	  }
	}; 
	Lexer.back = function(){
	  this.state = this.stack.pop();
	};
	var toString = function(){
	  return this.name + '(' + this.index + (typeof this.value === 'undefined' ? '' : ':' + this.value) + ')';
	}
	Lexer.token = function(name){
	  return function(value){
	    return {name: name, value: value, index: this.index, toString: toString};
	  }
	};
	Lexer.push = function(token){
	  this.tokens.push(token)
	};
	Lexer.raise = function(message){
	  return function(string){
	    var args = {};
	    args.string = string;
	    args.index = this.index;
	    var error = new Error(message + ' ' + JSON.stringify(args));
	    error.string = args.string;
	    error.index = args.index;
	    throw error;
	  };
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	var _ = module.exports = {
	  noop: function(arg){
	  	return arg
	  },
	  slice: function(array, begin, end){
	    return Array.prototype.slice.call(array, begin, end);
	  },
	  array: function(value){
	    return value instanceof Array ? value : [value];
	  },
	  functionalize: function(src){
	    return typeof src === 'function' ? src : function(){return src};
	  },
	  shift: function(){
	    return _.slice(arguments, 1);
	  },
	  flow: function(functions){
	    if (arguments.length > 1 && !(functions instanceof Array)) functions = _.slice(arguments);
	    functions = functions.map(_.functionalize);
	    return function(){
	      var that = this
	      return functions.reduce(function(args, f){
	        return f.apply(that, _.array(args))
	      }, _.slice(arguments))
	    }
	  },
	  findIndex: function(array, callback, value){
	    var index;
	    var found;
	    if (typeof callback === 'function') {
	      found = array.some(function(el, i){
	        index = i;
	        return callback.apply(this, arguments)
	      })
	    }
	    else if (typeof callback === 'undefined') {
	      found = array.some(function(el, i){
	        index = i;
	        return el
	      })
	    }
	    else if (typeof callback === 'string') {
	      found = array.some(function(el, i){
	        index = i;
	        return el[callback] == value
	      })
	    }
	    return found ? index : undefined;
	  },
	  captureCount: function(src){
	    return new RegExp('(?:' + _.source(src) + '|(any))').exec('any').length - 2;
	  },
	  source: function(regex){
	    if (typeof regex === 'undefined') return '';
	    else if (typeof regex === 'string') return regex;
	    else if (typeof regex !== 'object') return regex;
	    else if (regex instanceof RegExp) return regex.source;
	    else return regex.toString();
	  },
	  call: function(src){
	    if (typeof src === 'function') return src.call(this);
	    return src;
	  },
	  inherits: function(target, parent){
	    for (var i in parent) {
	      target[i] = parent[i];
	    }
	  },
	};


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var _ = __webpack_require__(4);

	var defaults = {
	  flags: 'mg'
	};

	module.exports = function(options){
	  options = options || {};
	  _.inherits(options, defaults);
	  var sources = [];
	  var map = {};
	  var wrap = function(src){
	    return '(' + src + ')';
	  }
	  var _regex;
	  var regex = function(){
	    var source = '(?:' + sources.map(wrap).join('|') + ')';
	    return new RegExp(source, options.flags);
	  };

	  var store = {
	    sources: sources,
	    last: {position: 0, count: 1},
	    get: function(key){
	      return map[key];
	    },
	    put: function(key, rule){
	      map[key] = rule;
	      sources.push(rule.source)
	      this.last = rule;
	      _regex = regex();
	    },
	    regex: function(){
	      _regex.lastIndex = 0;
	      return _regex;
	    }
	  }
	  return store;
	}



/***/ },
/* 6 */
/***/ function(module, exports) {

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


/***/ },
/* 7 */
/***/ function(module, exports) {

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


/***/ }
/******/ ]);