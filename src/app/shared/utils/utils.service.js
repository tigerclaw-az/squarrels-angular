'use strict';

export class UtilsService {
	constructor($log, _) {
		'ngInject';

		this._ = _;
		this.$log = $log;

		this.$log.debug('constructor()', this);
	}

	decode(str) {
		return window.atob(str);
	}

	encode(str) {
		return window.btoa(str);
	}

	getRandom(from, to) {
		return Math.random() * (to - from) + from;
	}

	getRandomStr(num) {
		var self = this;

		return this._.times(num, function() {
			return String.fromCharCode(self.getRandom(96, 122));
		}).join('').replace(/`/g, ' ');
	}

	getUuid(isShort = false) {
		let uuid = 'xxxxxxxx-xxxx-4xxx';

		if (!isShort) {
			uuid += '-yxxx-xxxxxxxxxxxx';
		}

		return uuid.replace(/[xy]/g, function(c) {
			var r = Math.random() * 16 | 0,
				v = c == 'x' ? r : (r & 0x3 | 0x8);

			return v.toString(16);
		});
	}
}
