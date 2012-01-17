# piton-entity - Common functions to work with data entities
Tools for managing objects that represent business entities

## Installation

	$ npm install piton-simplate

## Usage

	var EntityDefinition = require('piton-entity');

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

	var blank = entityDefinition.makeBlank();
	// blank is now equal to:
	//	{
	//		name: null,
	//		age: null,
	//		active: null,
	//		phoneNumber: null
	//	}

	var default = entityDefinition.makeDefault();
	// default is now equal to:
	//	{
	//		name: null,
	//		age: 0,
	//		active: true,
	//		phoneNumber: null
	//	}

	var stripped = entityDefinition.stripUnknownProperties({
		name: 'Dom',
		extra: 'This should not be here'
	});
	// stripped is now equal to:
	//	{
	//		name: 'Dom'
	//	}

## Credits
[Paul Serby](https://github.com/PabloSerbo/)
[Dom Harrington](https://github.com/domharrington/)

## Licence
Licenced under the [New BSD License](http://opensource.org/licenses/bsd-license.php)
