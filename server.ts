import WebSocket, { WebSocketServer } from 'ws'
// import { Chat } from './chat/chat'
// import { createRoom } from './chat/room'

// const chat = new Chat(createRoom)

const wss = new WebSocketServer({ port: 8080 })
console.log('Server started on port 8080')

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: WebSocket.RawData) => {
    console.log('received: %s', message)
    ws.send('received: ' + message)

    // chat.msg(ws, message.toString())
  })
})
