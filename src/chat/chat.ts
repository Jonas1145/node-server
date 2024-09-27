import { WebSocket } from 'ws'
import { IRoom } from './room'
import { isJoinMessage, isTextMessage, Message } from '../interfaces'

export function string(item: string | Buffer | ArrayBuffer) {
  if (typeof item === 'string') {
    return item
  } else if (item instanceof Buffer) {
    return item.toString()
  }

  return Buffer.from(item).toString()
}
// type MSG = {
//   command: 'MSG'
//   room: string
//   message: string
// }
//
// type JOIN = {
//   command: 'JOIN'
//   room: string
//   name: string
// }
//
// type LEAVE = {
//   command: 'LEAVE'
//   room: string
// }

// type Command = MSG | JOIN | LEAVE

// function isCommand(msg: string): boolean {
//   return msg === 'MSG' || msg === 'JOIN' || msg === 'LEAVE'
// }

function getMessage(message: string | Buffer): Message | undefined {
  if (typeof message === 'object') {
    message = string(message)
  }
  const command = JSON.parse(message)
  return command
}

export class Chat {
  private rooms: IRoom[]

  constructor(private createRoom: (id: string) => IRoom) {
    this.rooms = []
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
      this.getRoom(message.room).push(user, message.msg)
      // } else {
      //   this.getRoom(message.room).remove(user)
    }
  }

  close() {
    this.rooms = []
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
