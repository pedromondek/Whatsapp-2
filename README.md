<p id="top">

# WhatsApp 2 (Work In Progress)

<img src="https://img.shields.io/badge/Project%20Status-In%20Development-yellow" alt="Project Status">
<!-- <img src="https://img.shields.io/badge/Project%20Status-Finished-brightgreen" alt="Project Status"> -->
</p>

----------

> [!NOTE]
> Caso tenha preferência de ler este documento em "PT-BR <img style="width:13px" src="https://em-content.zobj.net/source/google/387/flag-brazil_1f1e7-1f1f7.png"/>", sinta-se livre para ler **[aqui (LEIAME.md)](LEIAME.md)**

> [!WARNING]
> Please remember that the site is **under development**, so there may be *errors, bugs, issues and imperfections*, be sure to check out the roadmap for more information

<br>

In my portfolio you will find a collection of my projects, skills and a little bit about me. This portfolio was created by me, to showcase my work and progress as a developer.

<br>

<summary>Details:</summary>
  <ol>
    <li><a href="#✨-Features">✨ Features</a></li>
    <ul>
        <li><a href="#Preview-🎞️"> Preview 🎞️</a></li>
        <li><a href="#Built-With-🔨"> Built With 🔨</a></li>
    </ul>
    <li><a href="#🚧-Roadmap">🚧 Roadmap</a></li>
    <li><a href="#💻-Contact">💻 Contact</a></li>
  </ol>

<br>

----------

<br>

# ✨ Features 

### Home Page / Login & Sign Up Page
- When we initially enter the website, we have a welcome page followed by a small login or registration inputs.

<br>

### Landing Page
- When you log in, on the right-hand side, you'll find instructions on how to start a new or previously created chat. 
- And on the left-hand side, you'll find the user's initiated chats, updated in real time.

<br>

### Change your Account (Username, Password & Profile Image) / Delete Account
- In the upper left corner, you'll find the user's profile, which can be accessed to access account change options, such as username, password, and profile picture.
- This also provides access to the option to delete your account.

<br>

### Search User
- By following the steps to start a conversation, the user is taken to a user search area by Username, where they can find other users and start a conversation. 
- The conversation only starts when the user sends the message; if they don't, the chat between users isn't created.

<br>

### Chatting
- Once a conversation is created, both users can communicate in real time within the same chat.
- Notifications are also tracked, so if a user logs out or leaves the site, they can receive their unread messages when they visit the site again.
- Users can also see each other's status (online/offline).
- If a conversation is deleted by one of the participants, the chat ends. 
- The user's chat status will change to "Conversation Closed by ${username}" and will be available to the other user only in view mode. This will require a new chat.
- The same occurs when a user deletes their own account, with the difference being that the status message indicates that the user has deleted their account.
Each user can only have one active chat per user.

<br>

## Preview 🎞️
https://github.com/user-attachments/assets/5c603ec3-a83e-4772-b23e-03c7eabae262

<br>

## Built With 🔨

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
> This roadmap does not necessarily represent its final form, and items may be removed or added over time.

>[!TIP]
> The phase and task that is currently being developed will be highlighted and marked with a 🚧

This roadmap provides a general (not detailed) overview of the planned steps and important milestones for the development of the project. In theory, development will be carried out in the order of this list, with the animations always being the last things to be developed.

Below you will find the main phases of the project along with the tasks:

- [x] Home Page
  - [x] Structure
    - [x] Illustrative Image with tutorial
    - [x] Login
    - [x] Sign up
    - [ ] Switch to change language *(maybe)*
- [x] Landing Page
  - [x] Structure
    - [x] Main Structure
    - [x] Tutorial
    - [x] Chats working in real time
    - [ ] Switch to change language *(maybe)*
- [x] Change Account / Delete
  - [x] Structure
    - [x] Change profile image
    - [x] Change username
    - [x] Change password
    - [x] Change both (username and password) at the same time
    - [x] Delete account
    - [ ] Switch to change language *(maybe)*
  - [x] Animations
- [ ] Search User
  - [ ] Structure
    - [x] Search User input
    - [ ] Search messages
    - [x] Search results work perfectly
    - [x] Pagination
    - [x] "Start" chatting
    - [ ] Switch to change language *(maybe)*
  - [ ] Animations
- [ ] **Chatting with a user <u>*(under construction* 🚧 *)*</u>**
  - [ ] Structure
    - [x] Chat starts when user send your first message
    - [x] Messages timestamp
    - [x] Chatting in real time
    - [x] User status in real time
    - [x] Notifications
    - [ ] Reading messages <u>*(under construction* 🚧 *)*</u>
    - [ ] Search messages
    - [ ] Delete messages
    - [ ] Forward messages
    - [ ] Upload image to chat
    - [x] Delete Chat
    - [ ] Forward User
    - [ ] Switch to change language *(maybe)*
  - [x] Animations
- [ ] Group Chat
  - [ ] Structure
    - [ ] Create group chat
    - [ ] Add group member
    - [ ] Remove group member
    - [ ] Group Permissions
    - [ ] Edit Group
    - [ ] Chat starts when user send your first message
    - [ ] Messages timestamp
    - [ ] Chatting in real time
    - [ ] Notifications
    - [ ] Reading messages
    - [ ] Search messages
    - [ ] Delete messages
    - [ ] Forward messages
    - [ ] Upload image to group
    - [ ] Delete Group
    - [ ] Forward Group Url
    - [ ] Switch to change language *(maybe)*
  - [x] Animations
- [ ] English Translation
  - [ ] Home Page
  - [ ] Landing Page
  - [ ] Change Account / Delete Account
  - [ ] Search User
  - [ ] Chatting with a User
  - [ ] Group Chat
- [ ] Review code and remove junk code
- [ ] Responsive website
  - [ ] Other desktop screens (not 1920x1080)
  - [ ] Mobile

See the [open issues](https://github.com/pedromondek/Whatsapp-2/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#top">back to top</a>)</p>

# 💻 Contact

### I hope you enjoyed it and if you want to contact me, you can do so through the following ways:

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
> If you have found any bugs or issues, please do not hesitate to report it to me, you can do so either through [github](https://github.com/pedromondek/Whatsapp-2/issues) or through the contact methods above, I will be very grateful, as I am for your visit!

<p align="right">(<a href="#top">back to top</a>)</p>
