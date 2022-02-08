
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
  this.map_data = null;
  this.mode = null;
  this.map_layer = makeContainer(this);
  this.stuff_layer = makeContainer(this);
};

MapScreen.prototype.loadMap = function(name, start = 1) {

  let map = this;

  let fade_out = 0;
  if (this.map_data != null) {
    // Unload the existing map and blank out.
    fade_out = 1000;
    game.fadeToBlack(fade_out);
    delay(function() {
      game.clearScreen("map");
      map.initializeScreen();
    }, fade_out + 50);
  } else {
    game.fadeToBlack(0);
  }

  delay(function() {
    request = new XMLHttpRequest();
    request.open("GET", "Maps/" + name + "/map.json", true);
    request.onload = function(e) {
      map.map_data = JSON.parse(this.response);

      let width_in_tiles = map.map_data.dimensions.w;
      let height_in_tiles = map.map_data.dimensions.h;
      
      for (let i = 0; i < width_in_tiles; i++) {
        for (let j = 0; j < height_in_tiles; j++) {
          let chunk_number = width_in_tiles * j + i + 1;
          if (chunk_number < 10) chunk_number = "0" + chunk_number;
          if (width_in_tiles * height_in_tiles > 100 && chunk_number < 100) chunk_number = "0" + chunk_number;
          let map_tile = makeSprite("Maps/" + name + "/chunk_" + chunk_number + ".png");
          map_tile.anchor.set(0,0);
          map_tile.position.set(1000 * i, 1000 * j);
          map.map_layer.addChild(map_tile);
        }
      }

      map.placeCharacter(game.main_character, map.map_data.starts[start].x, map.map_data.starts[start].y);
      map.followCharacter(game.main_character);

      map.mode = "walk";

      pixi.stage.addChild(game.black);
      game.black.alpha = 1;
      delay(function() {game.fadeFromBlack(1000)}, 500);
      
    }
    request.send();

  }, fade_out + 100);
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
  if (this.mode != "walk") return;

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

  if (this.map_data != null && this.map_data.warps != null) {
    for (const [key, val] of Object.entries(this.map_data.warps)) {
      if (distance(character.x, character.y, val.x, val.y) < 100) {
        this.mode = "warp";
        game.screens["map"].loadMap(val.map, val.start);
      }
    }
  }
};



