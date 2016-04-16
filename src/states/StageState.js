import * as util from 'Utilities';
import {game} from 'index';
import {bgColors} from 'Constants'

class StageState extends Phaser.State {
  preload() {
    game.load.tilemap('tileMap', 'assets/tilemap/TestMap.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image("tiles", "assets/tilemap/TileSet_Master.png")
  }

	create() {
		util.trace('StageState::create')
    game.world.setBounds(0, 0, 1024, 1024);
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    this.stage.backgroundColor = 0x2c2b2b;
    this.map = this.game.add.tilemap('tileMap');

		//the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
		this.map.addTilesetImage('TileSet_Master', 'tiles');
    this.blockedLayer = this.map.createLayer("TileLayer")
		this.map.setCollisionBetween(1,5, true, "TileLayer");

    this.player = this.game.add.sprite(100, 100, 'player');
		//  We need to enable physics on the player
		game.physics.arcade.enable(this.player);

		//  Player physics properties. Give the little guy a slight bounce.
		this.player.body.bounce.y = 0.2;
		this.player.body.gravity.y = 300;
		this.player.body.collideWorldBounds = true;

    game.camera.follow(this.player);
		//let style = { font: "32px Arial", fill: "#ff0044", align: "center"};
    //let text = game.add.text(game.width/2, game.height/2, "- your game goes here -", style);
		//text.anchor.set(0.5);
	}

	update() {
      game.physics.arcade.collide(this.player, this.blockedLayer);
	}
}

export default StageState;
