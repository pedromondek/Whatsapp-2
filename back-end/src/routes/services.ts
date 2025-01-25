import { Prisma, PrismaClient } from '@prisma/client';
import express from 'express';
import cors from 'cors';
import { IChangeUser, IUserBody } from './dto/services.dto';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.use(cors());
const upload = multer({ dest: './src/temp/' });

// const corsOptions = {
//   origin: 'http://localhost:3000',
//   methods: 'GET,POST,PUT,DELETE,OPTIONS',
//   allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept'
// };

export const servicesModule = (prisma: PrismaClient) => {
  // user
  // all users
  router.get('/users', async (req, res) => {
    const viewAllUsers = await prisma.user.findMany({ orderBy: { id: 'desc' } }).catch((error) => {
      throw new Error(`Users not found: ${error}`);
    });

    res.send(viewAllUsers);
  });

  // login get username & password
  router.post('/login', async (req, res) => {
    const body: IUserBody = req.body;
    const login = await prisma.user
      .findUniqueOrThrow({
        where: {
          username: body.username,
        },
        select: {
          id: true,
          username: true,
          password: true,
          chats: true,
          message: true,
          profileImage: false,
        },
      })
      .catch((error) => {
        console.error(error);
        res.status(400).send(`Usuário não existe`);
      });

    if (!login) {
      return;
    } else if (login?.password === body.password && login.username === body.username) {
      console.log('Login bem sucedido');
      res.send(login);
      return;
    } else if (body.username === login?.username && body.password != login?.password) {
      res.status(401).send(`Senha incorreta`);
      return;
    }
  });

  // user get by username
  router.get('/user/search', async (req, res) => {
    const { username } = req.query;

    const viewUsername = await prisma.user
      .findUnique({
        where: {
          username: String(username),
        },
        select: {
          username: true,
        },
      })
      .catch((error) => {
        throw new Error(`User not found: ${error}`);
      });
    res.send(viewUsername);
  });

  // user get photo
  router.get('/user/:id/photo', async (req, res) => {
    const id = req.params.id;

    const viewUserPhoto = await prisma.user
      .findUniqueOrThrow({
        where: {
          id: Number(id),
        },
        select: {
          profileImage: true,
        },
      })
      .catch((error) => {
        console.error(error);
        // res.status(400).send(`Usuário não existe`);
        return;
      });

    if (!viewUserPhoto || viewUserPhoto.profileImage === null) {
      res.send(null);
    } else {
      const base64Image = Buffer.from(viewUserPhoto.profileImage).toString('base64');
      res.json(base64Image);
    }

    // const image = viewUserPhoto.profileImage.toString('base64')
    // res.json(viewUserPhoto).toString('base64');
    // res.json.toString('base64');
    return;
  });

  // user get TRATAR ERRO
  router.get('/user/:id', async (req, res) => {
    const { id } = req.params;

    const viewUser = await prisma.user.findUniqueOrThrow({
      where: {
        id: +id,
      },
    });

    res.send(viewUser);
  });

  // user create
  router.post('/user', async (req, res) => {
    const body: IUserBody = req.body;
    try {
      const checkUsername = await prisma.user.findUnique({
        where: {
          username: body.username,
        },
      });

      if (checkUsername) {
        // console.log(`User already exist`);
        // res.send(`User already exist`);
        throw new Error(`User already exist`);
      }

      await prisma.user.create({
        data: {
          username: body.username,
          password: body.password,
        },
      });

      res.send('Conta criada com sucesso!');
    } catch (error) {
      // console.error(error);
      res.status(500).send(`${error}`);
    }
  });

  // user update username
  // router.put('/user/update/username', async (req, res) => {
  //   const { id } = req.query;
  //   const body: IChangeUser = req.body;

  //   await prisma.user
  //     .update({
  //       where: {
  //         id: Number(id),
  //       },
  //       data: {
  //         username: body.username,
  //         password: body.password,
  //       },
  //     })
  //     .catch((error) => {
  //       throw new Error(`Username update failed: ${error}`);
  //     });
  //   res.send(`Successful username update to: ` + req.body.username);
  // });

  // user update infos
  router.put('/user/update/:id', async (req, res) => {
    const { id } = req.params;
    let updateUser: Prisma.UserUpdateInput = {};
    const body: IChangeUser = req.body;

    if (body.password) updateUser.password = body.password;

    if (body.username) {
      updateUser.username = body.username;

      const checkUsername = await prisma.user.findUnique({
        where: {
          username: body.username,
        },
      });

      if (checkUsername) {
        res.status(400).send('Username já existe');
        return;
      }
    }
    // setTimeout(async () => {
    // const userUpdated = await prisma.user.findUnique({
    //   where: {
    //     id: Number(id),
    //   },
    // });
    res.send(`Atualização de usuário bem sucedida.`);
    // }, 1000);
  });

  // update user image profile
  router.put('/user/update-image/:id', upload.single('image'), async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
      res.status(400).send('Não foi enviado nenhum arquivo.');
      return;
    }

    const checkUser = await prisma.user
      .findUniqueOrThrow({
        where: {
          id: Number(id),
        },
      })
      .catch((error) => {
        res.status(error.status).send(`Update failed: ${error.message}`);
        return;
      });

    if (!checkUser) {
      res.status(400).send(`Usuário não existe`);
      return;
    }

    const fileBuffer = fs.readFileSync(req.file.path);

    await prisma.user
      .update({
        where: {
          id: checkUser.id,
        },
        data: {
          profileImage: fileBuffer,
        },
      })
      .catch((error) => {
        res.status(error.status).send(`Update failed: ${error.message}`);

        return;
      });
    fs.unlinkSync(req.file.path);
  });

  // user delete
  router.delete('/user/:id', async (req, res) => {
    const { id } = req.params;
    const deleteUser = await prisma.user
      .delete({
        where: {
          id: Number(id),
        },
      })
      .catch((error) => {
        res.status(error.status).send(`User delete failed: ${error}`);
        return;
      });
    res.send(`Conta deletada com sucesso. Você será redirecionado para a página inicial.`);
  });

  // chat
  // all chats
  router.get('/chats', async (req, res) => {
    const viewAllChats = await prisma.chat.findMany().catch((error) => {
      throw new Error(`Chats not found: ${error}`);
    });

    res.send(viewAllChats);
  });

  // chat get
  router.get('/chats/:id', async (req, res) => {
    const { id } = req.params;
    const viewChat = await prisma.chat.findUniqueOrThrow({
      where: { id: Number(id) },
    });

    res.send(viewChat);
  });

  // chat create
  router.post('/chat', async (req, res) => {
    await prisma.chat
      .create({
        data: {
          title: req.body.title,
        },
      })
      .catch((error) => {
        throw new Error(`Chat creation failed: ${error}`);
      });
    res.send('Successful creation of chat: ' + req.body.title);
  });

  // chat delete
  router.delete('/chat/:id', async (req, res) => {
    const { id } = req.params;
    const deleteChat = await prisma.chat
      .delete({
        where: {
          id: Number(id),
        },
      })
      .catch((error) => {
        throw new Error(`Chat delete failed: ${error}`);
      });
    res.send(deleteChat);
  });

  // chat update title
  router.put('/chats/:id', async (req, res) => {
    const { id } = req.params;

    await prisma.chat
      .update({
        where: {
          id: Number(id),
        },
        data: {
          title: req.body.title,
        },
      })
      .catch((error) => {
        throw new Error(`Chat update title failed: ${error}`);
      });
    res.send(`Successful title update to: ` + req.body.title);
  });

  // chat get by title
  router.get('/chat/search', async (req, res) => {
    const { title } = req.query;

    const viewTitle = await prisma.chat.findFirstOrThrow({
      where: {
        title: String(title),
      },
    });

    res.send(viewTitle);
  });

  return router;
};
