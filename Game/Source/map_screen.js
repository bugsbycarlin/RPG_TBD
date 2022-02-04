
//
// 
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class MapScreen extends PIXI.Container {


  constructor() {
    super();
    this.initializeScreen();
  };

};

MapScreen.prototype.initializeScreen = function() {
  this.map_layer = makeContainer(this);
  this.stuff_layer = makeContainer(this);
};

MapScreen.prototype.loadMap = function(name, width_in_tiles, height_in_tiles) {
  for (let i = 0; i < width_in_tiles; i++) {
    for (let j = 0; j < height_in_tiles; j++) {
      let chunk_number = width_in_tiles * j + i + 1;
      if (width_in_tiles * height_in_tiles > 10 && chunk_number < 10) chunk_number = "0" + chunk_number;
      if (width_in_tiles * height_in_tiles > 100 && chunk_number < 100) chunk_number = "0" + chunk_number;
      let map_tile = makeSprite("Art/Maps/" + name + "/chunk_" + chunk_number + ".png");
      map_tile.anchor.set(0,0);
      map_tile.position.set(1000 * i, 1000 * j);
      this.map_layer.addChild(map_tile);
    }
  }
};

MapScreen.prototype.placeCharacter = function(character, x, y) {
  this.stuff_layer.addChild(character);
  character.position.set(x, y);
}

MapScreen.prototype.followCharacter = function(character) {
  this.follow_character = character;
}

MapScreen.prototype.handleKeyDown = function(key) {
}
    
MapScreen.prototype.update = function() {
  if (this.follow_character == null) return;

  let character = this.follow_character;
  let keymap = game.keymap;

  if (keymap["ArrowUp"] && keymap["ArrowRight"]) {
    character.direction = "upright";
  } else if (keymap["ArrowUp"] && keymap["ArrowLeft"]) {
    character.direction = "upleft";
  } else if (keymap["ArrowDown"] && keymap["ArrowRight"]) {
    character.direction = "downright";
  } else if (keymap["ArrowDown"] && keymap["ArrowLeft"]) {
    character.direction = "downleft";
  } else if (keymap["ArrowDown"]) {
    character.direction = "down";
  } else if (keymap["ArrowUp"]) {
    character.direction = "up";
  } else if (keymap["ArrowLeft"]) {
    character.direction = "left";
  } else if (keymap["ArrowRight"]) {
    character.direction = "right";
  } else {
    character.direction = null;
  }

  if (character.direction != null) {
    character.move();
  }
  
  if (this.follow_character != null) {
    this.position.set(game.width/2 - this.follow_character.x * this.scale.x, game.height/2 - this.follow_character.y * this.scale.y);
  }
};



