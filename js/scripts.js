(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (typeof Bivouac === "undefined" || Bivouac === null) Bivouac = {};

  Bivouac.App = (function() {

    function App() {}

    return App;

  })();

  Bivouac.Invaders = (function() {

    function Invaders() {
      this.animloop = __bind(this.animloop, this);      this.header = $('header');
      this.container = this.header.find('figure');
      this.ship = this.container.children('img');
      this.bullets = {};
      this.bulletsIndex = 1;
      this.offset = 0;
      this.speed = 0;
      this.isGoing = {
        left: false,
        right: false
      };
      this.init();
      this.initKeyboard();
      this.animloop();
    }

    Invaders.prototype.init = function() {
      this.header.addClass('playing');
      return this.container.addClass('ship');
    };

    Invaders.prototype.initKeyboard = function() {
      var $body,
        _this = this;
      $body = $('body');
      $body.bind('keydown', function(e) {
        if ([37, 39, 32].indexOf(e.keyCode) < 0) return;
        switch (e.keyCode) {
          case 37:
            return _this.isGoing.left = true;
          case 39:
            return _this.isGoing.right = true;
          case 32:
            return _this.shootBullet();
        }
      });
      return $body.bind('keyup', function(e) {
        switch (e.keyCode) {
          case 37:
            return _this.isGoing.left = false;
          case 39:
            return _this.isGoing.right = false;
        }
      });
    };

    Invaders.prototype.shootBullet = function() {
      var bullet;
      bullet = $('<span class="bullet"></span>');
      bullet.css('-webkit-transform', "translate3d(0," + this.offset + "px,0)");
      this.container.append(bullet);
      return this.bulletsIndex++;
    };

    Invaders.prototype.animloop = function() {
      requestAnimationFrame(this.animloop);
      return this.render();
    };

    Invaders.prototype.render = function() {
      if (this.isGoing.left && !this.isGoing.right) this.speed -= 2;
      if (this.isGoing.right && !this.isGoing.left) this.speed += 2;
      if (this.speed > 50) this.speed = 50;
      if (this.speed < -50) this.speed = -50;
      if (!this.isGoing.left && !this.isGoing.right || this.isGoing.left && this.isGoing.right) {
        if (this.speed > 0) this.speed -= 2;
        if (this.speed < 0) this.speed += 2;
      }
      this.offset += this.speed;
      return this.ship.css('-webkit-transform', "translate3d(0," + this.offset + "px,0)");
    };

    return Invaders;

  })();

  new Bivouac.App();

  (function() {
    var targetTime, vendor, w, _i, _len, _ref;
    w = window;
    _ref = ['ms', 'moz', 'webkit', 'o'];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      vendor = _ref[_i];
      if (w.requestAnimationFrame) break;
      w.requestAnimationFrame = w["" + vendor + "RequestAnimationFrame"];
      w.cancelAnimationFrame = w["" + vendor + "CancelAnimationFrame"] || w["" + vendor + "CancelRequestAnimationFrame"];
    }
    targetTime = 0;
    w.requestAnimationFrame || (w.requestAnimationFrame = function(callback) {
      var currentTime;
      targetTime = Math.max(targetTime + 16, currentTime = +(new Date));
      return w.setTimeout((function() {
        return callback(+(new Date));
      }), targetTime - currentTime);
    });
    return w.cancelAnimationFrame || (w.cancelAnimationFrame = function(id) {
      return clearTimeout(id);
    });
  })();

}).call(this);
