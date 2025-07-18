<p id="top">

# WhatsApp 2 (Em Desenvolvimento)

<img src="https://img.shields.io/badge/Project%20Status-In%20Development-yellow" alt="Project Status">
<!-- <img src="https://img.shields.io/badge/Project%20Status-Finished-brightgreen" alt="Project Status"> -->
</p>

----------

> [!NOTE]
> If you prefer to read this document in "EN-US <img style="width:13px" src="https://em-content.zobj.net/source/google/387/flag-united-states_1f1fa-1f1f8.png"/>", feel free to read it in **[here (README.md)](README.md)**

> [!WARNING]
> Por favor, lembre-se de que o site está **em desenvolvimento**, então pode haver *erros, bugs, problemas e imperfeições*, não deixe de conferir o roadmap para mais informações.

<br>

In my portfolio you will find a collection of my projects, skills and a little bit about me. This portfolio was created by me, to showcase my work and progress as a developer.

<br>

<summary>Detalhes:</summary>
  <ol>
    <li><a href="#✨-Features">✨ Features</a></li>
    <ul>
        <li><a href="#Preview-🎞️"> Preview 🎞️</a></li>
        <li><a href="#Construido-Com-🔨"> Construido Com 🔨</a></li>
    </ul>
    <li><a href="#🚧-Roadmap">🚧 Roadmap</a></li>
    <li><a href="#💻-Contato">💻 Contato</a></li>
  </ol>

<br>

----------

<br>

# ✨ Features 

### Página Inicial / Login & Cadastro de Conta 
- Ao entrarmos no site inicialmente somos recebidos por uma imagem de boas vindas seguida de uma pequena tela de login ou cadastro.

<br>

### Página de Destino
- Ao efetuar login, há do lado direito algumas instruções de como iniciar um chat novo ou já criado. 
- E ao lado esquerdo há os chats iniciados do usuário, devidamente atualizados em tempo real.

<br>

### Alterar Conta (nome de usuário, senha & foto de perfil) / Deletar Conta
- No campo superior esquerdo temos o perfil do usuário no qual ele pode interagir para abrir uma área de opções de mudanças na conta, como: username, senha e foto de perfil. 
- Dando acesso também a opção de deletar sua conta.

<br>

### Procurar Usuário
- Ao seguir as etapas de iniciar uma conversa, o usuário é levado para uma área de pesquisa de usuários por Username, onde é possível encontrar outros usuários e iniciar uma conversa. 
- A conversa de fato é iniciada apenas quando o usuário envia a mensagem, caso não o faça então o chat entre os usuários não é criado.

<br>

### Bate-Papo
- Com uma conversa criada ambos os usuários conseguem se comunicar em tempo real neste mesmo chat.
- Também é contabilizado o número de notificações, portanto caso o usuário deslogue ou saia do site, ele poderá receber suas mensagens não lidas ao visitar o site novamente.
- Os usuários também conseguem ver o status (online/offline) um do outro.
- Se a conversa for deletada por um dos participantes o chat se encerra, o status do usuário no chat ficará como `Conversa Encerrada pelo ${username}` e está disponível para o outro usuário apenas em modo de visualização, sem conseguir enviar novas mensagens, para isso será necessário um novo chat.
- O mesmo ocorre quando um usuário deleta sua própria conta com a diferença da mensagem do status que demonstra que o usuário deletou sua própria conta.
- Cada usuário só pode ter um único chat ativo por usuário.

<br>

## Preview 🎞️
<video src="https://github.com/user-attachments/assets/5c603ec3-a83e-4772-b23e-03c7eabae262" controls></video>

<br>

## Construido Com 🔨

* ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
* ![CSS](https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white)
* ![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
* ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
* ![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
* ![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
* ![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)


<p align="right">(<a href="#top">back to top</a>)</p>

# 🚧 Roadmap

>[!NOTE]
> Este roadmap não representa necessariamente sua forma final, e itens podem ser removidos ou adicionados ao longo do tempo.

>[!TIP]
> A fase e a tarefa que estão sendo desenvolvidas no momento serão destacadas e marcadas com um 🚧

Este roadmap fornece uma visão geral (não detalhada) das etapas planejadas e marcos importantes para o desenvolvimento do projeto. Em teoria, o desenvolvimento será realizado na ordem desta lista, com as animações sempre sendo as últimas coisas a serem desenvolvidas.

Abaixo você encontrará as principais fases do projeto juntamente com as tarefas:

- [x] Página Inicial
  - [x] Estrutura
    - [x] Imagem Ilustrativa com tutorial
    - [x] Login
    - [x] Cadastro de Conta
    - [ ] Alterar idioma *(maybe)*
- [x] Landing Page
  - [x] Estrutura
    - [x] Estrutura Principal
    - [x] Tutorial
    - [x] Conversas funcionando em tempo real
    - [ ] Alterar idioma *(maybe)*
- [x] Change Account / Delete
  - [x] Estrutura
    - [x] Alterar foto de perfil
    - [x] Alterar nome de usuário
    - [x] Alterar senha
    - [x] Alterar ambos (nome de usuário e senha) ao mesmo tempo
    - [x] Deletar conta
    - [ ] Alterar idioma *(maybe)*
  - [x] Animações
- [ ] Procurar Usuário
  - [ ] Estrutura
    - [x] Campo de pesquisa de usuário
    - [ ] Procurar mensagens
    - [x] Pesquisa de usuário funciona perfeitamente
    - [x] Paginação
    - [x] "Começar" conversa
    - [ ] Alterar idioma *(maybe)*
  - [ ] Animações
- [ ] **Bate-Papo com um usuário <u>*(em construção* 🚧 *)*</u>**
  - [ ] Estrutura
    - [x] Conversa começa quando usuário envia sua primeira mensagem
    - [x] Marcação de data e horário nas mensagens
    - [x] Conversar em tempo real
    - [x] Status do usuário em tempo real
    - [x] Notificações
    - [ ] Lendo mensagens <u>*(em construção* 🚧 *)*</u>
    - [ ] Pesquisar mensagens
    - [ ] Deletar mensagens
    - [ ] Encaminhar mensagens
    - [ ] Fazer upload de imagem na conversa
    - [x] Deletar Conversa
    - [ ] Encaminhar usuário
    - [ ] Alterar idioma *(maybe)*
  - [x] Animações
- [ ] Group Chat
  - [ ] Estrutura
    - [ ] Criar grupo
    - [ ] Adicionar membro ao grupo
    - [ ] Remover membro do grupo
    - [ ] Permissões de grupo
    - [ ] Editar Grupo
    - [ ] Conversa começa quando usuário envia sua primeira mensagem
    - [ ] Marcação de data e horário nas mensagens
    - [ ] Conversar em tempo real
    - [ ] Notificações
    - [ ] Lendo mensagens
    - [ ] Pesquisar mensagens
    - [ ] Deletar mensagens
    - [ ] Encaminhar mensagens
    - [ ] Fazer upload de imagem no grupo
    - [ ] Deletar Grupo
    - [ ] Encaminhar link de Grupo
    - [ ] Alterar idioma *(maybe)*
  - [x] Animações
- [ ] Tradução para Inglês
  - [ ] Página Inicial
  - [ ] Página de Destino
  - [ ] Alterar Conta / Deletar Conta
  - [ ] Procurar Usuário
  - [ ] Conversar com um usuário
  - [ ] Chat de Grupo
- [ ] Revisar código e remover código inútil
- [ ] Site Responsivo
  - [ ] Outras telas desktop (diferente de 1920x1080)
  - [ ] Mobile

Veja [abrir issues](https://github.com/pedromondek/Whatsapp-2/issues) para uma lista completa de recursos propostos (e problemas conhecidos).

<p align="right">(<a href="#top">volte ao topo</a>)</p>

# 💻 Contato

### Espero que tenha gostado e caso queira entrar em contato comigo, pode fazê-lo através dos seguintes meios:

<br>

<a href="https://www.linkedin.com/in/pedromondek">
  <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
</a>

<a href="mailto:phmondek@gmail.com">
  <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Gmail">
</a>

<br>

<br>

> [!IMPORTANT]
> Se você encontrou algum bug ou problema, porfavor não hesite em me relatar, você pode fazer isso por meio do [github](https://github.com/pedromondek/Whatsapp-2/issues) ou através dos meios de contato acima, ficarei muito grato, assim como estou pela sua visita!

<p align="right">(<a href="#top">volte ao topo</a>)</p>
