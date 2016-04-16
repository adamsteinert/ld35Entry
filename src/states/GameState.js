import * as util from 'Utilities';
import {game} from 'index';
import {bgColors} from 'Constants'

class GameState extends Phaser.State {
	create() {
		util.trace('GameState::create')
		this.stage.backgroundColor = 0x2c2b2b;

		let style = { font: "32px Arial", fill: "#ff0044", align: "center"};

    let text = game.add.text(game.width/2, game.height/2, "- your game goes here -", style);
		text.anchor.set(0.5);
	}

	update() {

	}
}

export default GameState;
