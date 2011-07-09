var
_ = require('underscore'),
stringUtils = require('piton-string-utils');

var EntityDefinition = module.exports.EntityDefinition = function() {
	// Start with a blank scheme to reduce error checking
	this.schema = {};
};

EntityDefinition.prototype.makeDefault = function(existingEntity) {
	var returnObject = {};
	_.each(this.schema, function(value, key) {
		var defaultValue;

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
	_.each(this.schema, function(value, key) {
			returnObject[key] = null;
	});
	return returnObject;
};

EntityDefinition.prototype.stripUnknownProperties = function(entityObject) {
	_.each(entityObject, (function(value, key) {
		if (typeof this.schema[key] === 'undefined') {
			delete entityObject[key];
		}
	}).bind(this));
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
	var errors = {};
	_.each(this.schema, function(property, key) {
		if ((property.validators === undefined) || (property.validators[set] === undefined)) {
			return false;
		}
		_.each(property.validators[set], function(validator) {
			if (errors[key]) {
				return false;
			}

			propertyName = (property.name === undefined) ? stringUtils.decamelcase(key) : property.name;

			try {
				validator.validate(propertyName, key, entityObject);
			} catch (error) {
				errors[key] = error.message;
			}
		});
	});
	return errors;
};
