(() => {
  // Game state
  const playerSize = 50
  const state = {
    id: undefined,
    players: [],
    keys: {
      up: false,
      down: false,
      left: false,
      right: false
    }
  }

  // Rendering
  const canvas = document.querySelector('#canvas')
  const context = canvas.getContext('2d')

  const Player = ({ color, x, y }) => ({
    color,
    x: parseInt((canvas.width - playerSize) / 100 * x),
    y: parseInt((canvas.height - playerSize) / 100 * y),
    w: playerSize,
    h: playerSize
  })

  const render = () => {
    const smallerDimension = 400
    // const smallerDimension = (window.innerWidth < window.innerHeight)
    //   ? window.innerWidth
    //   : window.innerHeight

    canvas.setAttribute('width', smallerDimension)
    canvas.setAttribute('height', smallerDimension)

    drawPlayers(state.players)
  }

  const fillCanvas = (color) => {
    context.fillStyle = color
    context.fillRect(0, 0, canvas.width, canvas.height)
  }

  const drawPlayers = (players) => {
    fillCanvas('#333')
    players.map(Player).map(drawPlayer)
  }

  const drawPlayer = (player) => {
    context.fillStyle = player.color
    context.fillRect(player.x, player.y, player.w, player.h)
  }

  window.addEventListener('resize', render)

  render()

  // Sockets
  const socket = io()

  socket.on('get-id', (id) => {
    state.id = id
  })

  socket.on('update', ({ players }) => {
    state.players = players
    drawPlayers(state.players)
  })

  // Key events
  const keyMap = {
    38: 'up',
    87: 'up',
    37: 'left',
    65: 'left',
    40: 'down',
    83: 'down',
    39: 'right',
    68: 'right'
  }

  const keyChange = (keyCode, value) => {
    const direction = keyMap[keyCode]
    if (direction) {
      state.keys[direction] = value
    }

    const id = state.id
    const directions = Object.keys(state.keys).filter(key => state.keys[key])
    if (directions.length > 0) {
      socket.emit('move', { id, directions })
    }
  }

  window.onkeydown = (e) => keyChange(e.keyCode, true)
  window.onkeyup = (e) => keyChange(e.keyCode, false)
  
})()
