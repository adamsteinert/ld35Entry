import * as util from 'Utilities';
import {game} from 'index';
import {bgColors} from 'Constants'

let playerScore = 0;
let scoreText;
let bullets;
let fireButton;
let bulletTime = 0;
let spawnTimer = 0;
let spawnPoints = [];
let teleporters = [];
let enemyNormalGroup;
let tileWidth = 32
let tileHeight = 32
let crownGroup;
let crowns = [];
let enemyRandomShift = false
let enemyDirectionShiftProbability = .005
let shesDeadJim = false

let sounds = {}
let soundsLoaded = false
let jumpTime = 0

class GameState extends Phaser.State {
  preload() {

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

  createBullets() {
    bullets = game.add.group();
    bullets.enableBody = true;
    bullets.physicsBodyType = Phaser.Physics.ARCADE;
    bullets.createMultiple(30, 'freezeBullet');
    bullets.setAll('anchor.x', 0.5);
    bullets.setAll('anchor.y', 1);
    bullets.setAll('outOfBoundsKill', true);
    bullets.setAll('checkWorldBounds', true);
  }

  createNormalEnemies() {
    enemyNormalGroup = game.add.group();
    enemyNormalGroup.enableBody = true;
    enemyNormalGroup.physicsBodyType = Phaser.Physics.ARCADE;

  }

  createEnemy(x, y) {
    let enemy = enemyNormalGroup.create(x, y, 'enemy_normal');
    //enemy.anchor.setTo(0.5, 0.5);
    enemy.body.collideWorldBounds = true;
    enemy.body.bounce.y = 0.8;
    enemy.body.gravity.y = 500;
    enemy.anchor.setTo(0.5, 0.5);

    let direction = -1
    if(Math.random() > 0.5)
      direction = 1

    enemy.defaultX = direction * 150
    enemy.body.velocity.x = enemy.defaultX
  }

  createCrowns() {
    crownGroup = game.add.group()
    crownGroup.enableBody = true;
    crownGroup.physicsBodyType = Phaser.Physics.ARCADE;

    crowns.forEach(function(tile) {
      let c = crownGroup.create(tile.worldX, tile.worldY, "crown")
      c.body.allowGravity = false
      //c.anchor.setTo(0.5, 0.5);
    });
  }

  spawnEnemies() {
    let index = util.getRandomInt(0, spawnPoints.length-1)
    let point = spawnPoints[index];

    if(!point)
      return

    this.createEnemy(point.worldX, point.worldY)
  }


  moveEnemies(enemies) {
    let state = this
    enemies.forEach(function(enemy) {
      let pChange = Math.random()
      //let x = enemy.x / tileWidth
      //let y = enemy.y / tileHeight
      //util.trace(x + " " + y)

      let tile = state.map.getTileWorldXY(enemy.x, enemy.y, tileWidth, tileHeight, "hotspots", true);
      if(tile && tile.properties["teleport"]) {
        let index = util.getRandomInt(0, spawnPoints.length-1)
        let point = spawnPoints[index];
        enemy.x = point.worldX
        enemy.y = point.worldY
      }


      if(enemyRandomShift && pChange < enemyDirectionShiftProbability)
        enemy.body.velocity.x = enemy.defaultX *= -1

      if(enemy.body.blocked.left || enemy.body.blocked.right)
        enemy.body.velocity.x = enemy.defaultX *= -1
    });
  }


  loadSounds() {
    sounds["coin"] = game.add.audio("coin");
    sounds["explode"] = game.add.audio("explode");
    sounds["fire"] = game.add.audio("fire");
    sounds["jump"] = game.add.audio("jump")
    sounds["mutate"] = game.add.audio("mutate");
    sounds["win"] = game.add.audio("win");
    sounds["lose"] = game.add.audio("lose");
    sounds["music"] = game.add.audio("music");

		game.sound.setDecodedCallback(sounds, function() {
      soundsLoaded = true
      sounds["music"].play('', 0, 1, true, true)
      util.trace("sounds loaded!")
    }, this);
  }

  playSound(key) {
    let sound = sounds[key]
    if(soundsLoaded && sound) {
      sound.play('', 0, 0.5)
    }
    else {
      util.trace("sound " + key + "not loaded")
    }
  }

	create() {
    this.touching = false;
    game.time.advancedTiming = true;
		util.trace('StageState::create')

    this.loadSounds()

    //game.world.setBounds(0, 0, 1024, 1024);
    game.world.setBounds(0, 0, 4800, 1856);
    this.stage.backgroundColor = 0x2c2b2b;
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //game.physics.arcade.gravity.y = 400;

    // CONTROLS
    this.cursor = game.input.keyboard.createCursorKeys();
    this.S = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.S.onDown.add(this.onShapeShift, this);
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.F);
    //game.input.keyboard.addKeyCapture(Phaser.Keyboard.F);

    //TILES
    //the first parameter is the tileset name as specified in Tiled, the second is the key to the asset
    this.map = this.game.add.tilemap('tileMap');
		this.map.addTilesetImage('MasterTileset', 'tiles');
    this.blockedLayer = this.map.createLayer("TileArea")
    this.waterLayer = this.map.createLayer("WaterLayer")
    this.hotspots = this.map.createLayer("hotspots")
    //this.crowns = this.map.createLayer("crowns")
    this.waterLayer.alpha = 0.3

    // TILE COLLISION
		this.map.setCollisionBetween(15,20, true, "TileArea");
    this.map.setCollisionBetween(25,30, true, "TileArea");
    this.map.setCollision([2,5], true, "TileArea")
    //this.map.setCollision(33, true, "crowns")


    // CREATE SPAWN POINTS
    for(var x = 0; x < this.map.width; ++x) {
      for(var y = 0; y < this.map.height; ++y) {
        let tile = this.map.getTile(x, y, "hotspots");
        if(tile && tile.properties["spawner"]) {
          spawnPoints.push(tile)
        }
        if(tile && tile.properties["teleport"]) {
          teleporters.push(tile)
        }
        let crownTile = this.map.getTile(x,y,"crowns");
        if(crownTile) {
          crowns.push(crownTile);
        }
      }
    }

    this.createCrowns();

    // PLAYER
    this.player = this.game.add.sprite(100, 1440, 'playerSpriteSheet')
    this.player.anchor.setTo(0.5, 0.5);

		game.physics.arcade.enable(this.player);
		this.player.body.collideWorldBounds = true;
    this.player.body.bounce.y = 0.2;
    this.player.body.gravity.y = 400;

    this.onShapeShift()

    this.createBullets()
    this.createNormalEnemies()
    //this.createEnemy(836, 1440)

    game.camera.follow(this.player);
		//let style = { font: "32px Arial", fill: "#ff0044", align: "center"};
    //let text = game.add.text(game.width/2, game.height/2, "- your game goes here -", style);
		//text.anchor.set(0.5);

    // EVENTS
    game.time.events.repeat(Phaser.Timer.SECOND * 4, 5000, this.spawnEnemies, this);


    // score
    let style = { font: "24px Arial", fill: "#e75f25", align: "center"};
    scoreText = game.add.text(game.camera.x + 20, game.camera.y, "Score: " + playerScore, style);
	}


nextState() {
  game.paused = false;
  this.state.start("GameState")
}

  updateScore() {
    scoreText.setText("Score: " + playerScore)
    scoreText.x = game.camera.x + 20
    scoreText.y = game.camera.y + 20
  }

	update() {
    let p = this.player;
    let cursor = this.cursor;

    this.updateScore();

    // COLLISIONS
    game.physics.arcade.collide(this.player, this.blockedLayer);
    game.physics.arcade.collide(enemyNormalGroup, this.blockedLayer);
    game.physics.arcade.collide(this.player, enemyNormalGroup, this.endGame, null, this);
    game.physics.arcade.collide(bullets, this.blockedLayer, this.bulletToTileCollision, null, this);
    game.physics.arcade.collide(this.player, crownGroup, this.playerToCrownCollision, null, this);
    game.physics.arcade.collide(bullets, enemyNormalGroup, this.bulletToEnemyCollision, null, this);

    p.isClimbing = false;
    if(p.frame === 6 && (p.body.blocked.left || p.body.blocked.right)) {
      p.body.allowGravity = false
      p.isClimbing = true;
    }
    else {
      this.touching = false
      p.body.allowGravity = true
    }

    p.body.velocity.x = 0;


    if(!p.isClimbing) {
      if (cursor.up.isDown && p.body.blocked.down) {
        if(game.time.now > jumpTime) {
          jumpTime = game.time.now + 200
          this.playSound("jump")
        }
        p.body.velocity.y = -250;
      }
    }
    else if (cursor.up.isDown && p.isClimbing) {
      p.body.velocity.y = -150;
    }
    else if(cursor.down.isDown && p.isClimbing) {
      p.body.velocity.y = 150;
    }

    if (cursor.left.isDown)
    {
        p.body.velocity.x = -150;
        p.xMag = -1;
    }
    else if (cursor.right.isDown)
    {
        p.body.velocity.x = 150;
        p.xMag = 1;
    }

    p.yMag = -1;
    if(p.body.velocity.y > 0)
      p.yMag = 1;

    if (fireButton.isDown)
    {
        this.fireBullet();
    }

    this.moveEnemies(enemyNormalGroup.children);
	}


    fireBullet() {
      //  To avoid them being allowed to fire too fast we set a time limit
      if (game.time.now > bulletTime)
      {
          this.playSound("fire")
          //  Grab the first bullet we can from the pool
          let bullet = bullets.getFirstExists(false);
          let p = this.player;

          if (bullet)
          {
              //  And fire it
              bullet.reset(p.x, p.y );

              if(p.isClimbing) {
                bullet.angle = 90
                bullet.body.velocity.y = 400 * p.yMag;
              }
              else {
                bullet.angle = 0
                bullet.body.velocity.x = 400 * p.xMag;
              }
              bulletTime = game.time.now + 200;
          }
      }
    }


      endGame(player, enemy) {
          if(shesDeadJim)
            return;

          sounds["music"].stop()
          this.playSound("lose")
          let cam = game.camera;
          shesDeadJim = true;
          let style = { font: "32px Arial", fill: "#ff0044", align: "center"};
          let text = game.add.text(cam.x + 200, cam.y + 200, "- She's dead, Jim. -\r\nRestarting...", style);
          text.anchor.set(0.5);

          game.time.events.add(Phaser.Timer.SECOND * 3, this.nextState, this);

      }

  bulletToTileCollision(bullet, tile) {
    bullet.kill();
  }

  bulletToEnemyCollision(bullet, enemy) {
    bullet.kill()
    enemy.destroy()
    playerScore += 20
  }

  playerToCrownCollision(player, crown) {
    this.playSound("coin")
    crown.destroy()
    playerScore += 100
  }

  render() {
    //game.debug.text(game.time.fps || '--', 2, 32, "#00ff00");
    //game.debug.text(this.touching , 2, 64, "#00ff00");
    //game.debug.cameraInfo(game.camera, 32, 32);
    //game.debug.spriteCoords(this.player, 32, 150);
  }
}

export default GameState;
