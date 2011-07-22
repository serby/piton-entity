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
	var returnObject = {};
	Object.keys(this.schema).forEach(function(key) {
			returnObject[key] = null;
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
	if (value === undefined) {
		return value;
	}
	switch (type) {
		case 'boolean':
			return !(value === false || value === null || value === 0 || value === '0' ||
			value === 'false' || value === 'off' || value === 'no' || value === '');
		case 'integer':
			return parseInt(+value, 10);
	}
	return value;
};

EntityDefinition.prototype.castProperties = function(entityObject) {
	var schema = this.schema;
	var self = this;
	Object.keys(schema).forEach(function(key) {
		if ((self.schema[key].type) && (entityObject[key] !== undefined)) {
			entityObject[key] = self.cast(schema[key].type, entityObject[key]);
		}
	});
	return entityObject;
};

/**
 * Validates entity against the specified set.
 *
 * @param {Object} entity The object to be validated
 * @param {Mixed} set Either the name or an array of names of the rules to validate entity against
 * @param {Function} callback Called once validation is complete, passing an array either empty of containing errors
 */
EntityDefinition.prototype.validate = function(entityObject, set) {
	var
		errors = {},
		schema = this.schema;

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
