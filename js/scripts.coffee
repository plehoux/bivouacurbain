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

    this.animloop()

  init: ->
    $('.key').remove()
    globals.$header.addClass 'playing'
    globals.$figure.addClass 'ship'

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

  shootBullet: ->
    bullet = $('<span class="bullet"></span>')
    bullet.css '-webkit-transform', "translate3d(0,#{@offset}px,0)"
    globals.$figure.append bullet

    @bullets.push
      elem: bullet
      offsetX: 0
      offsetY: @offset

  animloop: =>
    requestAnimationFrame(this.animloop)
    this.render()

  # Render tick management
  render: ->
    this.moveShip()
    this.moveBullets()
    this.shootBullet() if @isShooting && @bullets.length < 1

  moveShip: ->
    @speed -= 2 if @isGoing.left && !@isGoing.right
    @speed += 2 if @isGoing.right && !@isGoing.left
    @speed = 50 if @speed > 50
    @speed = -50 if @speed < -50

    if !@isGoing.left && !@isGoing.right || @isGoing.left && @isGoing.right
      @speed -= 2 if @speed > 0
      @speed += 2 if @speed < 0

    @offset += @speed
    @ship.css '-webkit-transform', "translate3d(0,#{@offset}px,0)"

  moveBullets: ->
    return if !bullet = @bullets[0]
    currentTop = bullet.elem.offset().top

    if currentTop < -38
      bullet.elem.remove()
      @bullets.pop()
    else
      bullet.offsetX += 30
      bullet.elem.css '-webkit-transform', "translate3d(#{bullet.offsetX}px,#{bullet.offsetY}px,0)"


new Bivouac.App()


# RequestAnimationFrame Polyfill
# <https://gist.github.com/1579671>
do ->
    w = window
    for vendor in ['ms', 'moz', 'webkit', 'o']
        break if w.requestAnimationFrame
        w.requestAnimationFrame = w["#{vendor}RequestAnimationFrame"]
        w.cancelAnimationFrame = (w["#{vendor}CancelAnimationFrame"] or
                                  w["#{vendor}CancelRequestAnimationFrame"])

    targetTime = 0
    w.requestAnimationFrame or= (callback) ->
        targetTime = Math.max targetTime + 16, currentTime = +new Date
        w.setTimeout (-> callback +new Date), targetTime - currentTime

    w.cancelAnimationFrame or= (id) -> clearTimeout id
