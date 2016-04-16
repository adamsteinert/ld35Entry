import * as util from 'Utilities';
import {game} from 'index';
import {bgColors} from 'Constants'



class StageState extends Phaser.State {
  preload() {
    game.load.tilemap('tileMap', 'assets/tilemap/Tilemap_Master.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image("tiles", "assets/tilemap/TileSet_Master.png");
    game.load.spritesheet('playerSpriteSheet', 'assets/sprites/player_bounds.png', 64, 64);
  }


  onShapeShift() {
    let p = this.player
    if(p.frame === 0)
    {
      //stick
      p.frame = 6
      p.body.setSize(26, 61, 0, 0)
      p.angle -= 90
    }
    else if(p.frame === 6)
    {
      p.frame = 13
      p.body.setSize(53, 63, 6, 0)
      p.y -= 39
      p.angle += 90
    }
    else {
      // squid
      p.frame = 0
      p.body.setSize(61, 24, 2, 0)
    }
  }

	create() {
    this.touching = false;
    game.time.advancedTiming = true;
		util.trace('StageState::create')

    //game.world.setBounds(0, 0, 1024, 1024);
    game.world.setBounds(0, 0, 4800, 1600);
    this.stage.backgroundColor = 0x2c2b2b;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.physics.arcade.gravity.y = 400;

    // CONTROLS
    this.cursor = game.input.keyboard.createCursorKeys();
    this.S = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.S.onDown.add(this.onShapeShift, this);

    //TILES
    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map = this.game.add.tilemap('tileMap');
		this.map.addTilesetImage('MasterTileset', 'tiles');
    this.blockedLayer = this.map.createLayer("TileArea")
		this.map.setCollisionBetween(0,20, true, "TileArea");
    //this.map.setCollision(14, true, "TileArea");
    //this.testLayer = this.map.createLayer("Foo")
    //this.map.setCollisionBetween(3,5, true, "Foo");


    // PLAYER
    this.player = this.game.add.sprite(100, 1440, 'playerSpriteSheet')
    this.player.anchor.setTo(0.5, 0.5);

		game.physics.arcade.enable(this.player);
		this.player.body.collideWorldBounds = true;
    this.player.body.bounce.y = 0.2;

    this.onShapeShift()

    game.camera.follow(this.player);
		//let style = { font: "32px Arial", fill: "#ff0044", align: "center"};
    //let text = game.add.text(game.width/2, game.height/2, "- your game goes here -", style);
		//text.anchor.set(0.5);
	}


	update() {
    let p = this.player;
    let cursor = this.cursor;
    let climbing = false;

    game.physics.arcade.collide(this.player, this.blockedLayer);

    if(p.frame === 6 && (p.body.blocked.left || p.body.blocked.right)) {
      p.body.allowGravity = false
      climbing = true;
    }
    else {
      this.touching = false
      p.body.allowGravity = true
    }

    p.body.velocity.x = 0;

    if (cursor.up.isDown && climbing) {
      p.body.velocity.y = -150;
    }
    else if(cursor.down.isDown && climbing) {
      p.body.velocity.y = 150;
    }
    if (cursor.left.isDown)
    {
        p.body.velocity.x = -150;
    }
    else if (cursor.right.isDown)
    {
        p.body.velocity.x = 150;
    }



	}

  render() {
    game.debug.text(game.time.fps || '--', 2, 32, "#00ff00");
    game.debug.text(this.touching , 2, 64, "#00ff00");
    game.debug.cameraInfo(game.camera, 32, 32);
    game.debug.spriteCoords(this.player, 32, 150);
  }
}

export default StageState;
