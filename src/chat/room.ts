import WebSocket from 'ws'
import { MemberListMessage, ModeMessage, StepMessage, TextMessage } from './interfaces'

export interface IRoom {
  add(ws: WebSocket, name: string): void
  remove(ws: WebSocket): void
  push(from: WebSocket, message: TextMessage, mode?: number): void
  changeMode(message: ModeMessage): void
  pushMind(message: StepMessage): void
  pushWavelength(): void
  pushStep(lvl: string) : void
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
  private team1: WebSocket[]
  private team2: WebSocket[]
  private teams = ['team1', 'team2']

  constructor(id: string) {
    this.users = []
    this.id = id
    this.team1 = []
    this.team2 = []
  }
  getAdmin(): WebSocket | undefined {
    for (let i = this.users.length - 1; i >= 0; i--) {
      if (this.users[i].name === adminName) {
        return this.users[i].ws
      }
    }
  }

  // filter admin out of member list
  getMembers(): User[] {
    return this.users.filter(user => user.name !== adminName)
  }

  // todo: send current gamemode in case of reconnect
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

  private handlePong(from: WebSocket, message: TextMessage) {
    const currentTeam = message.msg
    if (!this.teams.includes(currentTeam)) {
      return
    } else if (currentTeam === this.teams[0]) {
      const team = this.team1.indexOf(from)
      if (team !== -1) {
        this.getAdmin()?.send(JSON.stringify({ ...message, msg: 'team1 ' + team.toString() }))
      } else {
        this.team1.push(from)
      }
    } else {
      const team = this.team2.indexOf(from)
      if (team !== -1) {
        this.getAdmin()?.send(JSON.stringify({ ...message, msg: 'team2 ' + team.toString() }))
      } else {
        this.team2.push(from)
      }
    }
  }

  push(from: WebSocket, message: TextMessage, mode?: number) {
    console.log(mode)
    // handle Pong game explicitely
    if (mode === 7) {
      this.handlePong(from, message)
    } else {
      for (const user of this.users) {
        if (user.ws !== from) {
          const name = this.users.find(user => user.ws === from)?.name || 'Unknown'
          user.ws.send(JSON.stringify({ ...message, name }))
        }
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

  changeMode(message: ModeMessage) {
    for (const user of this.users) {
      user.ws.send(JSON.stringify(message))
    }
  }

  pushMind(message: StepMessage) {
 const members = this.getMembers()
  const numbers = createMindNumbers(members.length, message.level, 100)
    console.log(
      'Lvl: ', message.level, '_________________'
    )
  members.forEach((user, idx) => {
    const userNumbers = numbers.slice(idx * message.level, (idx + 1) * message.level)
    const sortedNumbers = userNumbers.sort((a, b) => a - b)
      console.log(
      user.name, ': ', sortedNumbers
      )
    user.ws.send(JSON.stringify({ command: 'MIND', numbers: sortedNumbers }))
  })
  }

  pushWavelength() {
    const members = this.getMembers()
    const percent = Math.floor(Math.random() * 21)* 5
    this.getAdmin()?.send(JSON.stringify({ command: 'WAVELENGTH', percent: percent }))
    if (members.length >= 2) {
      try {

    members[0].ws.send(JSON.stringify({ command: 'WAVELENGTH', percent: -1 }))
    members[1].ws.send(JSON.stringify({ command: 'WAVELENGTH', percent: percent }))
      } catch {
        console.error('ws not found')
      } 
    }
  }


  pushStep(lvl: string) {
 const members = this.getMembers()
  members.forEach((user) => {
    user.ws.send(JSON.stringify({ command: 'STEP', level: lvl }))
  })
  }
}

export function createRoom(id: string): IRoom {
  console.log('Creating room:', id)
  return new Room(id)
}

// create array of length ammount * users with unique random numbers between 0 and max
function createMindNumbers(users: number, level: number, max: number): number[] {
  const numbers: number[] = []
  const ammount = level * users

  for (let i = 0; i < ammount; i++) {
    let number = Math.floor(Math.random() * max)
    while (numbers.includes(number)) {
      number = Math.floor(Math.random() * max)
    }
    numbers.push(number)
  }
  return numbers
}
