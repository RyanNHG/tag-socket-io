const { port } = {
  port: process.env.PORT || 3000
}
const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const morgan = require('morgan')
const bodyParser = require('body-parser')

const gameState = {
  players: []
}

app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(express.static(path.join(__dirname, 'public')))

app.get('/api', (req, res) => {
  res.json('api')
})

app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'index.html'))
)

const randomColor = () => {
  let hexColor = '#'
  let hexValues = '0123456789abcdef'
  for (let i = 0; i < 6; i++) {
    hexColor += hexValues[parseInt(Math.random() * hexValues.length)]
  }
  return hexColor
}

const randomPercentage = () =>
  parseInt(Math.random() * 100)

const getDeltas = (directions) => {
  const contains = (dir) => directions.indexOf(dir) !== -1

  const deltas = {
    x: 0,
    y: 0
  }

  if (contains('up')) {
    deltas.y = -1
  } 
  if (contains('down')) {
    deltas.y = 1
  }
  if (contains('left')) {
    deltas.x = -1
  } 
  if (contains('right')) {
    deltas.x = 1
  }

  return deltas
}

io.on('connection', (socket) => {
  const id = socket.id
  const isNewPlayer = gameState.players.filter(p => p.id === id).length === 0

  console.log(`IO: ${id} has connected`)
  
  if (isNewPlayer) {
    gameState.players.push({
      id,
      color: randomColor(),
      x: randomPercentage(),
      y: randomPercentage()
    })
  }

  socket.on('move', ({ id, directions }) => {
    if (id !== undefined) {
      console.log(`IO: ${id} moved ${directions.join(' and ')}`)
      const deltaTuple = getDeltas(directions)
      gameState.players
        .filter(p => p.id === id)
        .forEach(player => {
          player.x += deltaTuple.x
          player.y += deltaTuple.y

          if (player.x < 0) player.x = 0
          if (player.y < 0) player.y = 0
          if (player.x > 100) player.x = 100
          if (player.y > 100) player.y = 100
        })
      io.emit('update', gameState)
    }
  })

  socket.on('disconnect', () => {
    console.log(`IO: ${id} has disconnected`)
    gameState.players = gameState.players.filter(p => p.id !== id)
    io.emit('update', gameState)
  })

  socket.emit('get-id', id)
  io.emit('update', gameState)
})

http.listen(port, () => console.log(`Ready at http://localhost:${port}`))
