import WebSocket from 'ws'
import { MemberListMessage } from '../interfaces'

export interface IRoom {
  add(ws: WebSocket, name: string): void
  remove(ws: WebSocket): void
  push(from: WebSocket, message: string): void
  id: string
}
export interface User {
  ws: WebSocket
  name: string
}

const adminName = 'admin'

export default class Room implements IRoom {
  private users: User[]
  id: string

  constructor(id: string) {
    this.users = []
    this.id = id
  }
  getAdmin(): WebSocket | undefined {
    for (let i = this.users.length - 1; i >= 0; i--) {
      if (this.users[i].name === adminName) {
        return this.users[i].ws
      }
    }
  }

  add(ws: WebSocket, name: string) {
    if (!this.users.some(user => user.ws === ws)) {
      console.log(name)
      this.users.push({ ws, name })
      const memberListResponse: MemberListMessage = {
        command: 'MEMBERS',
        room: this.id,
        members: this.users.filter(u => u.name !== 'admin').map(user => user.name)
      }
      this.getAdmin()?.send(JSON.stringify(memberListResponse))
    }
  }
  remove(ws: WebSocket) {
    if (!this.users.some(user => user.ws === ws)) {
      this.users.splice(
        this.users.findIndex(user => user.ws === ws),
        1
      )
    }
  }

  push(from: WebSocket, message: string) {
    for (const user of this.users) {
      if (user.ws !== from) {
        const name = this.users.find(user => user.ws === from)?.name || 'Unknown'
        user.ws.send(name + ': ' + message)
      }
    }
  }
}
export function createRoom(id: string): IRoom {
  console.log('Creating room:', id)
  return new Room(id)
}
