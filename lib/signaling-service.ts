// This is a simplified signaling service for demonstration
// In a real app, you would use WebSockets or a similar technology

export type SignalingMessage = {
  type: "offer" | "answer" | "ice-candidate" | "call-request" | "call-accepted" | "call-rejected" | "call-ended"
  sender: string
  recipient: string
  payload: any
}

export class SignalingService {
  private callbacks: {
    onMessage?: (message: SignalingMessage) => void
    onConnectionStateChange?: (state: "connected" | "disconnected") => void
  } = {}

  // Simulate connection to signaling server
  connect(userId: string): Promise<void> {
    console.log(`Connecting to signaling server as ${userId}...`)

    // Simulate successful connection after a delay
    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.callbacks.onConnectionStateChange) {
          this.callbacks.onConnectionStateChange("connected")
        }
        resolve()
      }, 1000)
    })
  }

  // Send a message through the signaling server
  sendMessage(message: SignalingMessage): void {
    console.log("Sending message:", message)

    // In a real app, this would send the message to the signaling server
    // For demo purposes, we'll simulate receiving the message after a delay
    if (message.type === "call-request") {
      // Simulate the recipient accepting the call
      setTimeout(() => {
        if (this.callbacks.onMessage) {
          this.callbacks.onMessage({
            type: "call-accepted",
            sender: message.recipient,
            recipient: message.sender,
            payload: {
              callType: message.payload.callType,
            },
          })
        }
      }, 2000)
    } else if (message.type === "offer") {
      // Simulate receiving an answer
      setTimeout(() => {
        if (this.callbacks.onMessage) {
          this.callbacks.onMessage({
            type: "answer",
            sender: message.recipient,
            recipient: message.sender,
            payload: {
              sdp: "simulated-sdp-answer",
              type: "answer",
            },
          })
        }
      }, 1000)
    }
  }

  // Set callback for incoming messages
  onMessage(callback: (message: SignalingMessage) => void): void {
    this.callbacks.onMessage = callback
  }

  // Set callback for connection state changes
  onConnectionStateChange(callback: (state: "connected" | "disconnected") => void): void {
    this.callbacks.onConnectionStateChange = callback
  }

  // Disconnect from signaling server
  disconnect(): void {
    console.log("Disconnecting from signaling server...")

    if (this.callbacks.onConnectionStateChange) {
      this.callbacks.onConnectionStateChange("disconnected")
    }
  }
}
