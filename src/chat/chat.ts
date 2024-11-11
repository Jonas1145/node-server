import { WebSocket } from 'ws'
import { IRoom } from './room'
import {
  isJoinMessage,
  isMindMessage,
  isModeMessage,
  isTextMessage,
  Message,
  MindMessage,
  ModeMessage
} from './interfaces'

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

const gameModesWithTimer = [2]

export class Chat {
  private rooms: IRoom[]
  private gameMode: number
  private startTime: number

  constructor(private createRoom: (id: string) => IRoom) {
    this.rooms = []
    this.gameMode = 1
    this.startTime = 0
  }

  // handle messages
  msg(user: WebSocket, msg: string | Buffer) {
    const message = getMessage(msg)
    if (!message) {
      return
    }
    if (isJoinMessage(message)) {
      this.getRoom(message.room).add(user, message.name)
      this.sendCurrentMode(user)
    } else if (isTextMessage(message)) {
      let msg = message
      if (gameModesWithTimer.includes(this.gameMode)) {
        if (this.startTime === 0) {
          msg = { ...message, time: 0 }
          this.startTime = Date.now()
        }
        {
          msg = { ...message, time: Date.now() - this.startTime }
        }
      }
      this.getRoom(message.room).push(user, msg, this.gameMode)
    } else if (isModeMessage(message)) {
      this.rooms.forEach(room => {
        this.gameMode = message.mode
        this.startTime = 0
        console.log(this.gameMode)
        room.changeMode(message)
      })
    } else if (isMindMessage(message)) {
      this.handleMindMessage(message)
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

  private sendCurrentMode(user: WebSocket) {
    const message: ModeMessage = {
      command: 'MODE',
      mode: this.gameMode
    }
    user.send(JSON.stringify(message))
  }

  private handleMindMessage(message: MindMessage) {
    this.getRoom(message.room).pushMind(message)
  }
}
