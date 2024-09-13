import WebSocket from 'ws'

export interface IRoom {
  add(user: WebSocket): void
  remove(user: WebSocket): void
  push(from: WebSocket, message: string): void
  id: string
}

export default class Room implements IRoom {
  private users: WebSocket[]
  id: string

  constructor(id: string) {
    this.users = []
    this.id = id
  }

  add(user: WebSocket) {
    if (!this.users.includes(user)) {
      this.users.push(user)
    }
  }
  remove(user: WebSocket) {
    if (this.users.includes(user)) {
      this.users.splice(this.users.indexOf(user), 1)
    }
  }

  push(from: WebSocket, message: string) {
    for (const user of this.users) {
      if (user !== from) {
        user.send(from.url + ': ' + message)
      }
    }
  }
}
export function createRoom(id: string): IRoom {
  return new Room(id)
}
