import WebSocket from 'ws'
import {
  isMemberListMessage,
  isModeMessage,
  JoinMessage,
  Message,
  ModeMessage
} from '../chat/interfaces'

// Mock server setup (you'd replace this with your actual server in a real scenario)

describe('WebSocket Server Test', () => {
  let client: WebSocket

  beforeEach(done => {
    client = new WebSocket('ws://172.21.213.199:8080')
    client.on('open', done)
  })

  afterEach(done => {
    client.close()
    done()
  })

  test('client functionality', done => {
    const testMessage: JoinMessage = {
      command: 'JOIN',
      room: 'test',
      name: 'test1'
    }
    client.send(JSON.stringify(testMessage))

    client.on('message', data => {
      expect(isModeMessage(JSON.parse(data.toString()))).toBe(true)
      done()
    })
  })

  test('admin functionality', done => {
    const loginMesssage: JoinMessage = {
      command: 'JOIN',
      room: 'test',
      name: 'admin'
    }
    const modeMessage: ModeMessage = {
      command: 'MODE',
      mode: 2
    }
    let messageArray: Message[] = []
    client.send(JSON.stringify(loginMesssage))
    client.send(JSON.stringify(modeMessage))
    client.on('message', data => {
      const parsedData = JSON.parse(data.toString())
      messageArray.push(parsedData)
    })
    setTimeout(() => {
      expect(messageArray.length).toBe(3)
      expect(isMemberListMessage(messageArray[0])).toBe(true)
      expect(isModeMessage(messageArray[1])).toBe(true)
      console.log(messageArray[2])
      expect(messageArray[2]).toStrictEqual(modeMessage)
      done()
    }, 1000)
  })
})
