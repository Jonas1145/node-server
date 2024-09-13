import { WebSocket } from 'ws'
import Room, { IRoom } from './room'

export function string(item: string | Buffer | ArrayBuffer) {
  if (typeof item === 'string') {
    return item
  } else if (item instanceof Buffer) {
    return item.toString()
  }

  return Buffer.from(item).toString()
}
type MSG = {
  command: 'MSG'
  room: string
  message: string
}

type JOIN = {
  command: 'JOIN'
  room: string
}

type LEAVE = {
  command: 'LEAVE'
  room: string
}

type Command = MSG | JOIN | LEAVE

function isCommand(msg: string): boolean {
  return msg === 'MSG' || msg === 'JOIN' || msg === 'LEAVE'
}

function getMessage(message: string | Buffer): Command | undefined {
  if (typeof message === 'object') {
    message = string(message)
  }

  const [command, ...rest] = message.split(' ')
  if (!isCommand(command)) {
    return undefined
  }

  if (command === 'MSG') {
    return {
      command: 'MSG',
      room: rest[0],
      message: rest.slice(1).join(' ')
    }
  } else if (command === 'JOIN') {
    return {
      command: 'JOIN',
      room: rest[0]
    }
  }
  return {
    command: 'LEAVE',
    room: rest[0]
  }
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
    if (message.command === 'JOIN') {
      this.getRoom(message.room).add(user)
    } else if (message.command === 'MSG') {
      this.getRoom(message.room).push(user, message.message)
    } else {
      this.getRoom(message.room).remove(user)
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
