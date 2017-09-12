export class SoundsService {
	constructor($log) {
		'ngInject';

		this.$log = $log.getInstance(this.constructor.name);

		this.soundsPath = 'assets/sounds/';
		this.soundEffects = {
			'action-card': 'action-card.mp3',
			'active-player': 'active-player.mp3',
			'discard': 'discard.mp3',
			'new-player': 'new-player.mp3'
		}
	}

	play(name) {
		let source = this.soundsPath + this.soundEffects[name],
			sound = new window.Howl({
				src: [source]
			});

		this.$log.debug('play()', name, source, this);

		sound.play();
	}
}
