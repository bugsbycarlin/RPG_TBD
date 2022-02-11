
//
// Map edit screen extends Map screen with editing powers.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

class MapEditScreen extends MapScreen {
  constructor() {
    super();

    let self = this;
    document.addEventListener("click", function(ev) {self.handleClick(ev)}, false);
  }

  initializeScreen() {
    super.initializeScreen();
    this.edit_mode = "Add";

    this.edit_mode_text = new PIXI.Text("Mode: Add", {fontFamily: default_font, fontSize: 40, fill: 0x000000, letterSpacing: 8, align: "left"});
    this.edit_mode_text.anchor.set(0,0);
    this.edit_mode_text.position.set(30, 30);
    this.info_layer.addChild(this.edit_mode_text);

    this.current_polygon = new PIXI.Graphics();
    this.current_polygon.point_list = [];
    this.current_polygon.status = "open";
    this.stuff_layer.addChild(this.current_polygon);
  };


  handleClick(ev) {
    console.log("Screen: " + ev.clientX + "," + ev.clientY);
    
    let map_x = Math.round(ev.clientX - this.world_layer.x);
    let map_y = Math.round(ev.clientY - this.world_layer.y);
    console.log("Map:" + map_x + "," + map_y);

    if (this.edit_mode == "Add") {
      this.current_polygon.point_list.push([map_x, map_y]);
      this.updateCurrentPolygon();
    }
  }


  updateCurrentPolygon() {
    let pg = this.current_polygon;

    pg.clear();

    pg.lineStyle(1, 0xffb0cc);

    if (pg.point_list.length >= 2) {
      for (let i = 0; i < pg.point_list.length - 1; i++) {
        let p1 = pg.point_list[i];
        let p2 = pg.point_list[i+1];
        pg.moveTo(p1[0], p1[1]).lineTo(p2[0], p2[1]);
      }
    } 

    for (let i = 0; i < pg.point_list.length; i++) {
      let p = pg.point_list[i];
      pg.beginFill(0xffffff);
      pg.drawCircle(p[0], p[1], 3);
      pg.endFill();
    }
  }


  update() {
    super.update();
  }

};
