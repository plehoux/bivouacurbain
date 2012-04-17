window.Bivouac ?= {}
globals = {}
globals.$header = $('header')
globals.$figure = globals.$header.find('figure')

# App class
class Bivouac.App

  constructor: ->
    @keys = ['X', 'A', 'B', 'Y']
    @keysIndex = 0
    this.addHint()
    this.addControllerButtons()

  addHint: ->
    @pattern = []
    for i in [0..9]
      random = Math.floor Math.random() * @keys.length
      @pattern.push @keys[random]

    @hint = $('<ul class="hint"></ul>')
    for key in @pattern
      li = $("<li>#{key}</li>")
      @hint.append li

    globals.$header.children('.wrap').prepend @hint

  addControllerButtons: ->
    for key in @keys
      btn = $('<a class="key" href="javascript:"></a>').data('value', key)
      btn.on 'click', this.onControllerButtonClick
      globals.$figure.append btn

  onControllerButtonClick: (e) =>
    value = $(e.currentTarget).data('value')

    if value == @pattern[@keysIndex]
      @hint.children().eq(@keysIndex).addClass 'valid'
      @keysIndex++
      new Bivouac.Invaders if @keysIndex == @pattern.length
    else
      @hint.children('.valid').removeClass('valid')
      @keysIndex = 0


# Invaders game class
class Bivouac.Invaders

  constructor: ->
    @ship = globals.$figure.children('img')
    @bullets = []
    @offset = 0
    @speed = 0
    @score = 0
    @isShooting = false
    @enemiesClass = ['paolo', 'ramiro', 'zach']
    @enemiesClassIndex = 4
    @countdown = 7000
    @isGoing =
      left: false
      right: false

    this.init()
    this.initKeyboard()
    this.addEnemies()
    this.addScoreSpan()

    @rowTimeout = setTimeout =>
      this.addRow()
    , @countdown

    @gameTimer = setInterval =>
      this.render()
    , 16

  # Initialization
  init: ->
    $('.key').remove()
    globals.$header.addClass 'playing'
    globals.$figure.addClass 'ship'

    window.onblur = (e) =>
      @isGoing.left = false
      @isGoing.right = false
      @isShooting = false

  initKeyboard: ->
    $body = $('body')

    $body.bind 'keydown', (e) =>
      return if [37,39,32].indexOf(e.keyCode) < 0
      switch e.keyCode
        when 37 then @isGoing.left = true
        when 39 then @isGoing.right = true
        when 32 then @isShooting = true; return false

    $body.bind 'keyup', (e) =>
      switch e.keyCode
        when 37 then @isGoing.left = false
        when 39 then @isGoing.right = false
        when 32 then @isShooting = false

  # Render management
  render: ->
    this.moveShip()
    this.moveBullets()
    this.shootBullet() if @isShooting && @bullets.length < 1

  moveShip: ->
    shipPosition = @ship.offset()
    @speed -= 3 if @isGoing.left && !@isGoing.right
    @speed += 3 if @isGoing.right && !@isGoing.left
    @speed = 51 if @speed > 51
    @speed = -51 if @speed < -51

    if !@isGoing.left && !@isGoing.right || @isGoing.left && @isGoing.right
      @speed -= 3 if @speed > 0
      @speed += 3 if @speed < 0

    if shipPosition.left < 0 && @speed < 0 then @speed = 0
    if shipPosition.left + 140 > window.innerWidth && @speed > 0 then @speed = 0

    @offset += @speed
    @ship.css '-webkit-transform', "translate3d(0,#{@offset}px,0)"

  # Bullets management
  shootBullet: ->
    bullet = $('<span class="bullet"></span>')
    bullet.css '-webkit-transform', "translate3d(0,#{@offset}px,0)"
    globals.$figure.append bullet

    @bullets.push
      elem: bullet
      offsetX: 0
      offsetY: @offset

  moveBullets: ->
    return if !bullet = @bullets[0]
    currentPos = bullet.elem.offset()

    if currentPos.top < -38
      bullet.elem.remove()
      @bullets.pop()
    else
      for enemy, i in @enemies
        pos = enemy.offset()
        bounds =
          left: pos.left
          right: pos.left + enemy.width()
          bottom: pos.top + enemy.height()

        bottom = enemy.offset().top + enemy.height()
        if currentPos.top <= bounds.bottom && currentPos.left >= bounds.left && currentPos.left <= bounds.right
          this.removeBullet()
          enemy.addClass 'dead'
          @enemies.splice i, 1
          this.addScore enemy.data('row') * 10
          return

      bullet.offsetX += 30
      bullet.elem.css '-webkit-transform', "translate3d(#{bullet.offsetX}px,#{bullet.offsetY}px,0)"

  removeBullet: ->
    return if !bullet = @bullets[0]
    bullet.elem.remove()
    @bullets.pop()

  # Enemies management
  addEnemies: ->
    @enemies = []
    @enemiesContainer = $('<div class="enemies"></div>')

    for i in [0..29]
      classIndex = Math.floor(i/10 % 10)
      enemy = this.createEnemy classIndex, classIndex + 1
      enemy.addClass 'hidden'
      delay = Math.floor(Math.random() * 10 + 5)
      enemy.css '-webkit-transition-delay', "0.0#{delay}s"

    setTimeout =>
      for enemy in @enemies
        enemy.removeClass 'hidden'
    , 100

    globals.$header.children().append @enemiesContainer

  createEnemy: (classIndex, row) ->
    enemy = $('<span class="hidden enemy"></span>')
    enemy.addClass @enemiesClass[classIndex]
    enemy.data 'row', row

    @enemiesContainer.prepend enemy
    @enemies.push enemy

    enemy

  addRow: ->
    for i in [0..9]
      enemy = this.createEnemy @enemiesClassIndex % @enemiesClass.length, @enemiesClassIndex
      enemy.removeClass 'hidden'

    if @enemiesClassIndex - $('.enemy').not('.dead').last().data('row') == 5
      this.endGame()
      return

    @enemiesClassIndex++
    @countdown -= 250 if @countdown > 3000

    setTimeout =>
      this.addRow()
    , @countdown

  # Score management
  addScoreSpan: ->
    @scoreSpan = $('<span class="score">Score: 0</span>')
    globals.$header.append @scoreSpan

  addScore: (score) ->
    @score += score
    @scoreSpan.html "Score: #{@score}"

    incrementSpan = $("<span class='score-increment'>+ #{score}</span>")
    globals.$header.append incrementSpan

    @rowTimeout = setTimeout ->
      incrementSpan.addClass 'animate'
    , 0

  endGame: ->
    $('.enemy').not('.dead').addClass('dead')
    @enemies = []
    this.removeBullet()
    clearInterval @gameTimer
    clearTimeout @rowTimeout

    endGame = $("""
      <div class="end-game hidden">
        <span>Game Over</span>
        <p>You scored #{@score}</p>
        <div class="social-share hidden">
          <a href="https://twitter.com/share" class="twitter-share-button" data-url="http://bivouacurbain.com" data-text="I scored #{@score} points! Can you beat me?" data-via="bivouacurbain" data-hashtags="easteregg">Tweet</a>
          <div class="fb-like" data-href="http://bivouacurbain.com" data-send="false" data-layout="button_count" data-width="250" data-show-faces="false" data-font="lucida grande"></div>
        </div>

        <script>!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");</script>

        <div id="fb-root"></div>
        <script>(function(d, s, id) {
          var js, fjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "//connect.facebook.net/#{{fr: 'fr_CA', en: 'en_US'}[$('html').attr('lang')]}/all.js#xfbml=1&appId=259990290693706";
          fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));</script>
      </div>
    """)

    globals.$header.append endGame
    setTimeout =>
      endGame.removeClass 'hidden'
      setTimeout =>
        $('.social-share').removeClass 'hidden'
      , 850
    , 500


new Bivouac.App()
