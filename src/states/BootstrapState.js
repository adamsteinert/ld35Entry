import * as util from 'Utilities';
import {game} from 'index';


class BootstrapState extends Phaser.State {
	preload() {
		util.trace('BootstrapState::preload')
    game.load.image("loading","assets/sprites/loading.png")
		game.load.image("loadText","assets/GameLoading.png")
		game.load.bitmapFont("littera", "assets/fonts/litteraDefault.png", "assets/fonts/litteraDefault.xml")
	}

	create() {
		util.trace('BootstrapState::create')
		game.load.onFileComplete.add(this.fileComplete, this);

		game.scale.pageAlignHorizontally = true;
		game.scale.pageAlignVertically = true;
		game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;

		this.state.start('LoadingState')
	}

	fileComplete(progress, cacheKey, success, totalLoaded, totalFiles) {
		util.trace("BOOT| File Complete: " + progress + "% - " + totalLoaded + " out of " + totalFiles)
	}

}

export default BootstrapState;
