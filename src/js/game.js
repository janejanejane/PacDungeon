(function() {
  'use strict';

  var ns = window['pacdungeon'];

  function Game() {
    this.map = null;
    this.layers = [];
    this.layer = null;
    this.pacman = null;

    this.safetile = 14;
    this.gridsize = 16;

    this.speed = 100;
    this.threshold = 10;

    this.size = 10;

    this.DungeonGenerator = new ns.DungeonGenerator(this.size);

    this.marker = new Phaser.Point();
    this.turnPoint = new Phaser.Point();

    this.directions = [ null, null, null, null, null ];
    this.opposites = [ Phaser.NONE, Phaser.RIGHT, Phaser.LEFT, Phaser.DOWN, Phaser.UP ];

    this.current = Phaser.NONE;
    this.turning = Phaser.NONE;

    this.score = 0;
  }

  Game.prototype = {

    create: function () {
      this.stage.backgroundColor = '#2d2d2d';
      this.map = this.add.tilemap();
      this.map.addTilesetImage('tiles', 'tiles', 16, 16, 0, 0, 1);
      this.layer = this.map.create('main', this.size * 4, this.size * 4, 16, 16);

      for(var i = 0; i < 4; i++){
        for(var j = 0; j < 4; j++){
          this.createSquare(i, j);
        }
      }



      this.dots = this.add.physicsGroup();
      this.map.createFromTiles(7, this.safetile, 'dot', this.layer, this.dots);

      //  The dots will need to be offset by 6px to put them back in the middle of the grid
      this.dots.setAll('x', 6, false, false, 1);
      this.dots.setAll('y', 6, false, false, 1);

      //  Pacman should collide with everything except the safe tile
      this.map.setCollisionByExclusion([this.safetile], true, this.layer);


      this.moveToSquare(2,2);



      this.physics.arcade.enable(this.pacman);
      this.pacman.body.setSize(16, 16, 0, 0);

      this.cursors = this.input.keyboard.createCursorKeys();

      this.pacman.animations.add('munch', [0, 1, 2, 1], 20, true);
      this.pacman.play('munch');
      this.move(Phaser.LEFT);

    },

    createSquare: function(row, col){
      var level = this.DungeonGenerator.createSquare();
      for(var i =0; i < this.size; i++){
        for(var j =0; j < this.size; j++){
          this.map.putTile(level[i][j], (row * this.size) + j, (col * this.size) + i, this.layer);
        }
      }
    },

    moveToSquare: function(row, col){
      console.log('Layer position: ', this.layer.x + '', this.layer.y);

      //  Position Pacman at grid location 14x17 (the +8 accounts for his anchor)

      if(!this.pacman){
        this.pacman = this.add.sprite((4 * 16) + 8 + (row * this.size * this.gridsize), (4 * 16) + 8 + (col * this.size * this.gridsize), 'pacman', 0);
      }else{
        this.pacman.x = (4 * 16) + 8 + (row * this.size * this.gridsize);//+ this.layer.x;
        this.pacman.y = (4 * 16) + 8 + (col * this.size * this.gridsize);// + this.layer.y;
      }

      console.log('Pac Position:', this.pacman.x, this.pacman.y);

      this.pacman.anchor.set(0.5);

    },

    checkKeys: function () {

      if (this.cursors.left.isDown && this.current !== Phaser.LEFT)
      {
          this.checkDirection(Phaser.LEFT);
      }
      else if (this.cursors.right.isDown && this.current !== Phaser.RIGHT)
      {
          this.checkDirection(Phaser.RIGHT);
      }
      else if (this.cursors.up.isDown && this.current !== Phaser.UP)
      {
          this.checkDirection(Phaser.UP);
      }
      else if (this.cursors.down.isDown && this.current !== Phaser.DOWN)
      {
          this.checkDirection(Phaser.DOWN);
      }
      else
      {
          //  This forces them to hold the key down to turn the corner
          this.turning = Phaser.NONE;
      }

    },

    checkDirection: function (turnTo) {
        console.log(this.directions);
        if (this.turning === turnTo || this.directions[turnTo] === null || this.directions[turnTo].index !== this.safetile)
        {
            //  Invalid direction if they're already set to turn that way
            //  Or there is no tile there, or the tile isn't index 1 (a floor tile)
            return;
        }

        //  Check if they want to turn around and can
        if (this.current === this.opposites[turnTo])
        {
            this.move(turnTo);
        }
        else
        {
            this.turning = turnTo;

            this.turnPoint.x = (this.marker.x * this.gridsize) + (this.gridsize / 2);
            this.turnPoint.y = (this.marker.y * this.gridsize) + (this.gridsize / 2);
        }

    },

    turn: function () {

        var cx = Math.floor(this.pacman.x);
        var cy = Math.floor(this.pacman.y);

        //  This needs a threshold, because at high speeds you can't turn because the coordinates skip past
        if (!this.math.fuzzyEqual(cx, this.turnPoint.x, this.threshold) || !this.math.fuzzyEqual(cy, this.turnPoint.y, this.threshold))
        {
            return false;
        }

        //  Grid align before turning
        console.log('Turnin point: ', this.turnPoint);
        this.pacman.x = this.turnPoint.x;
        this.pacman.y = this.turnPoint.y;

        this.pacman.body.reset(this.turnPoint.x, this.turnPoint.y);

        this.move(this.turning);

        this.turning = Phaser.NONE;

        return true;

    },

    move: function (direction) {

        var speed = this.speed;

        if (direction === Phaser.LEFT || direction === Phaser.UP)
        {
            speed = -speed;
        }

        if (direction === Phaser.LEFT || direction === Phaser.RIGHT)
        {
            this.pacman.body.velocity.x = speed;
        }
        else
        {
            this.pacman.body.velocity.y = speed;
        }

        //  Reset the scale and angle (Pacman is facing to the right in the sprite sheet)
        this.pacman.scale.x = 1;
        this.pacman.angle = 0;

        if (direction === Phaser.LEFT)
        {
            this.pacman.scale.x = -1;
        }
        else if (direction === Phaser.UP)
        {
            this.pacman.angle = 270;
        }
        else if (direction === Phaser.DOWN)
        {
            this.pacman.angle = 90;
        }

        this.current = direction;

    },

    eatDot: function (pacman, dot) {

        dot.kill();
        this.score++;
        if(this.score % 5 === 0){
          this.moveToSquare(Math.floor(Math.random()*3),Math.floor(Math.random()*3));
        }

        if (this.dots.total === 0)
        {

            this.dots.callAll('revive');
        }

    },

    update: function () {

        this.physics.arcade.collide(this.pacman, this.layer);
        this.physics.arcade.overlap(this.pacman, this.dots, this.eatDot, null, this);

        this.marker.x = this.math.snapToFloor(Math.floor(this.pacman.x), this.gridsize) / this.gridsize;
        this.marker.y = this.math.snapToFloor(Math.floor(this.pacman.y), this.gridsize) / this.gridsize;
        console.log('Position:', this.marker.x, this.marker.y);
        if(this.marker.x < 0 || this.marker.y < 0){
          return;
        }
        //  Update our grid sensors
        this.directions[1] = this.map.getTileLeft(this.layer.index, this.marker.x, this.marker.y);
        this.directions[2] = this.map.getTileRight(this.layer.index, this.marker.x, this.marker.y);
        this.directions[3] = this.map.getTileAbove(this.layer.index, this.marker.x, this.marker.y);
        this.directions[4] = this.map.getTileBelow(this.layer.index, this.marker.x, this.marker.y);

        this.checkKeys();

        if (this.turning !== Phaser.NONE)
        {
            this.turn();
        }

    },
    render: function () {

            //  Un-comment this to see the debug drawing

            for (var t = 1; t < 5; t++)
            {
                if (this.directions[t] === null)
                {
                    continue;
                }

                var color = 'rgba(0,255,0,0.3)';

                if (this.directions[t].index !== this.safetile)
                {
                    color = 'rgba(255,0,0,0.3)';
                }

                if (t === this.current)
                {
                    color = 'rgba(255,255,255,0.3)';
                }

                this.game.debug.geom(new Phaser.Rectangle(this.directions[t].worldX, this.directions[t].worldY, this.gridsize, this.gridsize), color, true);
            }

          //  this.game.debug.geom(this.turnPoint, '#ffff00');

        }

  };

  window['pacdungeon'] = window['pacdungeon'] || {};
  window['pacdungeon'].Game = Game;

}());
