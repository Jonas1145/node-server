// Never edit this page in backend it is a simlink in frontend!!!

// Incoming messages
export type JoinMessage = {
  command: 'JOIN'
  room: string
  name: string
}

export type TextMessage = {
  command: 'MSG'
  room: string
  msg: string
  name?: string
  time?: number
}

// outgoing messages
export type MemberListMessage = {
  command: 'MEMBERS'
  room: string
  members: string[]
}

export type ModeMessage = {
  command: 'MODE'
  mode: number
}

export type Message = JoinMessage | TextMessage | MemberListMessage | ModeMessage

//typeguard functions
export function isJoinMessage(message: Message): message is JoinMessage {
  return message.command === 'JOIN'
}

export function isTextMessage(message: Message): message is TextMessage {
  return message.command === 'MSG'
}

export function isMemberListMessage(message: Message): message is MemberListMessage {
  return message.command === 'MEMBERS'
}

export function isModeMessage(message: Message): message is ModeMessage {
  return message.command === 'MODE'
}
