import * as util from 'Utilities';
import {game} from 'index';

class LoadingState extends Phaser.State {
	preload() {
		util.trace('LoadingState::preload')

		this.stage.backgroundColor = 0x1f1f1f;
    var loadingBar = this.add.sprite(game.width / 2, game.height / 2, "loading");
		loadingBar.tint = 0xca4037;
		loadingBar.anchor.setTo(0.5);

		var loadingText = this.add.sprite(game.width/2, (game.height/2), "loadText");
		loadingText.tint = 0x63499e;
		loadingText.y += loadingText.height;
		loadingText.anchor.setTo(0.5);

    game.load.setPreloadSprite(loadingBar);
  }

  create() {
    util.trace('LoadingState::create')
		game.time.events.add(Phaser.Timer.SECOND * 1, this.nextState, this);
	}

	nextState() {
		this.state.start("TitleState")
	}
}

export default LoadingState;
