import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import http from 'http';
import * as services from './routes/http/controller.controller.js';
import { WebSocketService } from './routes/sockets/ws.js';
import cors from 'cors';

dotenv.config();
const app = express();
export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

const wsServer = http.createServer(app);

app.use('/services', services.servicesModule(prisma));

const webSocketService = new WebSocketService(wsServer, prisma);
const PORT_WS = Number(process.env.PORT_WS) ?? 8888;

wsServer.listen(PORT_WS, () => {
  console.log(`Servidor WebSocket rodando na porta: ${PORT_WS}`);
});

const PORT = process.env.PORT_APP ?? 9000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});
