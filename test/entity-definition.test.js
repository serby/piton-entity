var
	EntityDefinition = require('../../piton-entity'),
	assert = require('assert'),
	validation = require('piton-validity').validation;

function createTestEntityDefinition() {
	var entityDefinition = EntityDefinition.createEntityDefinition({
		name: {
			tag: ['update'],
			name: 'Full Name'
		},
		age: {
			type: 'number',
			defaultValue: 0
		},
		active: {
			type: 'boolean',
			defaultValue: true
		},
		phoneNumber: {
			tag: ['update']
		}
	});
	return entityDefinition;
}

function createArrayEntityDefinition() {
	var entityDefinition = EntityDefinition.createEntityDefinition({
		images: {
			type: 'array'
		}
	});
	return entityDefinition;
}

// Casting
var assertions = {
	number: [
		382, 382,
		245, '245',
		831.3, 831.3,
		831.3, '831.3',
		null, null,
		null, ''],
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
		null, null,
		null, ''
	]};

module.exports = {
	'makeBlank returns correct object': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: null,
			age: null,
			active: null,
			phoneNumber: null
		}, entityDefinition.makeBlank());
	},
	'makeBlank creates empty objects for objects type': function() {
		var entityDefinition = EntityDefinition.createEntityDefinition({
			contacts: {
				type: 'object'
			}
		});
		assert.eql({ contacts: {} }, entityDefinition.makeBlank());
	},
	'makeBlank creates empty arrays for array type': function() {
		var entityDefinition = EntityDefinition.createEntityDefinition({
			images: {
				type: 'array'
			}
		});
		assert.eql({ images: [] }, entityDefinition.makeBlank());
	},
	'makeDefault without a customer schema creates a empty object': function() {
		var entityDefinition = EntityDefinition.createEntityDefinition();
		assert.eql({}, entityDefinition.makeDefault());
	},
	'makeDefault returns correct object': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: null,
			age: 0,
			active: true,
			phoneNumber: null
		}, entityDefinition.makeDefault());
	},
	'makeDefault extends passed object correctly': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul',
			age: 0,
			active: true,
			phoneNumber: null
		}, entityDefinition.makeDefault({ name: 'Paul' }));
	},
	'makeDefault extends strips out extra properties': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul',
			age: 0,
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
	'stripUnknownProperties strips out properties without the given tag': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			name: 'Paul'
		}, entityDefinition.stripUnknownProperties({ name: 'Paul', age: 21 }, 'update'));
	},
	'stripUnknownProperties strips out properties without the given tag and returns empty object if tag is not found': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({}, entityDefinition.stripUnknownProperties({ name: 'Paul', age: 21 }, 'BADTAG'));
	},
	'cast converts types correctly': function() {
		var entityDefinition = createTestEntityDefinition();

		Object.keys(assertions).forEach(function(type) {
			// Even = expected, odd = supplied
			for(var i = 0; i < assertions[type].length; i += 2) {
				var cast;
				assert.strictEqual(assertions[type][i], cast = entityDefinition.cast(type, assertions[type][i + 1]),
					'Failed to cast \'' + type + '\' (test ' + i + ') from \'' + assertions[type][i + 1] + '\' to \'' + assertions[type][i] + '\' instead got \'' + cast + '\'');
			}
		});
	},
	'cast converts arrays correctly': function() {
		var entityDefinition = createArrayEntityDefinition();

		[[], null, ''].forEach(function(value) {
			assert.ok(Array.isArray(entityDefinition.cast('array', value)));
			assert.length(entityDefinition.cast('array', value), 0);

		});

		[[1], ['a']].forEach(function(value) {
			assert.ok(Array.isArray(entityDefinition.cast('array', value)));
			assert.length(entityDefinition.cast('array', value), 1);
		});

	},
	'cast converts object correctly': function() {
		var entityDefinition = createArrayEntityDefinition();

		[null, ''].forEach(function(value) {
			assert.length(Object.keys(entityDefinition.cast('array', value)), 0);
		});

		[{a:'b'}].forEach(function(value) {
			assert.length(Object.keys(entityDefinition.cast('array', value)), 1);
		});

	},
	'cast throws exception on unknown type ': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.throws(function() {
			entityDefinition.cast(undefined);
		});
	},
	'castProperties converts number types of properties correctly': function() {
		var entityDefinition = createTestEntityDefinition();
		var type = 'number',
		cast;
		for(var i = 0; i < assertions[type].length; i += 2) {
			assert.eql({
				age: assertions[type][i]
			},cast = entityDefinition.castProperties({ age: assertions[type][i + 1] }), 'Failed to cast \'' + type + '\' from \'' + assertions[type][i + 1] + '\' to \'' + assertions[type][i] + '\' instead got \'' + cast.age + '\'' + JSON.stringify(cast));
		}
	},
	'castProperties converts boolean types of properties correctly': function() {
		var entityDefinition = createTestEntityDefinition();
		var type = 'boolean';
		// Even = expected, odd = supplied
		for(var i = 0; i < assertions[type].length; i += 2) {
			assert.eql({
				active: assertions[type][i]
			},cast = entityDefinition.castProperties({ active: assertions[type][i + 1] }), 'Failed to cast \'' + type + '\' from \'' + assertions[type][i + 1] + '\' to \'' + assertions[type][i] + '\' instead got \'' + cast.active + '\'' + JSON.stringify(cast));
		}
	},
	'castProperties does not effect untyped properties': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql({
			phoneNumber: '555-0923'
		}, entityDefinition.castProperties({ phoneNumber: '555-0923' }));
	},
	'validate does not error on schemas without validation': function() {
		var entityDefinition = createTestEntityDefinition();
		entityDefinition.validate(entityDefinition.makeDefault({ name: 'Paul' }), 'all', function(errors) {
			assert.eql(errors, {});
		});
	},
	'validate returns error for missing property': function() {
		var entityDefinition = createTestEntityDefinition();

		entityDefinition.schema.name.validators = {
			all: [validation.required]
		};

		entityDefinition.validate(entityDefinition.makeDefault({ name: '' }), 'all', function(errors) {
			assert.eql(errors, {"name":"Full Name is required"});
		});
	},
	'validate uses the [all] set by default': function() {
		var entityDefinition = createTestEntityDefinition();

		entityDefinition.schema.name.validators = {
			all: [validation.required]
		};

		entityDefinition.validate(entityDefinition.makeDefault({ name: '' }), 'all', function(errors) {
			assert.eql(errors, {name: "Full Name is required"});
		});
	},
	'validate returns error for missing property but not for valid property': function() {
		var entityDefinition = createTestEntityDefinition();

		entityDefinition.schema.name.validators = {
			all: [validation.required]
		};

		entityDefinition.schema.age.validators = {
			all: [validation.required]
		};

		entityDefinition.validate(entityDefinition.makeDefault({ name: '', age: 33 }), 'all', function(errors) {
			assert.eql(errors, { name: "Full Name is required" });
		});
	},
	'validate uses all validators': function() {
		var entityDefinition = createTestEntityDefinition();

		entityDefinition.schema.name.validators = {
			all: [validation.required, validation.length(2, 4)]
		};

		entityDefinition.validate(entityDefinition.makeDefault({ name: 'A' }), 'all', function(errors) {
			assert.eql(errors, {name: "Full Name must be between 2 and 4 in length"});
		});
	},
	'propertyName returns name when available': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql(entityDefinition.propertyName('name'), 'Full Name');
	},
	'propertyName returns converted name': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.eql(entityDefinition.propertyName('age'), 'Age');
	},
	'propertyName throws RangeError on unspecified property': function() {
		var entityDefinition = createTestEntityDefinition();
		assert.throws(function() {
			entityDefinition.propertyName('Wobble');
		}, /RangeError/);
	}
};