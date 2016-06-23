;(function ($) {
	"use strict";

	/* Defaul options */
	var defaults = {
			rules: {},
			messages: {},
			errors: {
				scroll: false,
				highlight: false,
				inBlock: false,
				inTooltip: false,
				underField: false,
			},
			formType: {
				modal: false,
				multistep: false,
			},
			formRedirect: {
				redirect: false,
				address: 'http://codecanyon.net/user/lazycode'
			},
			formHide: {
				hide: false,
				block: '<div></div>',
				class: 'success-message-wrap',
				message: 'Thank you! We got your email successfully'
			},
			repeatSubmission: false,
			debug: false,
			debugArr: [],
			submitHandler:function() {},
			lang: {
				inBlock: 'Oops! The following errors occurred:',
				button: 'Thanks!'
			},
			mimeTypes: {
				'jpeg': 'image/jpeg',
				'tiff': 'image/tiff',
				'jpg': 'image/jpg',
				'png': 'image/png',
				'gif': 'image/gif',
				'ico': 'image/vnd.microsoft.icon',
				'doc': 'application/msword',
				'xls': 'application/vnd.ms-excel',
				'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
				'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
				'csv': 'text/csv',
				'zip': 'application/zip',
				'gzip': 'application/gzip',
				'rar': 'application/x-rar-compressed',
				'odf': ['application/vnd.oasis.opendocument.text',
						'application/vnd.oasis.opendocument.spreadsheet',
						'application/vnd.oasis.opendocument.presentation',
						'application/vnd.oasis.opendocument.graphics'],
				'pdf': 'application/pdf',
				'powerpoint': ['application/vnd.ms-powerpoint',
								'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
				'mpeg': ['audio/mpeg','video/mpeg'],
				'mp4': ['audio/mp4','video/mp4'],
				'ogg': ['audio/ogg','video/ogg','application/ogg'],
			}
		};

	/* Merge two objects */
	function merge( obj, form ) {

		var key, sl, len, i, col,
			res = {},
			checked = false;

		for (key in obj) {
			if (form.elements[key] !== undefined) {
				sl = key.slice(-2);
				if (sl === '[]') {
					col = document.getElementsByName(key);
					len = col.length;
					for (i = 0; i<len; i++) {
						if (col[i].type === 'checkbox' || col[i].type === 'radio') {
							if (col[i].checked) {
								checked = true;
								res[key] = col[i];
							}
						}
					}
					if (!checked) {
						res[key] = col[0];
					}
					checked = false;
					continue;
				}
				res[key] = form.elements[key];
			}
		}
		return res;
	}

	/* Find ancestor by class */
	// function findAncestor(el, cls) {
	// 	while ((el = el.parentElement) && !el.classList.contains(cls));
	// 	return el;
	// }

	/* File validation */
	function fileCheck( file, rules, messages, mimeTypes ) {

		var type, len, i,
			fileObj 	= file.files[0],
			required	= rules.required,
			validate	= rules.validate,
			extension	= rules.extension.toLowerCase(),
			size		= rules.size * 1024 * 1024,
			allowedTypes = [],
			extensionArr = extension.split('|');

		// Add required valid types
		for ( type in mimeTypes ) {
			if ( extensionArr.indexOf(type) !== -1 ) {
				if ( $.isArray( mimeTypes[type] ) ) {
					len = mimeTypes[type].length;
					for ( i=0; i<len; i++ ) {
						allowedTypes.push( mimeTypes[type][i] );
					}
				continue;
				}
				allowedTypes.push( mimeTypes[type] );
			}
		}

		// Validation
		if (validate || required) {
			// If file is required
			if ( required ) {
				// If file is empty
				if ( !fileObj ) {
					return messages.required;
				}
			}
			// If file is not required
			// Validate file only if it exists
			if ( fileObj ) {
				// Check allowed file types
				if ( allowedTypes.indexOf(fileObj.type) === -1 ) {
					return messages.size_extension;
				}
				// Check allowed file size
				if ( fileObj.size > size) {
					return messages.size_extension;
				}
				return false;
			}
		}
	}

	/* Email validation */
	function emailCheck( field ) {
		var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i;
		return !re.test( field.value );
	}

	/* Url validation */
	function urlCheck( field ){
		var re = /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})).?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
		return !re.test( field.value );
	}

	/* Equal To validation */
	function equalToCheck( field, target ){
		var fieldVal = field.value.trim(),
			targetObj = $( target );

		if ( !targetObj.length ) {
			return true;
		}
		return ( fieldVal !== targetObj.val().trim() ) ? true : false;
	}

	/* Min value validation */
	function minValueCheck( field, minVal ){
		var val = field.value.trim(),
			re = /^-?\d+(?:\.\d+)?$/;

		if ( !re.test(field.value) ) {
			return true;
		}
		return ( val < minVal ) ? true : false;
	}

	/* Max value validation */
	function maxValueCheck( field, maxVal ){
		var val = field.value.trim(),
			re = /^-?\d+(?:\.\d+)?$/;

		if ( !re.test(field.value) ) {
			return true;
		}
		return ( val > maxVal ) ? true : false;
	}

	/* Range value validation */
	function rangeValueCheck( field, rangeVal ){
		var val = field.value.trim(),
			re = /^-?\d+(?:\.\d+)?$/;

		if ( !re.test(field.value) ) {
			return true;
		}
		return ( val < rangeVal[0] || val > rangeVal[1] ) ? true : false;
	}

	/* Min length validation */
	function minLengthCheck( field, minLen ) {
		var val = field.value.trim();
		if ( field.type === 'checkbox' || field.type === 'radio' ) {
			if ( field.checked ) {
				return ( val.length < minLen ) ? true : false;
			} else {
				return true;
			}
		}
		return ( val.length < minLen ) ? true : false;
	}

	/* Max length validation */
	function maxLengthCheck( field, maxLen ) {
		var val = field.value.trim();
		return ( val.length > maxLen ) ? true : false;
	}

	/* Range length validation */
	function rangeLengthCheck( field, rangeLen ) {
		var val = field.value.trim();
		return ( val.length < rangeLen[0] || val.length > rangeLen[1] ) ? true : false;
	}

	/* Integer validation */
	function integerCheck( field ) {
		var re = /^-?\d+$/;
		return !re.test( field.value );
	}

	/* Number validation */
	function numberCheck( field ) {
		var re = /^-?\d+(?:\.\d+)?$/;
		return !re.test( field.value );
	}

	/* Required from group validation */
	function requiredFromGroupCheck( field, minLen ) {
		var val = field.value.trim();
		if ( field.type === 'checkbox' || field.type === 'radio' ) {
			if ( field.checked ) {
				return ( val.length < minLen ) ? true : false;
			} else {
				return true;
			}
		}
		return ( val.length < minLen ) ? true : false;
	}

	/* Validate rules object */
	function rulesCheck( obj ) {

		var self = this,
			config = self.config,
			valLen, err, i;

		$.each(obj, function(name, value) {
			$.each(value, function(rule, val) {
				switch( rule ) {
					case 'required':
					case 'email':
					case 'url':
					case 'integer':
					case 'number':
					case 'validate':
						if ( $.type( val ) !== 'boolean' ) {
							config.debugArr.push( errorMsg( rule, val ) );
						}
						break;
					case 'minlength':
					case 'maxlength':
					case 'minvalue':
					case 'maxvalue':
						if ( !Number.isInteger( val ) ) {
							config.debugArr.push( errorMsg( rule, val ) );
						}
						break;
					case 'rangelength':
					case 'rangevalue':
						if ( !$.isArray( val ) ||
								val.length !== 2 ||
								!Number.isInteger( val[0] ) ||
								!Number.isInteger( val[1] ) ||
								val[0] > val[1]
							) {
							config.debugArr.push( errorMsg( rule, val ) );
						}
						break;
					case 'size':
						if ( !$.isNumeric( val ) || val <= 0 ) {
							config.debugArr.push( errorMsg( rule, val ) );
						}
						break;
					case 'extension':
					case 'equalTo':
						if ( $.type( val ) !== 'string' ) {
							config.debugArr.push( errorMsg( rule, val ) );
						}
						break;
					case 'requiredFromGroup':
						console.log('requiredFromGroup checking rule');
						break;
					default:
						config.debugArr.push( 'User settings -> "rules" array:\n Unknown validation rule: ' + rule );
				}
			});
		});
	}

	/* Validate messages object */
	function messagesCheck( obj ) {

		var rKeys = Object.keys( obj.rules ).sort(),
			mKeys = Object.keys( obj.messages ).sort();

		if ( JSON.stringify( rKeys ) !== JSON.stringify( mKeys ) ) {
			this.config.debugArr.push( 'User settings:\n field names in "rules" and "messages" are mismatched' );
		}
	}

	/* Config check error message */
	function errorMsg( rule, val ) {
		return 'User settings -> "rules" array -> "' + rule + '" rule:\n Not allowed value - ' + val + ', type: ' + $.type( val );
	}

	/* Constructor */
	function ContactUs( obj, options ) {
		this.config 		= $.extend( true, {}, defaults, options );
		this.$form 			= obj;
		this.form 			= obj[0];
		this.$formResponse	= this.$form.find( '.response' );
		this.$submitBtn 	= this.$form.find( 'button[type="submit"]' );
		this.errorExists	= false;
		this.errorMessages	= [];

		if ( this.config.formType.modal ) {
			this.$modalWrap 	= this.$form.closest( '.modal-form' );
			this.$modalOpen 	= $(document).find( '.modal-open' );
			this.$modalClose	= this.$form.find( '.modal-close' );
		}

		if ( this.config.formType.multistep ) {
			this.$contentDiv 	= this.$form.children( '.content' );
			this.$footerDiv		= this.$form.children( '.footer' );
			this.$nextBtn		= this.$form.find( '.multi-next-btn' );
			this.$prevBtn		= this.$form.find( '.multi-prev-btn' );
			this.$steps			= this.$contentDiv.children( 'fieldset' );
		}

		this.init();
	}

	/* Init */
	ContactUs.prototype.init = function(){

		var self = this,
			$form = self.$form,
			config = self.config,
			str;

		if ( $.isEmptyObject( config.rules ) ) {
			config.debugArr.push( 'User settings:\n You have to specify validation rules for a form' );
		} else {
			rulesCheck.call( self, config.rules );
		}
		if ( $.isEmptyObject( config.messages ) ) {
			config.debugArr.push( 'User settings:\n You have to specify validation messages for a form' );
		} else {
			messagesCheck.call( self, config );
		}

		// Modal form
		if ( config.formType.modal ) {
			// If modal links dont exist
			if ( !self.$modalOpen.length ) {
				config.debugArr.push( 'Could not find a link/button to open modal form' );
			}
			self.modalFormLayout();
			self.modalFormProcessing();
		}

		// Multistep form
		if ( config.formType.multistep ) {
			self.multistepFormLayout();
			self.multistepFormProcessing();
		}

		// Debug result
		if ( config.debugArr.length ) {
			if ( config.debug ) {
				str = config.debugArr.join( '\n -------------- \n' );
				console.warn( str );
				alert( str );
				config.debugArr = [];
			}
			$form.on( 'submit', false );
			return false;
		}

		// Bind submit event
		$form.on( 'submit', self.submitForm.bind(self) );

	};

	/* Submit a form */
	ContactUs.prototype.submitForm = function(e) {
		console.log('submitForm method');

		// console.log(this);

		var self 		= this,
			$submitBtn	= self.$submitBtn,
			$prevBtn 	= self.$prevBtn,
			fieldArr	= {};

		if (e) {
			e.preventDefault();
			e.stopPropagation();
		}

		// Buttons disabled
		$submitBtn.addClass( 'processing' ).attr( 'disabled', true );
		if ( self.config.formType.multistep ) {
			$prevBtn.attr( 'disabled', true );
		}

		// Clear a form
		self.clearForm();

		// Create an object with form fields and values
		fieldArr = merge( self.config.rules, self.form );

		// console.log(fieldArr);

		// Form validation
		self.validateForm( fieldArr );

		// If errors exist
		if ( self.errorExists ) {

			// Scroll to first element with error
			if ( self.config.errors.scroll ) {
				self.scrollToError();
			}

			// Show errors within an error block
			if ( self.config.errors.inBlock ) {
				self.blockError( self.errorMessages );
			}

			// Buttons enabled
			$submitBtn.removeClass( 'processing' ).removeAttr( 'disabled' );
			if ( self.config.formType.multistep ) {
				$prevBtn.removeAttr( 'disabled' );
			}
			return false;
		}

		// Send form data
		// self.sendFormData();
	};

	/* Clear a form */
	/* Delete error messages, "error" CSS classes */
	ContactUs.prototype.clearForm = function(){
		console.log('clearForm method');

		var $spanErr, $tooltipErr, $input,
			self 	= this,
			$form 	= self.$form,
			config = self.config;

		// Clear error variables
		self.errorExists = false;
		self.errorMessages = [];

		// Delete error messages under the fields
		if ( config.errors.underField ) {
			$spanErr = $form.find('span.error-view');
			$spanErr.each(function(){
				$(this).remove();
			});
		}

		// Delete error messages from an error block
		if ( config.errors.inBlock ) {
			self.blockClear();
		}

		// Remove error condition from the fields
		if ( config.errors.highlight ) {
			$input = $form.find( '.input' );
			$input.each(function(){
				if ( $( this ).hasClass( 'error-view' ) ) {
					$( this ).removeClass( 'error-view' );
				}
			});
		}

		// Delete tooltip error messages
		if ( config.errors.inTooltip ) {
			$tooltipErr = $form.find( 'span.tooltip-error-view' );
			$tooltipErr.each(function(){
				$( this ).remove();
			});
		}
	};

	/* Validate form */
	ContactUs.prototype.validateForm = function( fieldArr ){
		console.log('validateForm method');

		var field, file, rule, res,
			count = {},
			self = this,
			config = self.config;

		// Apply validation rules for every form field
		for (field in config.rules) {

			// If HTML form does not have a field
			if ( fieldArr[field] === undefined || fieldArr[field] === null ) {
				continue;
			}

			// Files processing
			if ( fieldArr[field].hasAttribute('type') && fieldArr[field].type === 'file' ) {
				if ( config.rules[field].required || config.rules[field].validate ) {
					res = fileCheck( fieldArr[field], config.rules[field], config.messages[field], config.mimeTypes );
					if (res) {
						self.stateError( fieldArr[field], res );
					}
					continue;
				}
			}

			// Fields processing
			for ( rule in config.rules[field] ) {

				if ( rule === 'required' ) {
					if ( config.rules[field][rule] === true ) {
						if ( minLengthCheck( fieldArr[field], 1 ) ) {
							self.stateError( fieldArr[field], config.messages[field][rule] );
							break;
						}
					}
					// if (config.rules[field][rule] === false) {
					// 	break;
					// }
				}

				if ( rule === 'email' ) {
					if ( config.rules[field][rule] === true ) {
						if ( emailCheck(fieldArr[field]) ) {
							self.stateError( fieldArr[field], config.messages[field][rule] );
							break;
						}
					}
				}

				if ( rule === 'url' ) {
					if ( config.rules[field][rule] === true ) {
						if ( urlCheck(fieldArr[field]) ) {
							self.stateError( fieldArr[field], config.messages[field][rule] );
							break;
						}
					}
				}

				if ( rule === 'minlength' ) {
					if ( minLengthCheck(fieldArr[field], config.rules[field][rule]) ) {
						self.stateError( fieldArr[field], config.messages[field][rule] );
						break;
					}
				}

				if ( rule === 'maxlength' ) {
					if ( maxLengthCheck(fieldArr[field], config.rules[field][rule]) ) {
						self.stateError( fieldArr[field], config.messages[field][rule] );
						break;
					}
				}

				if ( rule === 'rangelength' ) {
					if ( rangeLengthCheck( fieldArr[field], config.rules[field][rule] ) ) {
						self.stateError( fieldArr[field], config.messages[field][rule] );
						break;
					}
				}

				if ( rule === 'minvalue' ) {
					if ( minValueCheck(fieldArr[field], config.rules[field][rule]) ) {
						self.stateError( fieldArr[field], config.messages[field][rule] );
						break;
					}
				}

				if ( rule === 'maxvalue' ) {
					if ( maxValueCheck(fieldArr[field], config.rules[field][rule]) ) {
						self.stateError( fieldArr[field], config.messages[field][rule] );
						break;
					}
				}

				if ( rule === 'rangevalue' ) {
					if ( rangeValueCheck( fieldArr[field], config.rules[field][rule] ) ) {
						self.stateError( fieldArr[field], config.messages[field][rule] );
						break;
					}
				}

				if ( rule === 'integer' ) {
					if ( config.rules[field][rule] === true ) {
						if ( integerCheck( fieldArr[field] ) ) {
							self.stateError( fieldArr[field], config.messages[field][rule] );
							break;
						}
					}
				}

				if ( rule === 'number' ) {
					if ( config.rules[field][rule] === true ) {
						if ( numberCheck( fieldArr[field] ) ) {
							self.stateError( fieldArr[field], config.messages[field][rule] );
							break;
						}
					}
				}

				if ( rule === 'equalTo' ) {
					if ( equalToCheck( fieldArr[field], config.rules[field][rule] ) ) {
						self.stateError( fieldArr[field], config.messages[field][rule] );
						break;
					}
				}
			}
		}
	};

	/* Set error conditions for form fields */
	ContactUs.prototype.stateError = function( field, msg ){
		console.log('stateError method');

		var elem,
			self 		= this,
			config 		= self.config,
			$parentElem = $(field).closest('.input');

		// Error exists
		self.errorExists = true;

		// Add class 'error-view'
		if (config.errors.highlight) {
			$parentElem.addClass('error-view');
		}

		// Show errors in tooltips
		if (config.errors.inTooltip) {
			elem = $('<span></span>', {
				class: 'tooltip tooltip-right-top tooltip-error-view',
				text: msg
			});
			$parentElem.append(elem);
		}

		// Show errors under appropriate fields
		if (config.errors.underField) {
			elem = $('<span></span>', {
				class: 'error-view',
				text: msg
			});
			$parentElem.append(elem);
		}

		// Add error message into an array
		// For showing into error block
		if (config.errors.inBlock) {
			self.errorMessages.push(msg);
		}
	};

	/* Make a layout for multistep form */
	ContactUs.prototype.multistepFormLayout = function(){
		console.log('multistepFormLayout method');

		var $elem, $elems, $elemsLen, $tempStep, $tempSteps, i,
			self = this,
			$form = self.$form;

		// Add class "j-multistep"
		if ( !$form.hasClass( 'j-multistep' ) ) {
			$form.addClass( 'j-multistep' );
		}

		// If a form doesn't have 'next' button
		if ( !self.$nextBtn.length ) {
			$elem = $('<button></button>', {
				type: 'button',
				class: 'primary-btn multi-next-btn',
				text: 'Next'
			});
			if ( self.$footerDiv.length ) {
				self.$footerDiv.append( $elem );
			} else {
				self.$contentDiv.append( $elem );
			}
			self.$nextBtn = self.$form.find( '.multi-next-btn' );
		}

		// If a form doesn't have 'previous' button
		if ( !self.$prevBtn.length ) {
			$elem = $('<button></button>', {
				type: 'button',
				class: 'secondary-btn multi-prev-btn',
				text: 'Back'
			});
			if ( self.$footerDiv.length ) {
				self.$footerDiv.append( $elem );
			} else {
				self.$contentDiv.append( $elem );
			}
			self.$prevBtn = self.$form.find( '.multi-prev-btn' );
		}

		// If a form doesn't have fieldsets
		if ( !self.$steps.length ) {
			// Find form fields
			$elems = self.$contentDiv.children( '.unit, .j-row' );
			$elemsLen = $elems.length;

			for (i=0; i<$elemsLen; i+=3) {
				// Add fields to a step
				$tempStep = $('<fieldset></fieldset>').append( $elems.slice( i, i+3 ) );

				// Add step to a form
				$tempSteps = self.$contentDiv.children( 'fieldset' );
				if ( !$tempSteps.length ) {
					self.$contentDiv.prepend( $tempStep );
					continue;
				}
				$tempStep.insertAfter( $tempSteps.last() );
			}
			self.$steps = self.$contentDiv.children( 'fieldset' );
		}
	};

	/* Multistep form processing */
	ContactUs.prototype.multistepFormProcessing = function(){

		console.log('multistepFormProcessing method');

		var self = this,
			form = self.form,
			$form = self.$form,
			config = self.config,
			$steps = self.$steps,
			len = self.$steps.length,
			$nextBtn = self.$nextBtn,
			$prevBtn = self.$prevBtn,
			$submitBtn = self.$submitBtn,
			fieldArr;

		// Processing of the first fieldset
		$steps.eq(0).addClass('active-fieldset');
		$submitBtn.addClass('hiddenBtn');
		$prevBtn.addClass('hiddenBtn');

		if ( len === 1 ) {
			config.debugArr.push("Multistep form has only one step. At least two steps are required!");
		}

		// Click on the "next" button
		$nextBtn.on('click', function(e){
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}

			// Clear a form
			self.clearForm();

			// Find fields from active step for validation
			fieldArr = merge( config.rules, form.querySelector('.active-fieldset') );

			// console.log(fieldArr);

			// Form validation
			self.validateForm(fieldArr);

			// If errors don't exist
			if ( !self.errorExists ) {

				// Switch the "active" class to the next fieldset
				$steps.filter('.active-fieldset').removeClass('active-fieldset').next('fieldset').addClass('active-fieldset');

				// Display "prev" button
				$prevBtn.removeClass('hiddenBtn');

				// If active fieldset is a last
				// processing the buttons
				if ( $steps.eq(len-1).hasClass('active-fieldset') ) {
					$submitBtn.removeClass('hiddenBtn');
					$nextBtn.addClass('hiddenBtn');
				}
			
			// If current fieldset has validation errors
			} else {
				// Scroll to first element with error
				if ( config.errors.scroll ) {
					self.scrollToError();
				}
				// Show errors within an error block
				if ( config.errors.inBlock ) {
					self.blockError( self.errorMessages );
				}
				return false;
			}
		});

		// Click on the "prev" button
		$prevBtn.on('click', function(e){
			if (e) {
				e.preventDefault();
				e.stopPropagation();
			}

			// Clear a form
			self.clearForm();

			// Switch the "active" class to the previous fieldset
			$steps.filter('.active-fieldset').removeClass('active-fieldset').prev('fieldset').addClass('active-fieldset');

			// If active fieldset is a first
			// processing the buttons
			if ( $steps.eq(0).hasClass('active-fieldset') ) {
				$prevBtn.addClass('hiddenBtn');
			}

			// If active fieldset is a penultimate
			// processing the buttons
			if ( $steps.eq(len-2).hasClass('active-fieldset') ) {
				$submitBtn.addClass('hiddenBtn');
				$nextBtn.removeClass('hiddenBtn');
			}
		});
	};

	/* Make a layout for modal form */
	ContactUs.prototype.modalFormLayout = function(){

		console.log('modalFormLayout method');

		var $elem, $formWrap,
			self = this,
			$form = self.$form;

		// If a form doesn't have modal wrapper
		if ( !self.$modalWrap.length ) {
			$formWrap = $form.closest('.wrapper');

			// Modal wrapper
			$elem = $('<div></div>', {
				class: 'modal-form',
				id: 'modalwrap-' + $form.attr('id')
			});

			// Wrap a form with modal wrapper
			$formWrap.wrap($elem);
			self.$modalWrap = $form.closest('.modal-form');
		}

		// If a form doesn't have modal close button
		if ( !self.$modalClose.length ) {

			// Close button
			$elem = $('<label></label>', {
				class: 'modal-close'
			}).append('<i></i>');

			// Add close modal button
			$form.append($elem);
			self.$modalClose = $form.find('.modal-close');
		}
	};

	/* Modal form processing */
	ContactUs.prototype.modalFormProcessing = function(){

		console.log('modalFormProcessing method');

		var self = this;

		// Modal links processing
		self.$modalOpen.each(function(){
			$(this).on('click', function(e){
				if (e) {
					e.preventDefault();
					e.stopPropagation();
				}

				// Show modal form for approriate modal link
				if ( $(this).data('modal-wrap') === self.$modalWrap.attr('id') ) {
					self.$modalWrap.addClass('modal-visible');
					$('body').addClass('modal-scroll');
				}
			});
		});

		// Close button processing
		self.$modalClose.on('click', function(){
			self.$modalWrap.removeClass('modal-visible');
			$('body').removeClass('modal-scroll');
		});
	};

	/* AJAX request */
	ContactUs.prototype.ajaxRequestAsync = function(){

		console.log('ajaxRequestAsync method');

		var self = this,
			form = self.form,
			formData;

		// Form data
		formData = new FormData(form);

		return $.ajax({
			url: form.action,
			type: form.method,
			contentType: false,
			processData: false,
			cache: false,
			data: formData
		});
	};

	/* Send form data */
	ContactUs.prototype.sendFormData = function(){
		console.log('sendFormData method');

		var result,
			self 		= this,
			$prevBtn 	= self.$prevBtn,
			$submitBtn	= self.$submitBtn;

		self.ajaxRequestAsync().then(function(data) {
			result = $.parseJSON(data);

			// Error message from server
			if (result.errorMessage) {

				// Display error message
				self.blockError(result.errorMessage);

				// Buttons enabled
				$submitBtn.removeClass('processing').removeAttr('disabled');
				if (self.config.formType.multistep) {
					$prevBtn.removeAttr('disabled');
				}
			}

			// Success message from server
			if (result.successMessage) {

				// Hide form after successful submitting
				if (self.config.formHide.hide) {
					self.hideForm();
					return false;
				}

				// Redirect form after success submitting
				if (self.config.formRedirect.redirect) {
					self.redirectForm();
					return false;
				}

				// Clear a form
				// Display success message
				self.resetForm();
				self.blockSuccess(result.successMessage);
			}
		});
	};

	/* Reset form */
	ContactUs.prototype.resetForm = function(){
		console.log('resetForm method');

		var self = this;

		self.form.reset();
	};

	/* Hide form */
	ContactUs.prototype.hideForm = function(){
		console.log('hideForm method');

		
		var self = this,
			config = self.config,
			$form = self.$form,
			$prevBtn = self.$prevBtn,
			$submitBtn = self.$submitBtn,
			$block = $(config.formHide.block, {
				class: config.formHide.class
			});

		// Hide form
		$form.children().wrapAll('<div class="hide-hidden-children"></div>');

		// Buttons enabled
		$submitBtn.removeClass('processing').removeAttr('disabled');
		if (self.config.formType.multistep) {
			$prevBtn.removeAttr('disabled');
		}

		// Add message
		$form.append( $block.html(config.formHide.message) );

		// Modal form processing
		if (config.formType.modal) {
			setTimeout(function(){
				$('div.modal-form').removeClass('modal-visible');
				$('body').removeClass('modal-scroll');
			}, 4000);
		}

	};

	/* Redirect form */
	ContactUs.prototype.redirectForm = function(){
		console.log('redirectForm method');

		$(location).attr('href', self.config.formRedirect.address);
	};

	/* Scroll to first element with error */
	ContactUs.prototype.scrollToError = function() {
		console.log('scrollToError method');

		var self = this,
			// top = 0,
			elem,
			$err = self.$form.find('.error-view, .tooltip-error-view').eq(0),
			$modalWrap;

		// if ( self.config.formType.modal ) {
		// 	// $modalWrap = $(document).find('.modal-form').first();
		// 	$modalWrap = self.$form;
		// 	$(document).animate({
		// 		scrollTop: $err.offset().top - 40
		// 	}, 500);
		// 	return false;
		// }

		$('html, body').animate({
			scrollTop: $err.offset().top - 40
		}, 500);
	};

	/* Create a block with error messages */
	ContactUs.prototype.blockError = function( msg ){
		console.log('blockError method');

		var $li,
			self = this,
			$ul = $('<ul></ul>'),
			$formResponse = self.$formResponse;

		// Add class 'error-message'
		if ( !$formResponse.hasClass('error-message') ) {
			$formResponse.addClass('error-message unit');
		}

		$formResponse.text(self.config.lang.inBlock).append($ul);

		$(msg).each(function(){
			$li = $('<li></li>').text(this);
			$ul.append($li);
		});
	};

	/* Create a block with success message */
	ContactUs.prototype.blockSuccess = function( msg ){
		console.log('blockSuccess method');

		var self 		 = this,
			$form 		 = self.$form,
			config		 = self.config,
			$prevBtn 	 = self.$prevBtn,
			$nextBtn 	 = self.$nextBtn,
			$submitBtn	 = self.$submitBtn,
			$formResponse = self.$formResponse;

		// Clear response block
		if ( $formResponse.hasClass('error-message') ) {
			self.blockClear();
		}

		// Add success-message
		$formResponse.addClass('success-message unit').text(msg);

		// Button enabled
		$submitBtn.removeClass('processing');

		// If repeated form submission is not allowed
		if ( !config.repeatSubmission ) {
			// Disable submit button
			$submitBtn.addClass('disabled-view').html(config.lang.button);
		}

		setTimeout(function(){

			// If repeated form submission is allowed
			if ( config.repeatSubmission ) {
				$submitBtn.removeAttr('disabled');
			}

			self.blockClear();

			// Modal form processing
			if (config.formType.modal) {
				$('div.modal-form').removeClass('modal-visible');
				$('body').removeClass('modal-scroll');
			}

			// Multistep form processing
			if (config.formType.multistep) {
				// Buttons processing
				$prevBtn.removeAttr('disabled').addClass('hiddenBtn');
				$nextBtn.removeClass('hiddenBtn');
				$submitBtn.addClass('hiddenBtn');
				// Steps processing
				self.$steps.removeClass('active-fieldset').eq(0).addClass('active-fieldset');
			}
		}, 4000);
	};

	/* Clear a block with validation result */
	ContactUs.prototype.blockClear = function(){
		console.log('blockClear method');

		var self = this,
			$formResponse = self.$formResponse;

		$formResponse.removeClass('error-message success-message unit').html('');
	};

	$.fn.contactUs = function( options ) {
		console.log('jquery plugin');
		new ContactUs(this, options);
		return this;
	};
}(jQuery));


$( document ).ready( function(){
	$( '#contactus ').contactUs({
		/************************************************/
		/* User settings (JavaScript processing) */
		/************************************************/
		/* Select validation for fields */
		/* If you want to validate field - true, if you don't - false */
		rules:{
			select: {
				required: false
			},
			'check1[]': {
				required: false
			},
			check2: {
				required: false
			},
			'radio1[]': {
				required: false
			},
			radio2: {
				required: false
			},
			name: {
				required: false,
				// integer: false,
				// number: true,
				// rangelength: [2, 3],
				// minlength: 3,
				// maxlength: 8,
				// url: true,
				// minvalue: 5,
				// maxvalue: 10,
				// rangevalue: [5, 10]
				// equalTo: '#email'
				requiredFromGroup: [1, '.group1']
			},
			email: {
				required: false,
				email: false,
				url: false,
				requiredFromGroup: [1, '.group1']
			},
			subject: {
				required: false,
				requiredFromGroup: [1, '.group2']
			},
			message: {
				required: false,
				requiredFromGroup: [1, '.group2']
			},
			file_1: {
				validate: false,			// file is NOT required, if user adds a file - validate it
				required: false,			// file is ALWAYS required
				size: 1,					// allowed file size, Mb
				extension: 'jpg|jpeg|png',
			},
			file_2: {
				validate: false,			// file is NOT required, if user adds a file - validate it
				required: false,			// file is ALWAYS required
				size: 1,					// allowed file size, Mb
				extension: 'jpg|jpeg|png',
			},
		},
		/* Set error messages for the fields */
		messages:{
			select: {
				required: 'select is required'
			},
			'check1[]': {
				required: 'check1 is required'
			},
			check2: {
				required: 'check2 is required',
			},
			'radio1[]': {
				required: 'radio1 is required',
			},
			radio2: {
				required: 'radio2 is required',
			},
			name: {
				required: 'Name is required',
				rangelength: 'Name range length 2 - 5 chars',
				integer: 'Name only integers',
				number: 'Name only numbers',
				minlength: 'Name min length 3 chars',
				maxlength: 'Name max length 8 chars',
				minvalue: 'Name min value 5',
				maxvalue: 'Name max value 10',
				rangevalue: 'Name range value from 5 to 10',
				equalTo: 'Should be equal to email'
			},
			email: {
				required: 'Email is required',
				email: 'Incorrect email format',
				url: 'Incorrect url format',
			},
			subject: {
				required: 'Subject is required',
			},
			message: {
				required: 'Message is required',
			},
			file_1: {
				required: 'File_1 is required',
				size_extension: 'File_1 types: jpg, png. Size: 1Mb'
			},
			file_2: {
				required: 'File_2 is required',
				size_extension: 'File_2 types: jpg, png. Size: 1Mb'
			},
		},
		/************************************************/
		/* end User settings */
		/************************************************/
		/************************************************/
		/* Form settings */
		/************************************************/
		errors: {
			scroll: 	true,						// scroll a form to first element with error
			highlight:	true,						// highlight fields if errors occur
			inBlock:	true,						// show errors within a block
			inTooltip:	true,						// show errors within tooltips
			underField: true,						// show errors under appropriate fields
		},
		formType: {
			modal:		false,						// make a form modal
			multistep:	false,						// make a form multistep
		},
		formRedirect: {
			redirect: false,						// redirect a form after successful submission
			address: 'http://page_address.com'
		},
		formHide: {
			hide: false,							// hide a form after successful submission
			block: '<div></div>',
			class: 'success-message-wrap',
			message: 'Thank you! We got your email successfully'

			// block: {
			// 	elem: '<div></div>', добавить элемент как новый элемент в джквери
			// 	class: 'class'
			// 	id: 'id'
			// 	text: 'text nmessage'
			// }
		},
		repeatSubmission: true,						// allow repeated form submission
		debug: true,								// debug mode, script errors will be shown in the console
		submitHandler:function() {},
		/************************************************/
		/* end Form settings */
		/************************************************/
	});
});

