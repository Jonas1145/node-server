import { WebSocket } from 'ws'
import { IRoom } from './room'
import { isJoinMessage, isModeMessage, isTextMessage, Message, ModeMessage } from './interfaces'

export function string(item: string | Buffer | ArrayBuffer) {
  if (typeof item === 'string') {
    return item
  } else if (item instanceof Buffer) {
    return item.toString()
  }

  return Buffer.from(item).toString()
}

function getMessage(message: string | Buffer): Message | undefined {
  if (typeof message === 'object') {
    message = string(message)
  }
  const command = JSON.parse(message)
  return command
}

export class Chat {
  private rooms: IRoom[]
  private gameMode: number

  constructor(private createRoom: (id: string) => IRoom) {
    this.rooms = []
    this.gameMode = 0
  }

  // handle messages
  msg(user: WebSocket, msg: string | Buffer) {
    const message = getMessage(msg)
    if (!message) {
      return
    }
    if (isJoinMessage(message)) {
      this.getRoom(message.room).add(user, message.name)
    } else if (isTextMessage(message)) {
      this.getRoom(message.room).push(user, message)
    } else if (isModeMessage(message)) {
      this.rooms.forEach(room => {
        this.gameMode = message.mode
        console.log(this.gameMode)
        room.changeMode(message)
      })
    }
  }

  close() {
    this.rooms = []
  }

  remove(user: WebSocket) {
    this.rooms.forEach(room => room.remove(user))
  }

  private getRoom(id: string): IRoom {
    let room = this.rooms.find(room => room.id === id)
    if (!room) {
      room = this.createRoom(id)
      this.rooms.push(room)
    }
    return room
  }
}
