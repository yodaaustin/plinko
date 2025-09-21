import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(cors());
app.get('/', (req,res)=>res.send('Plinko Duel Server running.'));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*' }
});

const rooms = new Map();

io.on('connection', (socket)=>{
  socket.on('join', ({room})=>{
    if (!room) return;
    socket.join(room);
    const set = rooms.get(room) || new Set();
    set.add(socket.id);
    rooms.set(room,set);
    io.to(room).emit('joined', {count:set.size});
    io.to(room).emit('count', {count:set.size});
    socket.data.room = room;
  });

  socket.on('drop', (data)=>{
    const room = socket.data.room;
    if (!room) return;
    // broadcast to others
    socket.to(room).emit('drop', data);
  });

  socket.on('disconnect', ()=>{
    const room = socket.data.room;
    if (!room) return;
    const set = rooms.get(room);
    if (set){ set.delete(socket.id); if (set.size===0) rooms.delete(room); }
    io.to(room).emit('count', {count: set? set.size: 0});
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, ()=>console.log('Duel server on', PORT));
