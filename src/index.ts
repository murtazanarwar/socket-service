import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});
const nsp = io.of('/stock');

nsp.on('connection', socket => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.post('/emit-stock', (req, res) => {
  const { productId, newStock } = req.body as {
    productId: string;
    newStock: number;
  };
  console.log(`Registering POST /emit-stock route with productId ${productId} with new stock ${newStock}`);
  if (typeof productId !== 'string' || typeof newStock !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  nsp.emit('stockUpdate', { productId, newStock });
  console.log(`Emitted stockUpdate → ${productId} now ${newStock}`);
  res.sendStatus(204);
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`🔌 Socket-Service running at http://localhost:${PORT}`)
);
