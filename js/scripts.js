(function() {
  var globals,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (typeof Bivouac === "undefined" || Bivouac === null) Bivouac = {};

  globals = {};

  globals.$header = $('header');

  globals.$figure = globals.$header.find('figure');

  Bivouac.App = (function() {

    function App() {
      this.onControllerButtonClick = __bind(this.onControllerButtonClick, this);      this.keys = ['X', 'A', 'B', 'Y'];
      this.keysIndex = 0;
      this.addHint();
      this.addControllerButtons();
    }

    App.prototype.addHint = function() {
      var i, key, li, random, _i, _len, _ref;
      this.pattern = [];
      for (i = 0; i <= 9; i++) {
        random = Math.floor(Math.random() * this.keys.length);
        this.pattern.push(this.keys[random]);
      }
      this.hint = $('<ul class="hint"></ul>');
      _ref = this.pattern;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        li = $("<li>" + key + "</li>");
        this.hint.append(li);
      }
      return globals.$header.children('.wrap').prepend(this.hint);
    };

    App.prototype.addControllerButtons = function() {
      var btn, key, _i, _len, _ref, _results;
      _ref = this.keys;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        key = _ref[_i];
        btn = $('<a class="key" href="javascript:"></a>').data('value', key);
        btn.on('click', this.onControllerButtonClick);
        _results.push(globals.$figure.append(btn));
      }
      return _results;
    };

    App.prototype.onControllerButtonClick = function(e) {
      var value;
      value = $(e.currentTarget).data('value');
      if (value === this.pattern[this.keysIndex]) {
        this.hint.children().eq(this.keysIndex).addClass('valid');
        this.keysIndex++;
        if (this.keysIndex === this.pattern.length) return new Bivouac.Invaders;
      } else {
        this.hint.children('.valid').removeClass('valid');
        return this.keysIndex = 0;
      }
    };

    return App;

  })();

  Bivouac.Invaders = (function() {

    function Invaders() {
      this.animloop = __bind(this.animloop, this);      this.ship = globals.$figure.children('img');
      this.bullets = [];
      this.offset = 0;
      this.speed = 0;
      this.isShooting = false;
      this.isGoing = {
        left: false,
        right: false
      };
      this.init();
      this.initKeyboard();
      this.animloop();
    }

    Invaders.prototype.init = function() {
      $('.key').remove();
      globals.$header.addClass('playing');
      return globals.$figure.addClass('ship');
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
            _this.isShooting = true;
            return false;
        }
      });
      return $body.bind('keyup', function(e) {
        switch (e.keyCode) {
          case 37:
            return _this.isGoing.left = false;
          case 39:
            return _this.isGoing.right = false;
          case 32:
            return _this.isShooting = false;
        }
      });
    };

    Invaders.prototype.shootBullet = function() {
      var bullet;
      bullet = $('<span class="bullet"></span>');
      bullet.css('-webkit-transform', "translate3d(0," + this.offset + "px,0)");
      globals.$figure.append(bullet);
      return this.bullets.push({
        elem: bullet,
        offsetX: 0,
        offsetY: this.offset
      });
    };

    Invaders.prototype.animloop = function() {
      requestAnimationFrame(this.animloop);
      return this.render();
    };

    Invaders.prototype.render = function() {
      this.moveShip();
      this.moveBullets();
      if (this.isShooting && this.bullets.length < 1) return this.shootBullet();
    };

    Invaders.prototype.moveShip = function() {
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

    Invaders.prototype.moveBullets = function() {
      var bullet, currentTop;
      if (!(bullet = this.bullets[0])) return;
      currentTop = bullet.elem.offset().top;
      if (currentTop < -38) {
        bullet.elem.remove();
        return this.bullets.pop();
      } else {
        bullet.offsetX += 30;
        return bullet.elem.css('-webkit-transform', "translate3d(" + bullet.offsetX + "px," + bullet.offsetY + "px,0)");
      }
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
