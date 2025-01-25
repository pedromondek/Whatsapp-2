import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import express from 'express';
import http from 'http';
import * as services from './routes/services.js';
import * as socket from './routes/ws.js';

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const wsServer = http.createServer(app);

app.use('/services', services.servicesModule(prisma));
socket.wsModule(wsServer);

const PORT = process.env.PORT_WS ?? 9000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta: ${PORT}`);
});
