const express = require("express")
const http = require("http")
const socketIo = require("socket.io")
const cors = require("cors")

const app = express()
const server = http.createServer(app)

// Configure CORS for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

app.use(cors())
app.use(express.json())

// Store connected users and messages
const users = new Map()
let messages = []

io.on("connection", (socket) => {
  console.log("User connected:", socket.id)

  // Handle user joining
  socket.on("join", (userData) => {
    users.set(socket.id, {
      id: socket.id,
      username: userData.username,
      color: userData.color,
    })

    // Send current users list to all clients
    io.emit("users", Array.from(users.values()))

    // Send recent messages to the new user
    socket.emit("messages", messages.slice(-50)) // Send last 50 messages

    console.log(`${userData.username} joined the chat`)
  })

  // Handle new messages
  socket.on("message", (messageData) => {
    const user = users.get(socket.id)
    if (user) {
      const message = {
        id: Date.now().toString(),
        username: user.username,
        message: messageData.message,
        timestamp: new Date(),
        color: user.color,
      }

      messages.push(message)

      // Keep only last 100 messages in memory
      if (messages.length > 100) {
        messages = messages.slice(-100)
      }

      // Broadcast message to all connected clients
      io.emit("message", message)
    }
  })

  // Handle user disconnection
  socket.on("disconnect", () => {
    const user = users.get(socket.id)
    if (user) {
      console.log(`${user.username} left the chat`)
      users.delete(socket.id)

      // Update users list for all clients
      io.emit("users", Array.from(users.values()))
    }
  })
})

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`Hi.com Chat Server running on port ${PORT}`)
  console.log("WebSocket server ready for connections")
})
