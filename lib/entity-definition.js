var
	_ = require('underscore'),
	validator = require('./validator');

var EntityDefinition = module.exports.EntityDefinition = function() {};

/**
 * Validates entity against the specified set.
 *
 * @param {Object} entity The object to be validated
 * @param {Mixed} set Either the name or an array of names of the rules to validate entity against
 * @param {Function} callback Called once validation is complete, passing an array either empty of containing errors
 */
EntityDefinition.prototype.validate = function(entity, set, callback) {

	var rules = {};

		_.each(this.entitySchema, function(value, key) {
		var propertyRules = value.validation[set];
		if (propertyRules !== undefined) {
			if (!_.isArray(propertyRules)) {
				throw new Error('Validation rules must be in an array');
			}
		}
	});

	return validator.validate(entity, rules);
};

EntityDefinition.prototype.makeNew = function() {
	var returnObject = {};
	_.each(this.entitySchema, function(value, key) {
		var defaultValue;
		switch (typeof value.defaultValue) {
			case 'undefined':
				defaultValue = null;
				break;
			case 'function':
				defaultValue = defaultValue();
				break;
			default:
				defaultValue = value.defaultValue;
		}
		returnObject[key] = defaultValue;
	});
	return returnObject;
};

EntityDefinition.prototype.getEntitySchema = function() {
	return this.entitySchema;
};
