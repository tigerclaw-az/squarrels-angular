export function PantherParserDirective($log) {
	'ngInject';

	let directive = {
		restrict: 'A',
		require: '?ngModel',
		scope: {
			pantherType: '@'
		},
		link: function(scope, element, attrs, ngModel) {
			/**
			 * [transformValue description]
			 * @param  {[type]} value [description]
			 * @param  {[type]} type  [description]
			 * @return {[type]}       [description]
			 */
			scope.transformValue = function(value, type) {
				if (type === 'alpha') {
					return value.replace(/[^a-zA-Z\s]/g, '');
				} else if (type === 'numeric') {
					return value.replace(/[^0-9]/g, '');
				}

				return value;
			};

			/**
			 * Setup custom parsers whenever 'panther-parser' attribute is used on
			 * 'input' field
			 * @param  {String} inputValue
			 * @return {String} The inputValue transformed or empty
			 */
			ngModel.$parsers.push(function(inputValue) {
				var type = scope.pantherType || 'numeric';

				if (inputValue == undefined) {
					return '';
				}

				let transformedInput = scope.transformValue(inputValue, type);

				if (transformedInput !== inputValue) {
					ngModel.$setViewValue(transformedInput);
					ngModel.$render();
				}

				return transformedInput;
			});
		}
	};

	return directive;
}
