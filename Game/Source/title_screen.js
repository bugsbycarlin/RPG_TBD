
//
// 
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class TitleScreen extends PIXI.Container {


  constructor() {
    super();
    this.initializeScreen();
  };

};

TitleScreen.prototype.initializeScreen = function() {
  this.title_text = new PIXI.Text("TBD", {fontFamily: default_font, fontSize: 140, fill: 0xFFFFFF, letterSpacing: 8, align: "center"});
  this.title_text.anchor.set(0.5,0.5);
  this.title_text.position.set(game.width / 2, game.height / 2);
  this.addChild(this.title_text);
};
    
TitleScreen.prototype.update = function() {
    
};



