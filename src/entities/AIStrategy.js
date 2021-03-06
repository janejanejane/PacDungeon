
'use strict';

var DungeonGenerator = require( './DungeonGenerator.js' );

function AIStrategy( pacman, ghost, safetile, opposites ) {
  this.pacman = pacman;
  this.ghost = ghost;
  this.safetile = safetile;
  this.opposites = opposites;
}

function isTransitioning( tile, context ) {
  return (tile.index === DungeonGenerator.TOPWALL ||
        tile.index === DungeonGenerator.RIGHTWALL ||
        tile.index === DungeonGenerator.BOTTOMWALL ||
        tile.index === DungeonGenerator.LEFTWALL);
}

function doShadow( directions, current, context ) {
  /*jshint validthis:true */

  var pacmanPos = context.pacman.getGridPosition();
  var t = 0;
  var min = 1000;
  var nextDirection = Phaser.NONE;

  // if ghost is crossing planes, continue direction
  if ( isTransitioning( directions[ 0 ], context ) ) {
    return current;
  }

  // stalks pacman everywhere
  for ( t = 5; t > 0; t-- ) {
    if ( !directions[ t ] ) {
      continue;
    }
    if ( t === context.opposites[ current ] ) {
      // ghost can't move back yo
      continue;
    }

    if ( directions[ t ].index === context.safetile ||
      directions[ t ].index === DungeonGenerator.TOPWALL ||
      directions[ t ].index === DungeonGenerator.RIGHTWALL ||
      directions[ t ].index === DungeonGenerator.BOTTOMWALL ||
      directions[ t ].index === DungeonGenerator.LEFTWALL ) {

      if ( !context.isAtEdge( directions[ t ].index ) ) {
        // which of the directions is closer to the pacman?
        var distance = Phaser.Math.distance(
          pacmanPos.x, pacmanPos.y, directions[ t ].x, directions[ t ].y );
        if ( distance < min ) {
          nextDirection = t;
          min = distance;
        }
      }

    }
  }
  return nextDirection;
}

function doSpeedy( directions, current, context ) {
  /*jshint validthis:true */
  // get where pacman is facing
  var pacmanPos = context.pacman.getForwardPosition( 4 );
  var t = 0;
  var min = 1000;
  var nextDirection = Phaser.NONE;

  // if ghost is crossing planes, continue direction
  if ( isTransitioning( directions[ 0 ], context ) ) {
    return current;
  }

  // look forward four squares
  for ( t = 1; t < 5; t++ ) {
    if ( !directions[ t ] ) {
      continue;
    }
    if ( t === context.opposites[ current ] ) {
      // ghost can't move back yo
      continue;
    }

    if ( directions[ t ].index === context.safetile ||
      directions[ t ].index === DungeonGenerator.TOPWALL ||
      directions[ t ].index === DungeonGenerator.RIGHTWALL ||
      directions[ t ].index === DungeonGenerator.BOTTOMWALL ||
      directions[ t ].index === DungeonGenerator.LEFTWALL ) {

      if ( !context.isAtEdge( directions[ t ].index ) ) {
        // which of the directions is closer to the pacman?
        var distance = Phaser.Math.distance(
          pacmanPos.x, pacmanPos.y, directions[ t ].x, directions[ t ].y );
        if ( distance < min ) {
          nextDirection = t;
          min = distance;
        }
      }
    }
  }

  return nextDirection;
}

function doBashful( directions, current, context ) {
  /*jshint validthis:true */
  var pacmanPos = context.pacman.getForwardPosition( 2 );
  var t = 0;
  var min = 1000;
  var nextDirection = Phaser.NONE;


  // two tiles forward, but consider shadow's position
  for ( var t = 1; t < 5; t++ ) {
    if ( !directions[ t ] ) {
      continue;
    }
    if ( t === context.opposites[ current ] ) {
      // ghost can't move back yo
      continue;
    }

    if ( directions[ t ].index === context.safetile ) {
        // which of the directions is closer to the pacman?
        var distance = Phaser.Math.distance(
          pacmanPos.x, pacmanPos.y, directions[ t ].x, directions[ t ].y );
        if ( distance < min ) {
          nextDirection = t;
          min = distance;
        }

    }
  }
  return nextDirection;
}

function doPokey( directions, current ) {
  /*jshint validthis:true */

  // if far away from pacman, be like blinky
  // if close, scatter mode
  for ( var t = 1; t < 5; t++ ) {
    if ( !directions[ t ] ) {
      continue;
    }
    if ( t === this.opposites[ current ] ) {
      // ghost can't move back yo
      continue;
    }

    if ( directions[ t ].index === this.safetile ) {
      break;
    }
  }
  return t;
}

AIStrategy.prototype.setStrategy = function( strategy ) {
  switch ( strategy ) {
    case 'shadow':
      this.getNextDirection = doShadow;
      break;
    case 'speedy':
      this.getNextDirection = doSpeedy;
      break;
    case 'bashful':
      // bashful can't apparate outside it's walls anytime
      this.getNextDirection = doBashful;
      this.getWanderDirection = doBashful;
      break;
    case 'pokey':
      this.getNextDirection = doPokey;
      break;
  }
};

AIStrategy.prototype.getFleeDirection = function( directions, current, context ) {
  // if ghost is crossing planes, continue direction
  if ( isTransitioning( directions[ 0 ], context ) ) {
    return current;
  }

  for ( var t = 1; t < 5; t++ ) {
    if ( !directions[ t ] ) {
      continue;
    }
    if ( t === context.opposites[ current ] ) {
      // ghost can't move back yo
      continue;
    }

    if ( directions[ t ].index === context.safetile ) {
      break;
    }
  }
  return t;
};

AIStrategy.prototype.getWanderDirection = function( directions, current, context ) {
  var isValid = false;
  var t;
  var tries = 0;

  if ( isTransitioning( directions[ 0 ], context ) ) {
    return current;
  }

  do {
    tries++;
    // generate a random direction until it's valid
    t = Math.floor( ( Math.random() * 4 ) ) + 1;
    if ( !directions[ t ] ) {
      continue;
    }
    if ( t === context.opposites[ current ] ) {
      // ghost can't move back yo
      if ( tries > 5 ) {
        break;
      }
      continue;
    }

    if ( directions[ t ].index === context.safetile ||
      directions[ t ].index === DungeonGenerator.TOPWALL ||
      directions[ t ].index === DungeonGenerator.RIGHTWALL ||
      directions[ t ].index === DungeonGenerator.BOTTOMWALL ||
      directions[ t ].index === DungeonGenerator.LEFTWALL ) {

      if ( !context.isAtEdge( directions[ t ].index ) ) {
        isValid = true;
        break;
      }
    }

  } while ( !isValid );

  return t;
};

AIStrategy.prototype.isAtEdge = function( tile ) {
  if ( tile === DungeonGenerator.TOPWALL ) {
    return this.ghost.forwardMarker.y === 1;
  } else if ( tile === DungeonGenerator.RIGHTWALL ) {
    return this.ghost.forwardMarker.x === 28;
  } else if ( tile === DungeonGenerator.BOTTOMWALL ) {
    return this.ghost.forwardMarker.y === 28;
  } else if ( tile === DungeonGenerator.LEFTWALL ) {
    return this.ghost.forwardMarker.x === 1;
  }

  return false;

};

module.exports = AIStrategy;
