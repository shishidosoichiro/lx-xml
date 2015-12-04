var chai = require('chai');
var expect = chai.expect;

var xml = require('../index');
var toString = function(e){
	return e.toString();
};

describe('xml', function(){
	describe('example', function(){
		it('xml', function(){
			var tokens = xml.tokenize('<A><A a="b" c="d"></A><B></B>1 2=3 4&amp;5<C e=\'f g\'  h=i/></A>');
			var strings = tokens.map(toString);
			expect(strings[ 0]).to.equal('tag.head(0:A)')
			expect(strings[ 1]).to.equal('tag.head.end(2:>)')
			expect(strings[ 2]).to.equal('tag.head(3:A)')
			expect(strings[ 3]).to.equal('attr.name(5:a)')
			expect(strings[ 4]).to.equal('attr.name.end(7:=)')
			expect(strings[ 5]).to.equal('attr.value(8:b)')
			expect(strings[ 6]).to.equal('attr.name(11:c)')
			expect(strings[ 7]).to.equal('attr.name.end(13:=)')
			expect(strings[ 8]).to.equal('attr.value(14:d)')
			expect(strings[ 9]).to.equal('tag.head.end(17:>)')
			expect(strings[10]).to.equal('tag.tail(18:A)')
			expect(strings[11]).to.equal('tag.head(22:B)')
			expect(strings[12]).to.equal('tag.head.end(24:>)')
			expect(strings[13]).to.equal('tag.tail(25:B)')
			expect(strings[14]).to.equal('text(29:1 2=3 4&amp;5)')
			expect(strings[15]).to.equal('tag.head(42:C)')
			expect(strings[16]).to.equal('attr.name(44:e)')
			expect(strings[17]).to.equal('attr.name.end(46:=)')
			expect(strings[18]).to.equal('attr.value(47:f g)')
			expect(strings[19]).to.equal('attr.name(52:h)')
			expect(strings[20]).to.equal('attr.name.end(55:=)')
			expect(strings[21]).to.equal('attr.value(56:i)')
			expect(strings[22]).to.equal('tag.head.shortend(57:/>)')
			expect(strings[23]).to.equal('tag.tail(59:A)')
			var dom = xml.dom(tokens);
			//console.log(JSON.stringify(dom, null, 2))
			//console.log(xml.stringify(dom))
		})

		it('not xml', function(){
			var tokens = xml.tokenize('A');
			var strings = tokens.map(toString);
			expect(strings[0]).to.equal('text(0:A)')
		})
	})
})
