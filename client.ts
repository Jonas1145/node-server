import WebSocket from 'ws'
import readline from 'readline'

class TerminalWebSocketClient {
  private ws: WebSocket
  private rl: readline.Interface

  constructor(url: string) {
    this.ws = new WebSocket(url)
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
    this.promptUser()
  }

  private onMessage(data: WebSocket.RawData) {
    console.log('\nReceived:', data.toString())
    this.promptUser()
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
    this.rl.question('Enter a message (or "exit" to quit): ', message => {
      if (message.toLowerCase() === 'exit') {
        this.ws.close()
        return
      }
      this.sendMessage(message)
    })
  }

  private sendMessage(message: string) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(message)
    } else {
      console.error('WebSocket is not open. Message not sent.')
      this.promptUser()
    }
  }
}

// Usage
const client = new TerminalWebSocketClient('ws://localhost:8080')
