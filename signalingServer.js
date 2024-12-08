import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"
import {dirname,join} from "path"
import { fileURLToPath } from "url"

const PORT = 3000
const app = express()
const server = createServer(app)
const io = new Server(server)
const appUsers = []

const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(express.static("public"))

app.get("/",(req,res)=>{
    const filePath = join(__dirname,"app/index.html")
    res.sendFile(filePath)
})

// This set express & socket.io to listen to same Port
server.listen(PORT,()=>{
    console.log(`Server is listening on PORT: ${PORT}`)
})

io.on('connection',(socket)=>{    
    socket.on("new-user",username => {
        console.log(`New User: ${username} joined the network with Socket ID: ${socket.id}`)
        appUsers.push({username,id:socket.id})
        // Everyone in the network is informed about new joined user
        io.emit("new-joined",appUsers)
    })

    socket.on("icecandidate", candidate => {
        console.log(`ICE Candidate Recevied: ${candidate}`)
        socket.broadcast.emit("icecandidate",candidate)
    })

    socket.on("offer",({from,to,offer})=>{
        console.log(`A Offer recevied from: ${from} to: ${to} offer: ${offer} sending to ID: ${getUser(to).id}`);
        io.to(getUser(to).id).emit("offer",{from,to,offer})
    })

    socket.on("answer",({from,to,answer})=>{
        console.log(`Answer Received From ${to}: ${answer}`);
        io.to(getUser(from).id).emit("answer",{from,to,answer})
    })

    socket.on("active-end-call",({to,from})=>{
        io.to(getUser(to).id).emit("active-end-call",{to,from})
        io.to(getUser(from).id).emit("active-end-call",{to,from})
    })

    socket.on("exit-call", caller => {
        const [to,from] = caller
        io.to(getUser(to).id).emit("exit-call")
        io.to(getUser(from).id).emit("exit-call")
    })
})


const getUser = (username) => {
   for(const user of appUsers){
        if(user.username == username) return user;
   }
   return {id:"NA"}
}



