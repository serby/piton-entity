var
	EntityDefinition = require('../../piton-entity').EntityDefinition,
	assert = require('assert');


function createTestEntityDefinition() {
	var entityDefinition = new EntityDefinition();
		entityDefinition.schema = {
			name: {
			},
			age: {
				type: 'integer'
			},
			active: {
				type: 'boolean',
				defaultValue: true
			},
			phoneNumber: {
			}
		};
	return entityDefinition;
}

var assertions = {
	integer: [
		382, 382,
		245, '245',
		93, 93.5,
		831, '831.2',
		0, null,
		undefined, undefined,
		0, ''],
	boolean: [
		true, true,
		true, 1,
		true, 't',
		true, 'true',
		true, 'on',
		true, 'yes',
		false, false,
		false, 'false',
		false, 0,
		false, 'off',
		false, 'no',
		false, null,
		undefined, undefined,
		false, '']
};



module.exports = {
	'makeBlank returns correct obejct': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: null,
			age: null,
			active: null,
			phoneNumber: null
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
			active: true,
			phoneNumber: null
		}, entityDefinition.makeDefault());
	},
	'makeDefault extends passed object correctly': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul',
			age: null,
			active: true,
			phoneNumber: null
		}, entityDefinition.makeDefault({ name: 'Paul' }));
	},
	'makeDefault extends strips out extra properties': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul',
			age: null,
			active: true,
			phoneNumber: null
		}, entityDefinition.makeDefault({ name: 'Paul', extra: 'This should not be here'}));
	},
	'stripUnknownProperties strips out extra properties': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul'
		}, entityDefinition.stripUnknownProperties({ name: 'Paul', extra: 'This should not be here' }));
	},
	'cast converts types correctly': function() {
		var entityDefinition = createTestEntityDefinition();

		Object.keys(assertions).forEach(function(type) {
			// Even = expected, odd = supplied
			for(var i = 0; i < assertions[type].length; i += 2) {
				var cast;
				assert.strictEqual(assertions[type][i], cast = entityDefinition.cast(type, assertions[type][i + 1]),
					'Failed to cast \'' + type + '\' from \'' + assertions[type][i + 1] + '\' to \'' + assertions[type][i] + '\' instead got \'' + cast + '\'');
			}
		});
	},
	'cast throws exception on unknown type ': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.throws(function() {
			entityDefinition.cast(undefined);
		});
	},
	'castProperties converts integer types of properties correctly': function() {
		var entityDefinition = createTestEntityDefinition();
		var type = 'integer';
		for(var i = 0; i < assertions[type].length; i += 2) {
			assert.eql({
				age: assertions[type][i]
			}, entityDefinition.castProperties({ age: assertions[type][i + 1] }));
		}
	},
	'castProperties converts boolean types of properties correctly': function() {
		var entityDefinition = createTestEntityDefinition();
		var type = 'boolean';
		// Even = expected, odd = supplied
		for(var i = 0; i < assertions[type].length; i += 2) {
			assert.eql({
				active: assertions[type][i]
			}, entityDefinition.castProperties({ active: assertions[type][i + 1] }));
		}
	},

	'castProperties does not effect untyped properties': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			phoneNumber: '555-0923'
		}, entityDefinition.castProperties({ phoneNumber: '555-0923' }));
	}
};
