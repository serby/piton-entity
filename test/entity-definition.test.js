var
	EntityDefinition = require('../../piton-entity').EntityDefinition,
	assert = require('assert');


function createTestEntityDefinition() {
	var entityDefinition = new EntityDefinition();
		entityDefinition.schema = {
			name: {
			},
			age: {
			},
			active: {
				defaultValue: true
			}
		};
	return entityDefinition;
}

module.exports = {
	'makeBlank returns correct obejct': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: null,
			age: null,
			active: null
		}, entityDefinition.makeBlank());
	},
	'makeBlank without a customer schema creates a empty object': function() {
		var entityDefinition = new EntityDefinition();
		assert.eql({}, entityDefinition.makeBlank());
	},
	'makeDefault without a customer schema creates a empty object': function() {
		var entityDefinition = new EntityDefinition();
		assert.eql({}, entityDefinition.makeDefault());
	},
	'makeDefault returns correct object': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: null,
			age: null,
			active: true
		}, entityDefinition.makeDefault());
	},
	'makeDefault extends passed object correctly': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul',
			age: null,
			active: true
		}, entityDefinition.makeDefault({ name: 'Paul' }));
	},
	'makeDefault extends strips out extra properties': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul',
			age: null,
			active: true
		}, entityDefinition.makeDefault({ name: 'Paul', extra: 'This should not be here'}));
	},
	'stripUnknownProperties strips out extra properties': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul'
		}, entityDefinition.stripUnknownProperties({ name: 'Paul', extra: 'This should not be here' }));
	}
};
