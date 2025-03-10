import { Prisma, PrismaClient } from '@prisma/client';
import express, { response } from 'express';
import cors from 'cors';
import { IChangeUser, IResponseUserSearch, ISearchUser, IUserBody } from './dto/controller.dto';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { HttpMethods } from './http.services';
// import { toZonedTime, format } from 'date-fns-tz';

const router = express.Router();

router.use(cors());
const upload = multer({ dest: './src/temp/' });

export const servicesModule = (prisma: PrismaClient) => {
  const servicesMethods = new HttpMethods(prisma);

  // user
  // all users
  router.get('/users', async (req, res) => {
    res.send(await servicesMethods.getUsers());
  });

  // login get username & password
  router.post('/login', async (req, res) => {
    const body: IUserBody = req.body;

    try {
      res.send(await servicesMethods.getLogin(body));
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      } else {
        res.status(400).send('Ocorreu um erro desconhecido.');
      }
    }
  });

  // user get by username
  router.get('/user/search', async (req, res) => {
    const { username, page, pageSize } = req.query;

    if (!username) {
      res.status(400).send('Pesquisa Inválida: Usuário indefinido.');
      return;
    }

    const searchUser: ISearchUser = {
      username: String(username),
      page: Number(page ?? 0),
      pageSize: Number(pageSize ?? 6),
    };

    try {
      const result = await servicesMethods.getUserByUsername(searchUser);
      if (result) {
        res.json(result);
      } else {
        res.status(404).send('Usuário não encontrado.');
      }
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Erro desconhecido.' });
      }
    }
  });

  // user get photo
  router.get('/user/:id/photo', async (req, res) => {
    const id = req.params.id;

    try {
      const userId = Number(id);
      if (isNaN(userId)) {
        res.status(500).send('ID de usuário inválido: Não é um número.');
        return;
      }

      const base64Image = await servicesMethods.getUserPhoto(userId);

      if (base64Image || base64Image === null) {
        res.json(base64Image);
      } else {
        res.status(404).send('Foto não encontrada.');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao obter foto do usuário: ', error);
        res.status(500).send(`Erro ao obter foto do usuário: ${error.message}`);
      }
    }
  });

  // user get by id
  router.get('/user/:id', async (req, res) => {
    const { id } = req.params;

    const userId = Number(id);
    if (isNaN(userId)) {
      res.status(500).send('ID de usuário inválido: Não é um número.');
      return;
    }

    try {
      const viewUser = await servicesMethods.getUserById(userId);
      res.send(viewUser);
      return;
    } catch (error) {
      if (error instanceof Error) {
        console.error('Erro ao encontrar o usuário: ', error);
        res.status(404).send(`Erro ao encontrar o usuário: ${error.message}`);
      }
    }
  });

  // user create
  router.post('/user', async (req, res) => {
    const body: IUserBody = req.body;
    try {
      await servicesMethods.createUser(body);

      console.log('Conta criada com sucesso!');
      res.send('Conta criada com sucesso!');
    } catch (error) {
      if (error instanceof Error) {
        res.status(500).send(error.message);
      }
    }
  });

  // user update infos
  router.put('/user/update/:id', async (req, res) => {
    const { id } = req.params;
    const userId = Number(id);

    if (isNaN(userId)) {
      res.status(500).send('ID de usuário inválido: Não é um número.');
      return;
    }

    const body: IChangeUser = req.body;

    try {
      await servicesMethods.updateUser(userId, body);

      res.send(`Atualização de usuário bem sucedida.`);
      return;
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).send(error.message);
      }
    }
  });

  // update user image profile
  router.put('/user/update-image/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;

    const userId = Number(id);

    if (isNaN(userId)) {
      res.status(500).send('ID de usuário inválido: Não é um número.');
      return;
    }

    if (!req.file) {
      res.status(400).send('Não foi enviado nenhum arquivo.');
      return;
    }

    try {
      const fileBuffer = fs.readFileSync(req.file.path);

      await servicesMethods.updateUserPhoto(userId, fileBuffer);

      res.send('Foto de perfil atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar a foto de perfil do usuário: ', error.message);
      res.status(error.status).send(error.message);
    } finally {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) {
            console.error('Erro ao deletar o arquivo temporário:', err);
          }
        });
      }
    }
  });

  // user delete
  router.delete('/user/:id', async (req, res) => {
    const { id } = req.params;

    const userId = Number(id);

    if (isNaN(userId)) {
      res.status(500).send('ID de usuário inválido: Não é um número.');
      return;
    }

    await servicesMethods.deleteUser(userId).catch((error) => {
      console.error(error);
      res.status(error.status).send(`User delete failed:  ${error.message}`);
    });

    res.send(`Conta deletada com sucesso. Você será redirecionado para a página inicial.`);
  });

  // chat
  // all chats get
  router.get('/chats', async (req, res) => {
    res.send(
      await servicesMethods.getChats().catch((error) => {
        res.status(error.status).send(error.message);
      }),
    );
  });

  // all chats with user get
  router.get('/chats/user/:id', async (req, res) => {
    const { id } = req.params;

    const userId = Number(id);

    if (isNaN(userId)) {
      res.status(500).send('ID de usuário inválido: Não é um número.');
      return;
    }

    try {
      res.send(await servicesMethods.getUserChats(userId));
    } catch (error) {
      res.status(error.status).send(error.message);
    }
  });

  // chat get by id
  router.get('/chats/:id', async (req, res) => {
    const { id } = req.params;

    const chatId = Number(id);

    if (isNaN(chatId)) {
      res.status(500).send('ID do chat inválido: Não é um número.');
      return;
    }

    res.send(
      await servicesMethods.getChatById(chatId).catch((error) => {
        console.error(error);
        res.status(error.status).send(`Não foi possível encontrar o chat: ${error.message}`);
      }),
    );
  });

  // chat create
  router.post('/chat', async (req, res) => {
    const { userIdSent, userIdReceived } = req.body;

    if (isNaN(Number(userIdSent)) || isNaN(Number(userIdReceived))) {
      res.status(500).send('ID inválido: Não é um número.');
      return;
    }

    const chatCreated = await servicesMethods.createChat(Number(userIdSent), Number(userIdReceived)).catch((error) => {
      console.error(error);
      res.status(error.status).send(`Falha ao criar chat: ${error.message}`);
    });

    res.json(chatCreated);
  });

  // chat delete
  router.delete('/chat/:id', async (req, res) => {
    const { id } = req.params;

    const chatId = Number(id);

    if (isNaN(chatId)) {
      res.status(500).send('ID do chat inválido: Não é um número.');
      return;
    }

    await servicesMethods.deleteChat(chatId).catch((error) => {
      console.error(error);
      res.status(error.status).send(`Falha ao deletar o chat: ${error.message}`);
    });

    res.send('Chat deletado com sucesso!');
  });

  // chat update title NÃO ESTÁ FEITO, IDEIA PARA GRUPO
  router.put('/chats/:id', async (req, res) => {
    const { id } = req.params;

    await prisma.chat
      .update({
        where: {
          id: Number(id),
        },
        data: {
          // title: req.body.title,
        },
      })
      .catch((error) => {
        throw new Error(`Chat update title failed: ${error}`);
      });
    res.send(`Successful title update to: ` + req.body.title);
  });

  // chat get by title NÃO ESTÁ FEITO
  router.get('/chat/search', async (req, res) => {
    const { title } = req.query;

    const viewTitle = await prisma.chat.findFirstOrThrow({
      where: {
        // title: String(title),
      },
    });

    res.send(viewTitle);
  });

  // message
  // create message
  router.post('/message', async (req, res) => {
    const { userId, chatId, content } = req.body;

    const idUser = Number(userId);
    const idChat = Number(chatId);

    if (isNaN(idChat)) {
      res.status(500).send('ID do Chat inválido: Não é um número.');
      return;
    }

    if (isNaN(idUser)) {
      res.status(500).send('ID do usuário inválido: Não é um número.');
      return;
    }

    const timestampUtc = new Date();

    try {
      res.send(await servicesMethods.createMessage(idUser, idChat, String(content), timestampUtc));
    } catch (error) {
      console.error(error);
      res.status(error.status).send(error.message);
    }
  });

  return router;
};
