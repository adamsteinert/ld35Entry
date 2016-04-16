import * as util from 'Utilities';
import {game} from 'index';
import {bgColors} from 'Constants'

class TitleState extends Phaser.State {

  create() {
    util.trace('TitleState::create')
    this.stage.backgroundColor = 0x2c2b2b;

    let title = game.add.bitmapText(game.width/2, 205, "littera", "Title Screen!", 36);
    title.anchor.setTo(0.5)

    let start = game.add.bitmapText(game.width/2, 250, "littera", "Click to start.", 24);
    start.anchor.setTo(0.5)

    start.inputEnabled = true;
    start.events.onInputDown.add(this.startGame, this)
    start.events.onInputOver.add(this.startOver, this);
    start.events.onInputOut.add(this.startOut, this);
  }

  startGame() {
    game.state.start("GameState");
  }

  startOver() {
    util.trace('Over.')
  }

  startOut() {
    util.trace('Out.')
  }
}

export default TitleState
