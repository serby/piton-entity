var
	async = require('async'),
	stringUtils = require('piton-string-utils');

module.exports.createEntityDefinition = function(schema) {

	// Start with a blank scheme to reduce error checking
	if (schema === undefined) {
		schema = {};
	} else {
		schema = schema;
	}


	/**
	 * Returns a new object with properties and default values from the schema definition.
	 *
	 * If existingEntity is passed then extends it with the default properties.
	 *
	 * @param {Object} existingEntity Object to extend
	 * @return {Object} A blank object based on schema
	 */
	function makeDefault(existingEntity) {
		var newEntity = {};
		Object.keys(schema).forEach(function(key) {
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

			newEntity[key] = defaultValue;
		});
		return newEntity;
	}


	/**
	 * Returns an object with properties defined in schema but with empty values.
	 * The empty value will depend on the type:
	 * * array = []
	 * * object = {}
	 * * string = null
	 * * boolean = null
	 * * integer = null
	 * * real = null
	 * @return {Object} A blank object based on schema
	 */
	function makeBlank() {
		var
			newEntity = {},
			value;

		Object.keys(schema).forEach(function(key) {
			var value = null;
			switch (schema[key].type) {
				case 'object':
					value = {};
					break;
				case 'array':
					value = [];
					break;
			}
			newEntity[key] = value;
		});
		return newEntity;
	}

	/**
	 * Has a property got a tag
	 */
	function hasTag(schema, key, tag) {
		return (tag === undefined) || ((schema[key].tag !== undefined) && (schema[key].tag.indexOf(tag) !== -1));
	}

	/**
	 * Takes an object and strips out properties not in the schema. If a tag is given
	 * then only properties with that tag will remain.
	 * @param {Object} entityObject The object to strip
	 * @param {String} tag Property tag to strip down to. If undefined all properties in the schema will be returned.
	 * @return {Object} The striped down object
	 */
	function stripUnknownProperties(entityObject, tag) {
		var
			newEntity = {};

		Object.keys(entityObject).forEach(function(key) {
			if ((typeof schema[key] !== 'undefined') && (hasTag(schema, key, tag))) {
				newEntity[key] = entityObject[key];
			}
		});
		return newEntity;
	}

	/**
	 * Casts a value to a given type.
	 *
	 * For booleans and integers; undefined, '', and null will all be cast to null
	 * For array they will be converted to []
	 * For object they will be converted to {}
	 *
	 * Throws error is type is undefined.
	 *
	 * @param {String} type The type you would like to cast value to
	 * @param {Mixed} value The value to be cast
	 */
	function cast(type, value) {
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
			// Integer was a mistake and will be removed
			case 'integer':
			case 'number':
				if (value === undefined || value === '' || value === null) {
					return null;
				}
				return +value;
			case 'object':
				return (value === '' || value === null || value === undefined) ? {} : value;
			case 'array':
				return (value === '' || value === null || value === undefined) ? [] : (Array.isArray(value) ? value : [value]);
		}
		return value;
	}

	/**
	 * Casts all the properties in the given entityObject that are defined in the schema.
	 * If tag is provided then only properties that are in the schema and have the given tag will be cast.
	 * @param {Object} entityObject The entity to cast properties on
	 * @param {String} tag Which properties in the scheme to cast
	 * @return {Object} A new object with cast properties
	 */
	function castProperties(entityObject, tag) {
		var
			newEntity = {};

		Object.keys(entityObject).forEach(function(key) {
			// Copy all properties
			newEntity[key] = entityObject[key];

			// Only cast properties in the schema and tagged, if tag is provided
			if ((schema[key] !== undefined) && (schema[key].type) && (hasTag(schema, key, tag))) {
				newEntity[key] = cast(schema[key].type, entityObject[key]);
			}
		});

		return newEntity;
	}

	/**
	 * Validates entity against the specified set, is set is not give the set 'all' will be assumed.
	 *
	 * @param {Object} entity The object to be validated
	 * @param {Mixed} set Either the name or an array of names of the rules to validate entity against
	 * @param {String} tag The tag to validate against (optional)
	 * @param {Function} callback Called once validation is complete, passing an array either empty of containing errors
	 */
	function validate(entityObject, set, tag, callback) {
		var
			errors = {},
			processedSchema = schema;

		// This is to be tolerant of no set and tag parameters
		if (typeof set === 'function') {
			callback = set;
			set = 'all';
		// This is to be tolerant of the optional tag parameter
		} else if (typeof tag === 'function') {
			callback = tag;
		// This is to check if all parameters are present and reduce schema
		} else if (typeof callback === 'function') {
			var reducedSchema = {};
			Object.keys(schema).forEach(function(key) {
				if(hasTag(schema, key, tag)) {
					reducedSchema[key] = schema[key];
				}
			});
			processedSchema = reducedSchema;
		}

		// 'all' is reserved as the default validator set
		set = set || 'all';

		async.forEach(Object.keys(processedSchema), function(key, propertyCallback) {
			var property = processedSchema[key];
			if ((property.validators === undefined) || (property.validators[set] === undefined)) {
				return propertyCallback();
			}
			var validators = property.validators[set];

			var propertyName = (property.name === undefined) ? stringUtils.decamelcase(key) : property.name;
			async.forEach(validators, function(validator, validateCallback) {
				if (errors[key]) {
					validateCallback();
				} else {
					validator.validate(propertyName, entityObject[key], validateCallback);
				}
			}, function(error) {
				if (error && error.message) {
					errors[key] = error.message;
				}
				propertyCallback();
			});
		}, function(error) {
			callback(errors);
		});
	}

	function propertyName (property) {
		if (schema[property] === undefined) {
			throw new RangeError('No property \'' + property + '\' in schema');
		}
		return (schema[property].name === undefined) ? stringUtils.decamelcase(property) : schema[property].name;
	}

	return {
		schema: schema,
		makeDefault: makeDefault,
		makeBlank: makeBlank,
		hasTag: hasTag,
		stripUnknownProperties: stripUnknownProperties,
		cast: cast,
		castProperties: castProperties,
		validate: validate,
		propertyName: propertyName
	};
};