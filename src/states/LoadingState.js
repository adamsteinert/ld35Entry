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

		game.load.tilemap('tileMap', 'assets/tilemap/Tilemap_Master.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image("tiles", "assets/tilemap/TileSet_Master.png");
    game.load.spritesheet('playerSpriteSheet', 'assets/sprites/player_bounds.png', 64, 64);
    game.load.image('freezeBullet', 'assets/sprites/freeze_bullet.png', 32, 6);
    game.load.image('enemy_normal', 'assets/sprites/enemy_normal.png', 32, 32);
		game.load.image("crown","assets/sprites/crown.png")

		game.load.audio('coin', 'assets/sound/fx/coin2.mp3');
		game.load.audio('explode', 'assets/sound/fx/explosion1.mp3');
		game.load.audio('fire', 'assets/sound/fx/fire2.mp3');
		game.load.audio('jump', 'assets/sound/fx/jump1.mp3');
		game.load.audio('mutate', 'assets/sound/fx/mutate3.mp3');
		game.load.audio('win', 'assets/sound/fx/youWin.mp3');
		game.load.audio('lose', 'assets/sound/fx/finalDead.mp3');
		game.load.audio('lose', 'assets/sound/fx/finalDead.mp3');
		game.load.audio('music', 'assets/sound/threeBody.mp3');

  }

  create() {
    util.trace('LoadingState::create')
		game.time.events.add(Phaser.Timer.SECOND * 1, this.nextState, this);
	}

	nextState() {
		this.state.start("GameState")
	}
}

export default LoadingState;
