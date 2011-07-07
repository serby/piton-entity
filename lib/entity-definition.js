var
_ = require('underscore'),
stringUtils = require('piton-string-utils');

var EntityDefinition = module.exports.EntityDefinition = function() {};

EntityDefinition.prototype.makeDefault = function() {
	var returnObject = {};
	_.each(this.entitySchema, function(value, key) {
		var defaultValue;
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
		returnObject[key] = defaultValue;
	});
	return returnObject;
};

EntityDefinition.prototype.makeBlank = function() {
	var returnObject = {};
	_.each(this.entitySchema, function(value, key) {
			returnObject[key] = null;
	});
	return returnObject;
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
	_.each(this.entitySchema, function(property, key) {
		if ((property.validators === undefined) || (property.validators[set] === undefined)) {
			return false;
		}
		_.each(property.validators[set], function(validator) {
			if (errors[key]) {
				return false;
			}

			propertyName = (property.name === undefined) ? stringUtils.decamelcase(key) : property.name;

			try {
				validator.validate(propertyName, entityObject[key]);
			} catch (error) {
				errors[key] = error.message;
			}
		});
	});
	return errors;
};

EntityDefinition.prototype.getEntitySchema = function() {
	return this.entitySchema;
};
