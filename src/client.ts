import WebSocket from 'ws'
import readline from 'readline'
import { isModeMessage, isTextMessage, Message, TextMessage } from './chat/interfaces'

class TerminalWebSocketClient {
  private ws: WebSocket
  private rl: readline.Interface
  private name: string

  private static RESET = '\x1b[0m'
  private static OTHER_USER_COLOR = '\x1b[36m' // Cyan color

  constructor(url: string) {
    this.ws = new WebSocket(url)
    this.name = ''
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
    this.ws.on('open', this.onOpen.bind(this))
    this.ws.on('message', this.onMessage.bind(this))
    this.ws.on('close', this.onClose.bind(this))
    this.ws.on('error', this.onError.bind(this))
  }

  private onOpen() {
    console.log('Connected to the server')
    this.askForName()
  }

  private askForName() {
    this.rl.question('Enter your name: ', name => {
      this.name = name.trim()
      if (this.name) {
        const msg: Message = {
          command: 'JOIN',
          room: 'games',
          name: this.name
        }
        this.ws.send(JSON.stringify(msg))
        this.promptUser()
      } else {
        console.log('Name cannot be empty. Please try again.')
        this.askForName()
      }
    })
  }

  private onMessage(data: string) {
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
    const msg = JSON.parse(data)
    if (isTextMessage(msg)) {
      console.log(
        TerminalWebSocketClient.OTHER_USER_COLOR + msg.msg + TerminalWebSocketClient.RESET
      )
    } else if (isModeMessage(msg)) {
      console.clear()
      console.log('new Game Mode: ' + msg.mode)
    }
    this.displayPrompt()
  }

  private displayPrompt() {
    process.stdout.write('> ')
  }

  private onClose() {
    console.log('Disconnected from the server')
    this.rl.close()
    process.exit(0)
  }

  private onError(error: Error) {
    console.error('WebSocket error:', error.message)
    this.rl.close()
    process.exit(1)
  }

  private promptUser() {
    this.displayPrompt()
    this.rl.once('line', message => {
      if (message.toLowerCase() === 'exit') {
        this.ws.close()
        return
      }
      this.sendMessage(message)
      this.promptUser() // Continue the message loop
    })
  }
  private sendMessage(message: string) {
    if (this.ws.readyState === WebSocket.OPEN) {
      let msg: TextMessage = {
        command: 'MSG',
        room: 'games',
        msg: message
      }
      this.ws.send(JSON.stringify(msg))
    } else {
      console.error('WebSocket is not open. Message not sent.')
      this.promptUser() // Try again
    }
  }
}
// Usage
new TerminalWebSocketClient('ws://172.21.213.199:8080')
