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
    @isShooting = false
    @isGoing =
      left: false
      right: false

    this.init()
    this.initKeyboard()
    this.addEnemies()

    setInterval =>
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
    enemies = $('<div class="enemies"></div>')

    for i in [0..29]
      enemy = $('<span class="enemy"></span>')
      enemy.addClass ['paolo', 'ramiro', 'zach'][Math.floor(i/10 % 10)]
      enemy.css
        left: 66 * (i % 10)
        top: 70 * (Math.ceil(i/10) - 1) + 5
      enemies.append enemy
      @enemies.push enemy

    globals.$header.children().append enemies


new Bivouac.App()


# Array.random()
Array::random = ->
  this[Math.floor(Math.random() * this.length)]
