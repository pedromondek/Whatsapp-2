import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import http from 'http';
import * as services from './routes/http/controller.controller.js';
import * as socket from './routes/sockets/ws.js';

dotenv.config();
const app = express();
export const prisma = new PrismaClient();

app.use(express.json());

const wsServer = http.createServer(app);

app.use('/services', services.servicesModule(prisma));

const io = socket.wsModule(wsServer, prisma);
const PORT_WS = Number(process.env.PORT_WS) ?? 8888;

io.listen(PORT_WS);

const PORT = process.env.PORT_APP ?? 9000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});
