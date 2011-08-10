var
	stringUtils = require('piton-string-utils');

var EntityDefinition = module.exports.EntityDefinition = function() {
	// Start with a blank scheme to reduce error checking
	this.schema = {};
};

EntityDefinition.prototype.makeDefault = function(existingEntity) {
	var returnObject = {};
	var schema = this.schema;
	Object.keys(this.schema).forEach(function(key) {
		var
			defaultValue,
			value = schema[key];

		// If an existingEntity is passed then use its values.
		// If it doesn't have that property then the default will be used.
		if ((existingEntity !== undefined) && (existingEntity[key] !== undefined)) {
			defaultValue = existingEntity[key];
		} else {
			switch (typeof value.defaultValue) {
				case 'undefined':
					defaultValue = null;
					break;
				case 'function':
					defaultValue = value.defaultValue();
					break;
				default:
					defaultValue = value.defaultValue;
			}
		}

		returnObject[key] = defaultValue;
	});
	return returnObject;
};

EntityDefinition.prototype.makeBlank = function() {
	var
		returnObject = {},
		schema = this.schema;

	Object.keys(schema).forEach(function(key) {
		value = null;
		switch (schema[key].type) {
			case 'object':
				value = {};
				break;
			case 'array':
				value = [];
				break;
		}
		returnObject[key] = value;
	});
	return returnObject;
};

EntityDefinition.prototype.stripUnknownProperties = function(entityObject) {
	Object.keys(entityObject).forEach(function(key) {
		if (typeof this.schema[key] === 'undefined') {
			delete entityObject[key];
		}
	}.bind(this));
	return entityObject;
};



EntityDefinition.prototype.cast = function(type, value) {
	if (type === undefined) {
		throw new Error('Missing type');
	}
	switch (type) {
		case 'boolean':
			if (value === undefined || value === '' || value === null) {
				return null;
			}
			return !(value === false || value === 0 || value === '0' ||
			value === 'false' || value === 'off' || value === 'no');
		case 'integer':
			if (value === undefined || value === '' || value === null) {
				return null;
			}
			return parseInt(+value, 10);
		case 'object':
			return (value === '' || value === null || value === undefined) ? {} : value;
		case 'array':
			return (value === '' || value === null || value === undefined) ? [] : (Array.isArray(value) ? value : [value]);
	}
	return value;
};

EntityDefinition.prototype.castProperties = function(entityObject, tag) {
	var
		schema = this.schema,
		self = this,
		expected = [];

	if (tag === undefined) {
		expected = Object.keys(self.schema);
	} else {
		// Find which properties are required
		Object.keys(self.schema).forEach(function(key) {
			if (self.schema[key].tag && Array.isArray(self.schema[key].tag) && self.schema[key].tag.indexOf(tag) > -1) {
				expected.push(key);
			}
		});
	}
	// Fix for the expected properties
	expected.forEach(function(key) {
		if (self.schema[key].type) {
			entityObject[key] = self.cast(self.schema[key].type, entityObject[key]);
		}
	});

	return entityObject;
};

/**
 * Validates entity against the specified set, is set is not give the set 'all' will be assumed.
 *
 * @param {Object} entity The object to be validated
 * @param {Mixed} set Either the name or an array of names of the rules to validate entity against
 * @param {Function} callback Called once validation is complete, passing an array either empty of containing errors
 */
EntityDefinition.prototype.validate = function(entityObject, set) {
	var
		errors = {},
		schema = this.schema;

	set = set || 'all';

	Object.keys(schema).forEach(function(key) {
		var property = schema[key];
		if ((property.validators === undefined) || (property.validators[set] === undefined)) {
			return false;
		}
		var validators = property.validators[set];
		for (var i = 0; i < validators.length; i += 1) {
			if (errors[key]) {
				return false;
			}

			var propertyName = (property.name === undefined) ? stringUtils.decamelcase(key) : property.name;

			try {
				 validators[i].validate(propertyName, key, entityObject);
			} catch (error) {
				errors[key] = error.message;
			}
		}
	});
	return errors;
};

EntityDefinition.prototype.filter = function function_name (argument) {
	// body...
}

