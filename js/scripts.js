(function() {
  var globals,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  if (window.Bivouac == null) window.Bivouac = {};

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
      var _this = this;
      this.ship = globals.$figure.children('img');
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
      this.addEnemies();
      setInterval(function() {
        return _this.render();
      }, 16);
    }

    Invaders.prototype.init = function() {
      var _this = this;
      $('.key').remove();
      globals.$header.addClass('playing');
      globals.$figure.addClass('ship');
      return window.onblur = function(e) {
        _this.isGoing.left = false;
        _this.isGoing.right = false;
        return _this.isShooting = false;
      };
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

    Invaders.prototype.render = function() {
      this.moveShip();
      this.moveBullets();
      if (this.isShooting && this.bullets.length < 1) return this.shootBullet();
    };

    Invaders.prototype.moveShip = function() {
      var shipPosition;
      shipPosition = this.ship.offset();
      if (this.isGoing.left && !this.isGoing.right) this.speed -= 3;
      if (this.isGoing.right && !this.isGoing.left) this.speed += 3;
      if (this.speed > 51) this.speed = 51;
      if (this.speed < -51) this.speed = -51;
      if (!this.isGoing.left && !this.isGoing.right || this.isGoing.left && this.isGoing.right) {
        if (this.speed > 0) this.speed -= 3;
        if (this.speed < 0) this.speed += 3;
      }
      if (shipPosition.left < 0 && this.speed < 0) this.speed = 0;
      if (shipPosition.left + 140 > window.innerWidth && this.speed > 0) {
        this.speed = 0;
      }
      this.offset += this.speed;
      return this.ship.css('-webkit-transform', "translate3d(0," + this.offset + "px,0)");
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

    Invaders.prototype.moveBullets = function() {
      var bottom, bounds, bullet, currentPos, enemy, i, pos, _len, _ref;
      if (!(bullet = this.bullets[0])) return;
      currentPos = bullet.elem.offset();
      if (currentPos.top < -38) {
        bullet.elem.remove();
        return this.bullets.pop();
      } else {
        _ref = this.enemies;
        for (i = 0, _len = _ref.length; i < _len; i++) {
          enemy = _ref[i];
          pos = enemy.offset();
          bounds = {
            left: pos.left,
            right: pos.left + enemy.width(),
            bottom: pos.top + enemy.height()
          };
          bottom = enemy.offset().top + enemy.height();
          if (currentPos.top <= bounds.bottom && currentPos.left >= bounds.left && currentPos.left <= bounds.right) {
            this.removeBullet();
            enemy.addClass('dead');
            this.enemies.splice(i, 1);
            return;
          }
        }
        bullet.offsetX += 30;
        return bullet.elem.css('-webkit-transform', "translate3d(" + bullet.offsetX + "px," + bullet.offsetY + "px,0)");
      }
    };

    Invaders.prototype.removeBullet = function() {
      var bullet;
      if (!(bullet = this.bullets[0])) return;
      bullet.elem.remove();
      return this.bullets.pop();
    };

    Invaders.prototype.addEnemies = function() {
      var enemies, enemy, i;
      this.enemies = [];
      enemies = $('<div class="enemies"></div>');
      for (i = 0; i <= 29; i++) {
        enemy = $('<span class="enemy"></span>');
        enemy.addClass(['paolo', 'ramiro', 'zach'][Math.floor(i / 10 % 10)]);
        enemy.css({
          left: 66 * (i % 10),
          top: 70 * (Math.ceil(i / 10) - 1) + 5
        });
        enemies.append(enemy);
        this.enemies.push(enemy);
      }
      return globals.$header.children().append(enemies);
    };

    return Invaders;

  })();

  new Bivouac.App();

  Array.prototype.random = function() {
    return this[Math.floor(Math.random() * this.length)];
  };

}).call(this);
