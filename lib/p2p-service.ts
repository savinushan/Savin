"use client"

// Peer-to-Peer WebRTC Service for serverless messaging
export interface P2PMessage {
  id: string
  type: "message" | "contact-request" | "contact-accept" | "user-info" | "typing" | "read-receipt"
  sender: string
  senderName: string
  recipient?: string
  content: any
  timestamp: Date
}

export interface P2PUser {
  id: string
  name: string
  phone: string
  peerId: string
  online: boolean
  lastSeen: Date
}

export class P2PService {
  private peer: any = null
  private connections: Map<string, any> = new Map()
  private localUser: P2PUser | null = null
  private discoveredUsers: Map<string, P2PUser> = new Map()
  private messageCallbacks: ((message: P2PMessage) => void)[] = []
  private userUpdateCallbacks: ((users: P2PUser[]) => void)[] = []
  private connectionCallbacks: ((peerId: string, connected: boolean) => void)[] = []

  constructor() {
    // Initialize PeerJS for WebRTC connections
    this.initializePeer()
  }

  private async initializePeer() {
    try {
      // Import PeerJS dynamically (client-side only)
      const { Peer } = await import("peerjs")

      // Create peer with random ID
      this.peer = new Peer({
        host: "peerjs-server.herokuapp.com", // Free PeerJS server
        port: 443,
        secure: true,
        debug: 2,
      })

      this.peer.on("open", (id: string) => {
        console.log("P2P connection established with ID:", id)
        this.broadcastUserInfo()
      })

      this.peer.on("connection", (conn: any) => {
        this.handleIncomingConnection(conn)
      })

      this.peer.on("error", (error: any) => {
        console.error("P2P Error:", error)
      })
    } catch (error) {
      console.error("Failed to initialize P2P service:", error)
    }
  }

  // Set local user information
  setLocalUser(user: Omit<P2PUser, "peerId" | "online" | "lastSeen">) {
    if (!this.peer?.id) return

    this.localUser = {
      ...user,
      peerId: this.peer.id,
      online: true,
      lastSeen: new Date(),
    }

    // Store in localStorage for persistence
    localStorage.setItem("p2p-user", JSON.stringify(this.localUser))

    // Broadcast to network
    this.broadcastUserInfo()
  }

  // Connect to another peer
  async connectToPeer(peerId: string): Promise<boolean> {
    if (!this.peer || this.connections.has(peerId)) return false

    try {
      const conn = this.peer.connect(peerId, {
        reliable: true,
        serialization: "json",
      })

      return new Promise((resolve) => {
        conn.on("open", () => {
          this.handleConnection(conn)
          resolve(true)
        })

        conn.on("error", () => {
          resolve(false)
        })

        // Timeout after 10 seconds
        setTimeout(() => resolve(false), 10000)
      })
    } catch (error) {
      console.error("Failed to connect to peer:", error)
      return false
    }
  }

  // Handle incoming connections
  private handleIncomingConnection(conn: any) {
    conn.on("open", () => {
      this.handleConnection(conn)
    })
  }

  // Handle established connection
  private handleConnection(conn: any) {
    const peerId = conn.peer
    this.connections.set(peerId, conn)

    console.log("Connected to peer:", peerId)
    this.connectionCallbacks.forEach((cb) => cb(peerId, true))

    // Send our user info
    if (this.localUser) {
      this.sendToPeer(peerId, {
        id: Date.now().toString(),
        type: "user-info",
        sender: this.localUser.id,
        senderName: this.localUser.name,
        content: this.localUser,
        timestamp: new Date(),
      })
    }

    // Handle incoming messages
    conn.on("data", (data: P2PMessage) => {
      this.handleMessage(data)
    })

    // Handle disconnection
    conn.on("close", () => {
      this.connections.delete(peerId)
      this.connectionCallbacks.forEach((cb) => cb(peerId, false))
      console.log("Disconnected from peer:", peerId)
    })

    conn.on("error", (error: any) => {
      console.error("Connection error:", error)
      this.connections.delete(peerId)
      this.connectionCallbacks.forEach((cb) => cb(peerId, false))
    })
  }

  // Send message to specific peer
  private sendToPeer(peerId: string, message: P2PMessage) {
    const conn = this.connections.get(peerId)
    if (conn && conn.open) {
      try {
        conn.send(message)
        return true
      } catch (error) {
        console.error("Failed to send message to peer:", error)
        return false
      }
    }
    return false
  }

  // Broadcast message to all connected peers
  private broadcast(message: P2PMessage) {
    let sent = 0
    this.connections.forEach((conn, peerId) => {
      if (this.sendToPeer(peerId, message)) {
        sent++
      }
    })
    return sent
  }

  // Send chat message
  sendMessage(recipientId: string, content: string): boolean {
    if (!this.localUser) return false

    const message: P2PMessage = {
      id: Date.now().toString(),
      type: "message",
      sender: this.localUser.id,
      senderName: this.localUser.name,
      recipient: recipientId,
      content: { text: content },
      timestamp: new Date(),
    }

    // Find recipient's peer ID
    const recipient = this.discoveredUsers.get(recipientId)
    if (!recipient) return false

    return this.sendToPeer(recipient.peerId, message)
  }

  // Send contact request
  sendContactRequest(recipientId: string): boolean {
    if (!this.localUser) return false

    const message: P2PMessage = {
      id: Date.now().toString(),
      type: "contact-request",
      sender: this.localUser.id,
      senderName: this.localUser.name,
      recipient: recipientId,
      content: { userInfo: this.localUser },
      timestamp: new Date(),
    }

    const recipient = this.discoveredUsers.get(recipientId)
    if (!recipient) return false

    return this.sendToPeer(recipient.peerId, message)
  }

  // Accept contact request
  acceptContactRequest(requesterId: string): boolean {
    if (!this.localUser) return false

    const message: P2PMessage = {
      id: Date.now().toString(),
      type: "contact-accept",
      sender: this.localUser.id,
      senderName: this.localUser.name,
      recipient: requesterId,
      content: { userInfo: this.localUser },
      timestamp: new Date(),
    }

    const requester = this.discoveredUsers.get(requesterId)
    if (!requester) return false

    return this.sendToPeer(requester.peerId, message)
  }

  // Broadcast user info to discover other users
  private broadcastUserInfo() {
    if (!this.localUser) return

    const message: P2PMessage = {
      id: Date.now().toString(),
      type: "user-info",
      sender: this.localUser.id,
      senderName: this.localUser.name,
      content: this.localUser,
      timestamp: new Date(),
    }

    this.broadcast(message)
  }

  // Handle incoming messages
  private handleMessage(message: P2PMessage) {
    switch (message.type) {
      case "user-info":
        this.handleUserInfo(message.content as P2PUser)
        break

      case "message":
      case "contact-request":
      case "contact-accept":
      case "typing":
      case "read-receipt":
        this.messageCallbacks.forEach((cb) => cb(message))
        break
    }
  }

  // Handle user info updates
  private handleUserInfo(user: P2PUser) {
    this.discoveredUsers.set(user.id, user)
    this.userUpdateCallbacks.forEach((cb) => cb(Array.from(this.discoveredUsers.values())))
  }

  // Get discovered users
  getDiscoveredUsers(): P2PUser[] {
    return Array.from(this.discoveredUsers.values())
  }

  // Get connected peers
  getConnectedPeers(): string[] {
    return Array.from(this.connections.keys())
  }

  // Subscribe to messages
  onMessage(callback: (message: P2PMessage) => void) {
    this.messageCallbacks.push(callback)
  }

  // Subscribe to user updates
  onUserUpdate(callback: (users: P2PUser[]) => void) {
    this.userUpdateCallbacks.push(callback)
  }

  // Subscribe to connection updates
  onConnectionUpdate(callback: (peerId: string, connected: boolean) => void) {
    this.connectionCallbacks.push(callback)
  }

  // Disconnect from all peers
  disconnect() {
    this.connections.forEach((conn) => {
      try {
        conn.close()
      } catch (error) {
        console.error("Error closing connection:", error)
      }
    })
    this.connections.clear()

    if (this.peer) {
      this.peer.destroy()
      this.peer = null
    }
  }

  // Get local peer ID for sharing
  getPeerId(): string | null {
    return this.peer?.id || null
  }

  // Connect using QR code or shared peer ID
  async connectViaPeerId(peerId: string): Promise<boolean> {
    return this.connectToPeer(peerId)
  }
}
