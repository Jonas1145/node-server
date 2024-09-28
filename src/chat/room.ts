import WebSocket from 'ws'
import { MemberListMessage, TextMessage } from '../interfaces'

export interface IRoom {
  add(ws: WebSocket, name: string): void
  remove(ws: WebSocket): void
  push(from: WebSocket, message: TextMessage): void
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
      this.sendCurrentMembersToAdmin()
    }
  }
  remove(ws: WebSocket) {
    console.log('Removing user in room')
    if (this.users.some(user => user.ws === ws)) {
      this.users.splice(
        this.users.findIndex(user => user.ws === ws),
        1
      )
      this.sendCurrentMembersToAdmin()
    } else {
      console.log('User not found')
    }
  }

  push(from: WebSocket, message: TextMessage) {
    for (const user of this.users) {
      if (user.ws !== from) {
        const name = this.users.find(user => user.ws === from)?.name || 'Unknown'
        user.ws.send(JSON.stringify({ ...message, name }))
      }
    }
  }

  private sendCurrentMembersToAdmin() {
    const memberListResponse: MemberListMessage = {
      command: 'MEMBERS',
      room: this.id,
      members: this.users.filter(u => u.name !== 'admin').map(user => user.name)
    }
    this.getAdmin()?.send(JSON.stringify(memberListResponse))
  }
}

export function createRoom(id: string): IRoom {
  console.log('Creating room:', id)
  return new Room(id)
}
