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
}

// outgoing messages
export type MemberListMessage = {
  command: 'MEMBERS'
  room: string
  members: string[]
}

export type Message = JoinMessage | TextMessage | MemberListMessage

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
