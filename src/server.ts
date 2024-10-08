import WebSocket, { WebSocketServer } from 'ws'
import { createRoom } from './chat/room'
import { Chat } from './chat/chat'

const chat = new Chat(createRoom)

const wss = new WebSocketServer({ port: 8080 })
console.log('Server started on port 8080')

wss.on('connection', (ws: WebSocket) => {
  ws.on('message', (message: WebSocket.RawData) => {
    chat.msg(ws, message.toString())
  })
  ws.on('close', () => {
    console.log('Client disconnected')
    chat.remove(ws)
  })
})
