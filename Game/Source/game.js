
//
// The game class runs the entire game, managing pixi.js setup and basic game setup,
// handling scenes, running the master update and input handlers, and handling
// pause and time.
//
// Copyright 2022 Alpha Zoo LLC.
// Written by Matthew Carlin
//

'use strict';

var music_volume = 0.4;
var sound_volume = 0.6;
var use_scores = false;
var log_performance = true;

var pixi = null;
var game = null;

var default_font = "Bebas Neue";

var first_screen = "title";

let game_fullscreen = false;

function initialize() {
  game = new Game();
  game.initialize();
}

class Game {
  constructor() {
  }

  initialize() {
    var self = this;

    this.tracking = {};
    this.keymap = {};

    this.paused = false;
    this.pause_time = 0;
    
    this.freefalling = [];
    this.shakers = [];

    this.gravity = 5.8;

    this.basicInit();

    sound_volume = localStorage.getItem("sound_volume");
    if (sound_volume == null) sound_volume = 0.6;
    if (sound_volume == NaN) sound_volume = 0.6;
    if (sound_volume < 0.001) sound_volume = 0.0;
    sound_volume = Math.round(sound_volume * 10) / 10;

    music_volume = localStorage.getItem("music_volume");
    if (music_volume == null) music_volume = 0.4;
    if (music_volume == NaN) music_volume = 0.4;
    if (music_volume < 0.001) music_volume = 0.0;
    music_volume = Math.round(music_volume * 10) / 10;

    game_fullscreen = window.gameIsFullScreen();

    document.addEventListener("keydown", function(ev) {self.handleKeyDown(ev)}, false);
    document.addEventListener("keyup", function(ev) {self.handleKeyUp(ev)}, false);
    window.onfocus = function(ev) {
      if (self.keymap != null) {
        self.keymap["ArrowDown"] = null;
        self.keymap["ArrowUp"] = null;
        self.keymap["ArrowLeft"] = null;
        self.keymap["ArrowRight"] = null;
      }
    };
    window.onblur = function(ev) {
      if (self.keymap != null) {
        self.keymap["ArrowDown"] = null;
        self.keymap["ArrowUp"] = null;
        self.keymap["ArrowLeft"] = null;
        self.keymap["ArrowRight"] = null;
      }
    };

    PIXI.Loader.shared
      .add("Art/Characters/black_bear.json")
      .load(function() {
        
        game.initializeScreens();
        game.main_character = game.makeCharacter("black_bear");

        game.popScreens("title", "map");
        game.screens["map"].loadMap("Kibatsuna_Desert");
    });
  }


  //
  // Tracking functions, useful for testing the timing of things.
  //
  trackStart(label) {
    if (!(label in this.tracking)) {
      this.tracking[label] = {
        start: 0,
        total: 0
      }
    }
    this.tracking[label].start = Date.now();
  }


  trackStop(label) {
    if (this.tracking[label].start == -1) {
      console.log("ERROR! Tracking for " + label + " stopped without having started.")
    }
    this.tracking[label].total += Date.now() - this.tracking[label].start;
    this.tracking[label].start = -1
  }


  trackPrint(labels) {
    var sum_of_totals = 0;
    for (var label of labels) {
      sum_of_totals += this.tracking[label].total;
    }
    for (var label of labels) {
      var fraction = this.tracking[label].total / sum_of_totals;
      console.log(label + ": " + Math.round(fraction * 100).toFixed(2) + "%");
    }
  }


  basicInit() {
    var self = this;

    this.width = 1440;
    this.height = 900;

    // Create the pixi application
    pixi = new PIXI.Application(this.width, this.height, {antialias: true, backgroundColor: 0x000000});
    this.renderer = pixi.renderer;
    document.getElementById("mainDiv").appendChild(pixi.view);
    pixi.renderer.resize(this.width,this.height);

    // Set up rendering and tweening loop
    let ticker = PIXI.Ticker.shared;
    ticker.autoStart = false;
    ticker.stop();

    let fps_counter = 0;
    let last_frame = 0;
    let last_performance_update = 0;
    let pixi_draw_count = 0;
    let performance_debugging = true;

    // // count the number of drawings
    // // https://stackoverflow.com/questions/63294038/pixi-js-how-do-i-get-draw-count
    if (performance_debugging) {
      const drawElements = this.renderer.gl.drawElements;
      this.renderer.gl.drawElements = (...args) => {
        drawElements.call(self.renderer.gl, ...args);
        pixi_draw_count++;
      }; // rewrite drawElements to count draws
    }

    function animate(now) {
      
      fps_counter += 1;
      let diff = now - last_frame;
      last_frame = now

      if (!self.paused == true) {
        if (performance_debugging) {
          self.trackStart("tween");
          TWEEN.update(now);
          self.trackStop("tween");

          self.trackStart("update");
          self.update(diff);
          self.trackStop("update");

          self.trackStart("animate");
          ticker.update(now);
          pixi.renderer.render(pixi.stage);
          self.trackStop("animate");

          if (now - last_performance_update > 3000 && log_performance) {
            // // There were 3000 milliseconds, so divide fps_counter by 3
            console.log("FPS: " + fps_counter / 3);
            self.trackPrint(["update", "tween", "animate"]);
            console.log("Pixi draw count: " + pixi_draw_count);
            fps_counter = 0;
            last_performance_update = now;
          }
        } else {
          TWEEN.update(now);
          self.update(diff);
          ticker.update(now);
          pixi.renderer.render(pixi.stage);
        }
      }

      pixi_draw_count = 0;

      requestAnimationFrame(animate);
    }
    animate(0);
  }


  initializeScreen(screen_name, reset = false) {
    console.log(screen_name);
    if (screen_name == "zoo") {
      this.initializeZoo();
    } else if (screen_name == "cafe") {
      this.initializeCafe();
    } else if (screen_name == "gift_shop") {
      this.initializeGiftShop();
    } else if (screen_name == "animal_pop") {
      this.initializeAnimalPop();
    }
  }

  update(diff) {
    if (this.current_screen == null) return;
    this.current_screen.update();
  }



  handleKeyUp(ev) {
    ev.preventDefault();

    this.keymap[ev.key] = null;
  }


  handleKeyDown(ev) {
    if (ev.key === "Tab") {
      ev.preventDefault();
    }

    this.keymap[ev.key] = true;

    if (this.current_screen != null) {
      this.current_screen.handleKeyDown(ev.key);
    }
  }


  pause() {
    this.paused = true;
    this.pause_moment = Date.now();
    this.paused_tweens = [];
    let tweens = TWEEN.getAll();
    for (var i = 0; i < tweens.length; i++) {
      var tween = tweens[i];
      tween.pause();
      this.paused_tweens.push(tween);
    }
    if (this.music != null) {
      this.music.pause();
    }
    pauseAllDelays();
  }


  resume() {
    this.paused = false;
    this.pause_time += Date.now() - this.pause_moment;
    for (var i = 0; i < this.paused_tweens.length; i++) {
      var tween = this.paused_tweens[i];
      tween.resume();
    }
    this.paused_tweens = [];
    if (this.music != null) {
      this.music.play();
    }
    resumeAllDelays();
  }


  soundEffect(effect_name) {
    if (sound_volume > 0) {
      var sound_effect = document.getElementById(effect_name);
      if (sound_effect != null) {
        sound_effect.volume = sound_volume;
        sound_effect.play();
      }
    }
  }


  stopSoundEffect(effect_name) {
    if (sound_volume > 0) {
      var sound_effect = document.getElementById(effect_name);
      if (sound_effect != null) {
        sound_effect.pause();
      }
    }
  }


  setMusic(music_name) {
    if (music_volume > 0) {
      if (this.music_name == music_name) {
        return;
      }
      var self = this;
      // let crossfade = false;
      // if (this.music != null && this.music_name != music_name) {
      //   crossfade = true;
      //   this.fadeMusic();
      // }
      this.music = document.getElementById(music_name);
      this.music.loop = true;
      this.music.pause();
      this.music.currentTime = 0;
      // if (crossfade) {
      //   for (let i = 0; i < 14; i++) {
      //     delay(function() {
      //       self.music.volume = i / 20;
      //     }, 50 * i);
      //   }
      // } else {
      //   this.music.volume = 0.4;
      // }
      this.music.volume = music_volume;
      this.music_name = music_name;
      this.music.play();
    }
  }


  stopMusic() {
    if (this.music != null) {
      this.music.pause();
      this.music.currentTime = 0;
    }
  }


  fadeMusic(delay_time = 0) {
    if (this.music != null) {
      this.old_music = this.music;
      this.music = null;
      //this.old_music.done = true;
      var self = this;
      for (let i = 0; i < 14; i++) {
        delay(function() {
          self.old_music.volume = (13 - i) / 20;
        }, delay_time + 50 * i);
      }
      setTimeout(function() {
        // TO DO
        // DELETE OLD MUSIC
        this.old_music = null;
      }, 1500);
    }
  }

  markTime() {
    return Date.now() - this.pause_time;
  }


  timeSince(mark) {
    return this.markTime() - mark;
  }
}
