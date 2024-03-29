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
      this.score = 0;
      this.isShooting = false;
      this.enemiesClass = ['paolo', 'ramiro', 'zach'];
      this.enemiesClassIndex = 4;
      this.countdown = 7000;
      this.startTime = new Date();
      this.isGoing = {
        left: false,
        right: false
      };
      this.init();
      this.initKeyboard();
      this.addEnemies();
      this.addScoreSpan();
      if (_gaq) _gaq.push(['_trackEvent', 'Space Invaders', 'Game initiated']);
      this.rowTimeout = setTimeout(function() {
        return _this.addRow();
      }, this.countdown);
      this.gameTimer = setInterval(function() {
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
            this.addScore(enemy.data('row') * 10);
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
      var classIndex, delay, enemy, i,
        _this = this;
      this.enemies = [];
      this.enemiesContainer = $('<div class="enemies"></div>');
      for (i = 0; i <= 29; i++) {
        classIndex = Math.floor(i / 10 % 10);
        enemy = this.createEnemy(classIndex, classIndex + 1);
        enemy.addClass('hidden');
        delay = Math.floor(Math.random() * 10 + 5);
        enemy.css('-webkit-transition-delay', "0.0" + delay + "s");
      }
      setTimeout(function() {
        var enemy, _i, _len, _ref, _results;
        _ref = _this.enemies;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          enemy = _ref[_i];
          _results.push(enemy.removeClass('hidden'));
        }
        return _results;
      }, 100);
      return globals.$header.children().append(this.enemiesContainer);
    };

    Invaders.prototype.createEnemy = function(classIndex, row) {
      var enemy;
      enemy = $('<span class="hidden enemy"></span>');
      enemy.addClass(this.enemiesClass[classIndex]);
      enemy.data('row', row);
      this.enemiesContainer.prepend(enemy);
      this.enemies.push(enemy);
      return enemy;
    };

    Invaders.prototype.addRow = function() {
      var enemy, i,
        _this = this;
      for (i = 0; i <= 9; i++) {
        enemy = this.createEnemy(this.enemiesClassIndex % this.enemiesClass.length, this.enemiesClassIndex);
        enemy.removeClass('hidden');
      }
      if (this.enemiesClassIndex - $('.enemy').not('.dead').last().data('row') === 5) {
        this.endGame();
        return;
      }
      this.enemiesClassIndex++;
      if (this.countdown > 3000) this.countdown -= 250;
      return setTimeout(function() {
        return _this.addRow();
      }, this.countdown);
    };

    Invaders.prototype.addScoreSpan = function() {
      this.scoreSpan = $('<span class="score">Score: 0</span>');
      return globals.$header.append(this.scoreSpan);
    };

    Invaders.prototype.addScore = function(score) {
      var incrementSpan;
      this.score += score;
      this.scoreSpan.html("Score: " + this.score);
      incrementSpan = $("<span class='score-increment'>+ " + score + "</span>");
      globals.$header.append(incrementSpan);
      return this.rowTimeout = setTimeout(function() {
        return incrementSpan.addClass('animate');
      }, 0);
    };

    Invaders.prototype.endGame = function() {
      var endGame, m, minutes, ms, s, seconds,
        _this = this;
      $('.enemy').not('.dead').addClass('dead');
      this.enemies = [];
      this.removeBullet();
      clearInterval(this.gameTimer);
      clearTimeout(this.rowTimeout);
      ms = new Date() - this.startTime;
      ms += 1000;
      s = ms / 1000;
      seconds = Math.floor(s % 60);
      if (seconds < 10) seconds = "0" + seconds;
      m = s / 60;
      minutes = Math.floor(m % 60);
      if (minutes < 10) minutes = "0" + minutes;
      if (_gaq) {
        _gaq.push(['_trackEvent', 'Space Invaders', 'Score', "" + this.score]);
      }
      if (_gaq) {
        _gaq.push(['_trackEvent', 'Space Invaders', 'Duration', "" + minutes + ":" + seconds]);
      }
      endGame = $("<div class=\"end-game hidden\">\n  <span>Game Over</span>\n  <p>You scored " + this.score + "</p>\n  <div class=\"social-share hidden\">\n    <a href=\"https://twitter.com/share\" class=\"twitter-share-button\" data-url=\"http://bivouacurbain.com\" data-text=\"I scored " + this.score + " points! Can you beat me?\" data-via=\"bivouacurbain\" data-hashtags=\"easteregg\">Tweet</a>\n    <div class=\"fb-like\" data-href=\"http://bivouacurbain.com\" data-send=\"false\" data-layout=\"button_count\" data-width=\"250\" data-show-faces=\"false\" data-font=\"lucida grande\"></div>\n  </div>\n\n  <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=\"//platform.twitter.com/widgets.js\";fjs.parentNode.insertBefore(js,fjs);}}(document,\"script\",\"twitter-wjs\");</script>\n\n  <div id=\"fb-root\"></div>\n  <script>(function(d, s, id) {\n    var js, fjs = d.getElementsByTagName(s)[0];\n    if (d.getElementById(id)) return;\n    js = d.createElement(s); js.id = id;\n    js.src = \"//connect.facebook.net/" + {
        fr: 'fr_CA',
        en: 'en_US'
      }[$('html').attr('lang')] + "/all.js#xfbml=1&appId=259990290693706\";\n    fjs.parentNode.insertBefore(js, fjs);\n  }(document, 'script', 'facebook-jssdk'));</script>\n</div>");
      globals.$header.append(endGame);
      return setTimeout(function() {
        endGame.removeClass('hidden');
        return setTimeout(function() {
          return $('.social-share').removeClass('hidden');
        }, 850);
      }, 500);
    };

    return Invaders;

  })();

  new Bivouac.App();

}).call(this);
