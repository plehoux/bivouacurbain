Bivouac ?= {}

# App class
class Bivouac.App

  constructor: ->


# Invaders game class
class Bivouac.Invaders

  constructor: ->
    @header = $('header')
    @container = @header.find('figure')
    @ship = @container.children('img')
    @bullets = {}
    @bulletsIndex = 1
    @offset = 0
    @speed = 0
    @isGoing =
      left: false
      right: false

    this.init()
    this.initKeyboard()

    this.animloop()

  init: ->
    @header.addClass 'playing'
    @container.addClass 'ship'

  initKeyboard: ->
    $body = $('body')

    $body.bind 'keydown', (e) =>
      return if [37,39,32].indexOf(e.keyCode) < 0
      switch e.keyCode
        when 37 then @isGoing.left = true
        when 39 then @isGoing.right = true
        when 32 then this.shootBullet()

    $body.bind 'keyup', (e) =>
      switch e.keyCode
        when 37 then @isGoing.left = false
        when 39 then @isGoing.right = false

  shootBullet: ->
    bullet = $('<span class="bullet"></span>')
    bullet.css '-webkit-transform', "translate3d(0,#{@offset}px,0)"
    @container.append bullet

    @bulletsIndex++

  animloop: =>
    requestAnimationFrame(this.animloop)
    this.render()

  render: ->
    @speed -= 2 if @isGoing.left && !@isGoing.right
    @speed += 2 if @isGoing.right && !@isGoing.left
    @speed = 50 if @speed > 50
    @speed = -50 if @speed < -50

    if !@isGoing.left && !@isGoing.right || @isGoing.left && @isGoing.right
      @speed -= 2 if @speed > 0
      @speed += 2 if @speed < 0

    @offset += @speed
    @ship.css '-webkit-transform', "translate3d(0,#{@offset}px,0)"


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
