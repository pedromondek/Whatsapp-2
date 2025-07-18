import logo from "./logo.svg";
import React, { useState, useEffect, useRef, useMemo } from "react";
import axios, { all } from "axios";
// import path from "path-browserify";
// import fs from "fs";
import imageCompression from "browser-image-compression";
import { toZonedTime, format } from "date-fns-tz";
import { differenceInDays } from "date-fns";
// import { io } from "socket.io-client";
import { socket } from "./socket";
// import { connectWs } from "../../back-end/src/routes/ws";
import "./App.css";
// import { User } from "./dto/frontend.dto";

function App() {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [isSignInAccountPage, setIsSignInAccountPage] = useState(false);
  const [isChattingPage, setIsChattingPage] = useState(false);

  const [user, setUser] = useState(null);

  useEffect(() => {
    let storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoginPage(false);
      setIsChattingPage(true);
    }
  }, []);

  useEffect(() => {
    // socket.connect();

    const onConnect = () => {
      if (user) {
        socket.emit("registerConnection", { userId: user.id });
      }
      // setIsConnected(true);
    };

    const onDisconnect = () => {
      if (user) {
        socket.emit("registerDisconnect", { userId: user.id });
      }
      // setIsConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, [user, isLoginPage, isChattingPage]);

  const handleCreateAccountPageClick = () => {
    setIsLoginPage(false);
    setIsSignInAccountPage(true);
  };

  const handleLoginPageClick = () => {
    setIsSignInAccountPage(false);
    setIsLoginPage(true);
  };

  const handleJoinLogin = (userData) => {
    setUser(userData);
    localStorage.clear();
    localStorage.setItem("user", JSON.stringify(userData));
    setIsSignInAccountPage(false);
    setIsLoginPage(false);
    setIsChattingPage(true);
    // console.log(userData);
    socket.connect();
    // .emit("registerConnection", userData.id);
    setTimeout(() => socket.emit("registerConnection", userData.id), 500);
  };

  const handleLogout = (deletado) => {
    if (deletado === false) {
      const confirmLogout = window.confirm(
        "Tem certeza que deseja sair da sua conta?"
      );
      if (confirmLogout) {
        socket.disconnect();
        setUser(null);
        localStorage.removeItem("user");
        localStorage.clear();
        setIsLoginPage(true);
        setIsChattingPage(false);
      } else {
        return;
      }
    } else {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.clear();
      setIsLoginPage(true);
      setIsChattingPage(false);
      return;
    }
  };

  return (
    // <LoginPage />
    // <ChattingPage />

    <div>
      {isLoginPage ? (
        <LoginPage
          goSignInPage={handleCreateAccountPageClick}
          onLoginSuccess={handleJoinLogin}
        />
      ) : isSignInAccountPage ? (
        <SignInAccountPage goLoginPage={handleLoginPageClick} />
      ) : (
        <ChattingPage
          account={user}
          onLogout={handleLogout}
          setUser={setUser}
        />
      )}
    </div>

    // <SignInAccountPage />
    // <div className="App">
    //   <header className="App-header">
    //     <img src={logo} className="App-logo" alt="logo" />
    //     <p>
    //       Edit <code>src/App.js</code> and save to reload.
    //     </p>
    //     <a
    //       className="App-link"
    //       href="https://reactjs.org"
    //       target="_blank"
    //       rel="noopener noreferrer"
    //     >
    //       Learn React
    //     </a>
    //   </header>
    // </div>
  );
}

function LoginPage({ goSignInPage, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [incorrectLogin, setIncorrectLogin] = useState(false);
  const [incorrectLoginError, setIncorrectLoginError] = useState("");

  const [isVisible, setIsVisible] = useState(false);

  const handleLogin = async () => {
    setIsVisible(true);

    const login = await axios
      .post("http://localhost:8000/services/login", {
        username,
        password,
      })
      .finally(setIsVisible(false))
      .catch((err) => {
        console.log(err);
        setIncorrectLoginError(err.response.data);
        return setIncorrectLogin(true);
      });
    if (login) {
      onLoginSuccess(login.data);
      setIncorrectLogin(false);
      return;
    }
  };

  const handleEnter = async (event) => {
    if (event.key === "Enter") handleLogin();
  };

  return (
    <div className="webHome">
      <div className="homeLanding">
        <h1>WhatsApp 2</h1>
        <a>
          Bem vindo a melhor versão do melhor mensageiro. <br />
          <br /> Entre em seus chats na sua conta!
        </a>
        <img src="/img/Work-chat-rafiki.svg" />
      </div>
      <div className="homeLogin">
        <h1>Login</h1>
        <div>
          <h3>Username</h3>
          <input
            className={`loginInputs ${incorrectLogin ? "incorrectInput" : ""}`}
            type="text"
            placeholder="Informe seu usuário"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyUp={handleEnter}
          />
          <h3>Senha</h3>
          <input
            className={`loginInputs ${incorrectLogin ? "incorrectInput" : ""}`}
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyUp={handleEnter}
          />
          {incorrectLogin && (
            <span className="incorrectInputUser">{incorrectLoginError}</span>
          )}
          <div className="buttonContainerJoin">
            <button
              className={`loginButton ${
                incorrectLogin ? "incorrectInput" : ""
              }`}
              onClick={handleLogin}
            >
              Entrar
            </button>
            <span
              style={{ display: isVisible ? "block" : "none" }}
              className="loading"
            />
          </div>
          <div className="signupContainerOnLoginPage">
            <br />
            <h2>Ainda não tem uma conta?</h2>
            <button className="loginButton" onClick={goSignInPage}>
              Criar Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignInAccountPage({ goLoginPage }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [incorrectPassword, setIncorrectPassword] = useState("");
  const [incorrectConfirmPassword, setIncorrectConfirmPassword] =
    useState(false);
  const [error, setError] = useState("");

  // create account
  const handleCreateAccount = async () => {
    if (
      username === "" ||
      username === "Usuário deletado" ||
      username === "Usuario deletado" ||
      username === "usuario deletado"
    ) {
      setError("O usuário está vazio.");
      return console.log("Usuário vazio");
    }
    if (password === "") {
      setError("A senha está vazia.");
      setIncorrectPassword("Senha está vazia.");
      return setIncorrectConfirmPassword(true);
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      setIncorrectPassword("As senhas não coincidem.");
      return setIncorrectConfirmPassword(true);
    }

    const createAccoutResponse = await axios
      .post("http://localhost:8000/services/user", {
        username,
        password,
      })
      .catch((error) => {
        // console.log(`${error}`);
        return setError(error.status);
      });
    if (createAccoutResponse) {
      alert(createAccoutResponse.data);
      return goLoginPage();
    }

    // await fetch(
    //   `http://localhost:8000/services/user
    //   `,
    //   { mode: "no-cors" },
    //   {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json;charset=UTF-8",
    //     },
    //   },
    //   {
    //     div: JSON.stringify({
    //       username: username,
    //       password: password,
    //     }),
    //   }
    // )
    //   .then((res) => res.json)
    //   .catch((error) => {
    //     console.error(error);
    //   });

    // const checkUsername = await axios.get(
    //   "http://localhost:8000/services/user/search",
    //   {
    //     params: { username },
    //     headers: {
    //       "Access-Control-Allow-Origin": "*",
    //       "Access-Control-Allow-Headers": "Authorization",
    //       "Access-Control-Allow-Methods":
    //         "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    //       "Content-Type": "application/json;charset=UTF-8",
    //     },
    //   }
    // );
  };

  return (
    <div className="webHome">
      <div className="homeLanding">
        <h1>WhatsApp 2</h1>
        <a>
          Bem vindo a melhor versão do melhor mensageiro. <br />
          <br /> Crie uma conta para começar a conversar!
        </a>
        <img src="/img/Work-chat-rafiki.svg" />
      </div>
      <div className="homeLogin">
        <h1>Criar Conta</h1>
        <div>
          <h3>Username</h3>
          <input
            className={`loginInputs ${error === 500 ? "incorrectInput" : ""}`}
            type="text"
            placeholder="Informe seu usuário"
            value={username}
            onChange={(e) => {
              if (e.target.value.length > 0) {
                setUsername(e.target.value);
              }
              if (error != "") {
                setError("");
              }
            }}
          />
          {error === 500 && (
            <span className="incorrectInputUser">
              Username atualmente em uso
            </span>
          )}
          <h3>Senha</h3>
          <input
            className={`loginInputs ${
              incorrectConfirmPassword ? "incorrectInput" : ""
            }`}
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => {
              if (e.target.value.length > 0) {
                setPassword(e.target.value);
              } else {
                setPassword((e.value = ""));
              }
            }}
          />
          <h3>Confirmar Senha</h3>
          <input
            className={`loginInputs ${
              incorrectConfirmPassword ? "incorrectInput" : ""
            }`}
            type="password"
            placeholder="Digite sua senha novamente"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (incorrectConfirmPassword) {
                setIncorrectConfirmPassword(false);
              }
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter" && e.target.value.length > 0) {
                handleCreateAccount();
              }
            }}
          />
          {incorrectConfirmPassword && (
            <span className="incorrectInputUser">{incorrectPassword}</span>
          )}
          <div className="buttonContainerJoin">
            <button
              className={`loginButton ${
                incorrectConfirmPassword ? "incorrectInput" : ""
              }`}
              onClick={handleCreateAccount}
            >
              Cadastrar-se
            </button>
          </div>
          <div className="signupContainerOnLoginPage">
            <h2>Já tem uma conta?</h2>
            <button className="loginButton" onClick={goLoginPage}>
              Logar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChattingPage({ account, onLogout, setUser }) {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [timezone, setTimeZone] = "America/Sao_Paulo";
  const [loadingPage, setLoadingPage] = useState(true);

  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const lastMessageSend = useRef(null);
  const [lastMessage, setLastMessage] = useState([]);
  const [isScrollChatLoad, setIsScrollLoad] = useState(false);
  const containerRef = useRef(null);
  const [isFirstMessage, setIsFirstMessage] = useState(null);
  const [chatsId, setChatsId] = useState([]);
  const [chatId, setChatId] = useState("");

  let userId = account.id;
  let username = account.username;
  let password = account.password;

  const [usernameUpdate, setUsername] = useState(username);
  const [incorrectUsername, setIncorrectUsername] = useState(false);
  const [passwordUpdate, setPassword] = useState("");
  const [incorrectPassword, setIncorrectPassword] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [incorrectOldPassword, setIncorrectOldPassword] = useState(false);
  const [updateOldPassword, setUpdateOldPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [incorrectConfirmPassword, setIncorrectConfirmPassword] =
    useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [isVisible, setIsVisible] = useState("");
  const [isVisiblePasswordChange, setIsVisiblePasswordChange] = useState("");
  const [isVisibleUsernameChange, setIsVisibleUsernameChange] = useState("");
  const [isFocusedCreateChattingIcon, setFocusedCreateChattingIcon] =
    useState(false);
  const [isFocusedOnMessage, setFocusedOnMessage] = useState("");

  const [isTutorial, setTutorial] = useState(false);
  const [isCreatingChat, setCreatingChat] = useState(false);
  const [creatingChatUser, setChatUser] = useState(false);
  const [creatingChatGroup, setChatGroup] = useState(false);
  const [showOptionsOfChat, setShowOptionsOfChat] = useState(null);
  const [showMenuOptionsOfChat, setShowMenuOptionsOfChat] = useState(false);

  const [allChats, setAllChats] = useState([]);
  const [notificationsAllChats, setNotificationsAllChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [currentChat, setCurrentChat] = useState([]);

  const [searchUsername, setSearchUsername] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [usersFoundQuantity, setUsersFoundQuantity] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState("");
  let allPages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const [beyondThePagesLimit, setBeyondThePagesLimit] = useState(false);

  let [usersData, setUsersData] = useState([]);

  const [usernameUserChatting, setUsernameUserChatting] = useState("");
  const [idUserChatting, setIdUserChatting] = useState("");
  const [userChattingOnline, setUserChattingOnline] = useState(false);
  const [profileImageUserChatting, setProfileImageUserChatting] =
    useState(null);
  const [noUserFound, setNoUserFound] = useState(false);

  const [inicializeUserChat, setInicializeUserChat] = useState(false);

  const [isSaved, setSave] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [error, setError] = useState("");

  const [changeProfileContainer, setChangeProfileContainer] = useState(false);

  // login com imagem atualizada do usuário
  useEffect(() => {
    viewChats();
    profileImageUpdated();
    getAllNotificationsOfChats();
  }, []);

  useEffect(() => {
    reorderChats();
  }, [chatsId, messages]);

  useEffect(() => {
    const handleUsersOnline = (userIdConnected) => {
      console.log(userIdConnected);
      setOnlineUsers((prevUserOnline) => {
        if (!prevUserOnline.includes(userIdConnected)) {
          return [...prevUserOnline, userIdConnected];
        }
        return prevUserOnline;
      });
    };

    const handleUsersAlreadyOnline = (onlineUsers) => {
      // console.log("Usuários já online:", onlineUsers);
      // console.log(typeof onlineUsers);
      if (onlineUsers.length > 0) {
        setOnlineUsers((prevUserOnline) => {
          const newUsersOnline = onlineUsers.filter(
            (id) => !prevUserOnline.includes(id)
          );
          return [...prevUserOnline, ...newUsersOnline];
        });
      }
    };

    const handleUsersOffline = (userIdDisconnected) => {
      setOnlineUsers((prevUserOnline) =>
        prevUserOnline.filter((id) => id !== userIdDisconnected)
      );
    };

    // socket.on("connect", onConnect);
    // socket.on("disconnect", onDisconnect);
    socket.on("alreadyOnline", handleUsersAlreadyOnline);
    socket.on("userOnline", handleUsersOnline);
    socket.on("userOffline", handleUsersOffline);

    return () => {
      // socket.off("connect", onConnect);
      // socket.off("disconnect", onDisconnect);
      socket.off("alreadyOnline", handleUsersAlreadyOnline);
      socket.off("userOnline", handleUsersOnline);
      socket.off("userOffline", handleUsersOffline);
    };
  }, []);

  // socket join chats
  useEffect(() => {
    if (chatsId.length > 0) {
      socket.emit("joinChats", { chatsId });
    }
  }, [chatsId, isConnected, account]);

  const profileImageUpdated = async () => {
    try {
      const accountImage = await axios.get(
        `http://localhost:8000/services/user/${userId}/photo`
      );

      // let imgProfile = accountImage.data
      //   ? accountImage.data
      //   : `http://localhost:3000/img/userProfile/default/user-profile-default.svg`;
      let imgProfile;
      if (accountImage.data) {
        imgProfile = `data:image/jpeg;base64,${accountImage.data}`;
      } else {
        imgProfile = `http://localhost:3000/img/userProfile/default/user-profile-default.svg`;
      }

      setProfileImage(imgProfile);
      // console.log(accountImage.data);
    } catch (err) {
      // console.log(error.response.data);
      return setError(`${err.message}`);
    }
  };

  const discardAllChanges = async () => {
    setChangeProfileContainer(false);
    setIsVisible(false);
    setIsVisiblePasswordChange(false);
    setIsVisibleUsernameChange(false);
    setUpdateLoading(false);
    setSave(false);
    if (!isSaved) {
      setUsername(username);
      setOldPassword("");
      setPassword("");
      setConfirmPassword("");
      setError("");
      setIncorrectUsername(false);
      setIncorrectOldPassword(false);
      setUpdateLoading(false);
      setIncorrectConfirmPassword(false);
    }
  };

  const exitChat = async () => {
    setMessages([]);
    setInicializeUserChat(false);
    setUsernameUserChatting("");
    setIdUserChatting("");
    setProfileImageUserChatting("");
    setChatId("");
    setCurrentChat("");
  };

  const handleUpdateAccount = async () => {
    setUpdateLoading(true);

    if (isVisibleUsernameChange) {
      if (usernameUpdate === "") {
        setIncorrectUsername(true);
        setUpdateLoading(false);
        return setError("O usuário está vazio.");
      }
      if (usernameUpdate === username) {
        setIncorrectUsername(true);
        setUpdateLoading(false);
        return setError("Mesmo username atual.");
      }
    }

    if (isVisiblePasswordChange) {
      if (password != oldPassword) {
        // setError("Senha antiga incorreta.");
        setUpdateLoading(false);
        return setIncorrectOldPassword("Senha antiga incorreta.");
      }
      if (passwordUpdate === "") {
        // setError("A senha está vazia.");
        setIncorrectPassword("Senha está vazia.");
        // setIncorrectOldPassword(true);
        setUpdateLoading(false);
        return setIncorrectConfirmPassword(true);
      }
      if (passwordUpdate != confirmPassword) {
        // setError("As senhas não coincidem.");
        // setIncorrectOldPassword(true);
        setIncorrectPassword("As senhas modificadas não coincidem.");
        setUpdateLoading(false);
        return setIncorrectConfirmPassword(true);
      }
    }

    const confirmChanges = window.confirm(
      "Tem certeza que deseja modificar as informações inseridas?"
    );
    if (confirmChanges) {
      try {
        const updateUserData = {};
        if (usernameUpdate) updateUserData.username = usernameUpdate;
        if (passwordUpdate) updateUserData.password = passwordUpdate;

        await axios.put(
          `http://localhost:8000/services/user/update/${userId}`,
          {
            updateUserData,
          }
        );
      } catch (err) {
        setIncorrectUsername(true);
        setUpdateLoading(false);
        return setError(`${err.response.data}`);
      }

      const updateUserInfos = await axios
        .get(`http://localhost:8000/services/user/${userId}`)
        .catch((error) => {
          console.log(error);
        });
      setUser(updateUserInfos.data);
      localStorage.setItem("user", JSON.stringify(updateUserInfos.data));

      setIsVisible(false);
      setIsVisibleUsernameChange(false);
      setIsVisiblePasswordChange(false);
      console.log(usernameUpdate);

      setUpdateLoading(false);
      // setIncorrectUsername(false);
      setError("");
      setSave(true);
      return account;
    } else {
      setUpdateLoading(false);
      return;
    }
  };

  const handleClickInputImg = async () => {
    document.getElementById("imgProfileInput").click();
  };

  const resizeImage = async (file) => {
    const options = {
      maxSizeMB: 2,
      // maxWidthOrHeight: 200,
      useWebWorker: true,
      quality: 0.9,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.log(error);
      return file;
    }
  };

  const uploadProfilePhoto = async (img) => {
    const resizedImage = await resizeImage(img);

    const tempImageUrl = URL.createObjectURL(img);
    setProfileImage(tempImageUrl);

    const formData = new FormData();
    formData.append("image", resizedImage);
    try {
      await axios.put(
        `http://localhost:8000/services/user/update-image/${userId}`,
        formData
      );
    } catch (error) {
      console.log(error.message);
      console.error(error);
    } finally {
      await profileImageUpdated();
    }
  };

  const handleDeleteAccount = async () => {
    setUpdateLoading(true);

    const confirmDeleteAccount = window.confirm(
      "Tem certeza que deseja deletar sua conta? Essa ação é irreversível!"
    );

    if (confirmDeleteAccount) {
      try {
        const deleteAccount = await axios.delete(
          `http://localhost:8000/services/user/${userId}`,
          {
            params: { username },
          }
        );
        alert(deleteAccount.data);
      } catch (error) {
        console.error(error);
        alert(error.response.data);
      } finally {
        onLogout(true);
        setUpdateLoading(false);
      }
    } else {
      setUpdateLoading(false);
    }
  };

  const discardCreatingChat = async () => {
    setSearchingUser(false);
    setUsersData([]);
    setUsersFoundQuantity("");
    setCurrentPage(1);
    setTotalPages("");
    // usersData = [];
    setChatGroup(false);
    setChatUser(false);
    setCreatingChat(false);
    exitChat();
  };

  // const searchUserById = async (id) => {}
  const searchUser = async (usernameSearch, page) => {
    try {
      const reqSearchUser = await axios.get(
        `http://localhost:8000/services/user/search`,
        { params: { usernameSearch, page, username } }
      );

      setUsersFoundQuantity(reqSearchUser.data.totalItems);
      setTotalPages(reqSearchUser.data.totalPages);

      const users = reqSearchUser.data.data;
      const usersDataFound = users.map((user) => ({
        username: user.username,
        id: user.id,
        profileImage: user.profileImage
          ? `data:image/jpeg;base64,${user.profileImage}`
          : "http://localhost:3000/img/userProfile/default/user-profile-default.svg",
      }));

      setUsersData(usersDataFound);
      setCurrentPage(reqSearchUser.data.currentPage);
    } catch (error) {
      if (error.status === 404) {
        setNoUserFound(true);
      } else {
        // console.error(error);
        console.log(error);
      }
    }
  };

  const handleChangePageSearch = async (page) => {
    setCurrentPage(page);
    searchUser(searchUsername, page);
  };

  useEffect(() => {
    if (Math.abs(allPages.length - currentPage) > 5) {
      setBeyondThePagesLimit(true);
    } else {
      setBeyondThePagesLimit(false);
    }
  }, [currentPage, allPages.length]);

  const renderedSearchUsernamePages = () => {
    const renderedPages = [];

    for (let index = 0; index < allPages.length; index++) {
      const page = allPages[index];

      if (
        Math.abs(index + 1 - currentPage) >= 5 &&
        beyondThePagesLimit === true
      ) {
        renderedPages.push(
          <React.Fragment key={`ellipsis-${index}`}>
            <a className="userFoundBeyondPages">...</a>
            <a
              key={allPages.length}
              onClick={() => {
                handleChangePageSearch(allPages.length);
              }}
              className={
                currentPage === allPages.length
                  ? "userFoundPagesNumberActive"
                  : "userFoundPagesNumberInactive"
              }
            >
              {allPages.length}
            </a>
          </React.Fragment>
        );

        break;
      } else {
        renderedPages.push(
          <a
            key={page}
            onClick={() => {
              handleChangePageSearch(page);
            }}
            className={
              currentPage === page
                ? "userFoundPagesNumberActive"
                : "userFoundPagesNumberInactive"
            }
          >
            {page}
          </a>
        );
      }
    }

    return renderedPages;
  };

  const scrollToLastMessage = () => {
    if (lastMessageSend.current) {
      lastMessageSend.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScrollLoadMoreMessages = async (event) => {
    if (event.target.scrollTop === 0) {
      const oldScrollHeight = event.target.scrollHeight;
      viewAllInfoChat(chatId);
      setIsScrollLoad(true);

      setTimeout(() => {
        const newScrollHeight = event.target.scrollHeight;
        event.target.scrollTop = newScrollHeight - oldScrollHeight;
      }, 100);
    }
  };

  const sendMessage = async () => {
    if (messageInput && messageInput.length > 0) {
      socket.emit("message", {
        userId,
        chatId,
        content: messageInput,
      });
      setMessageInput("");
    }
  };

  // new message, new chat socket
  useEffect(() => {
    socket.on("newChatNotification", () => viewChats());

    socket.on("userExitChat", () => viewChats());

    socket.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      setLastMessage([message]);

      // console.log(message);
    });

    return () => {
      socket.off("newChatNotification");
      socket.off("userExitChat");
      socket.off("newMessage");
    };
  }, []);

  // update last message
  useEffect(() => {
    if (lastMessage[0]) {
      setAllChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === lastMessage.chatId
            ? { ...chat, messages: [lastMessage, ...chat.messages] }
            : chat
        )
      );
    }

    console.log(allChats);
    getAllNotificationsOfChats();

    if (!isScrollChatLoad) {
      setTimeout(() => {
        scrollToLastMessage();
      }, 100);
    }
    if (isScrollChatLoad) setIsScrollLoad(false);
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    const dateTimestamp = new Date(timestamp);
    const diffTimestamp = differenceInDays(new Date(), dateTimestamp);

    if (diffTimestamp < 1) {
      const timestampWithZoneTime = toZonedTime(
        dateTimestamp,
        "America/Sao_Paulo"
        // timezone
      );

      const formatDefaultTimestamp = format(timestampWithZoneTime, "HH:mm");

      return formatDefaultTimestamp;
    } else if (diffTimestamp < 2) {
      const timestampWithZoneTime = toZonedTime(
        dateTimestamp,
        "America/Sao_Paulo"
        // timezone
      );

      const formatDefaultTimestamp = format(timestampWithZoneTime, "HH:mm");

      return `Ontem ${formatDefaultTimestamp}`;
    } else if (diffTimestamp < 3) {
      const timestampWithZoneTime = toZonedTime(
        dateTimestamp,
        "America/Sao_Paulo"
        // timezone
      );

      const formatDefaultTimestamp = format(timestampWithZoneTime, "HH:mm");

      return `Anteontem ${formatDefaultTimestamp}`;
    } else {
      const timestampWithZoneTime = toZonedTime(
        dateTimestamp,
        "America/Sao_Paulo"
        // timezone
      );

      const formatDefaultTimestamp = format(
        timestampWithZoneTime,
        "dd/MM/yyyy HH:mm"
      );

      return formatDefaultTimestamp;
    }
  };

  function ChatMessageContent({ chat, lastMessage }) {
    const displayedContent = useMemo(() => {
      if (lastMessage.length > 0) {
        const lastMsg = lastMessage[0];

        if (chat.id === lastMsg.chatId) {
          if (chat.messages[0].id > lastMsg.id) {
            return chat.messages[0].content;
          } else {
            chat.messages[0].content = lastMsg.content;
            return chat.messages[0].content;
          }
        } else {
          return chat.messages[0]?.content;
        }
      }
      return chat.messages[0]?.content;
    }, [chat, lastMessage]);

    return <span>{displayedContent}</span>;
  }

  function ChatMessageTimestamp({ chat, lastMessage }) {
    const displayedTimestamp = useMemo(() => {
      if (lastMessage.length > 0) {
        const lastMsg = lastMessage[0];

        if (chat.id === lastMsg.chatId) {
          if (chat.messages[0].id > lastMsg.id) {
            return formatTimestamp(chat.messages[0].timestamp);
          } else {
            chat.messages[0].timestamp = lastMsg.timestamp;
            return formatTimestamp(chat.messages[0].timestamp);
          }
        } else {
          return formatTimestamp(chat.messages[0]?.timestamp);
        }
      }
      return formatTimestamp(chat.messages[0]?.timestamp);
    }, [chat, lastMessage]);

    // return "TESTE";
    return <span>{displayedTimestamp}</span>;
  }

  const getAllNotificationsOfChats = async () => {
    try {
      const responseNotifications = await axios.get(
        `http://localhost:8000/services/chats/notifications/${userId}`
      );
      // .then((response) => setNotificationsAllChats(response.data));
      // console.log(responseNotifications.data);
      setNotificationsAllChats(responseNotifications.data);
    } catch (err) {
      console.error(err);
    }
  };

  function NumberNotifications({ chat }) {
    const notification = notificationsAllChats.find(
      (notif) => notif.chatId === chat.id
    );

    if (notification) {
      return (
        <div
          className="numberOfNotificationsOnChat"
          style={{
            display: notification.messagesUnviewed > 0 ? "block" : "none",
          }}
        >
          <span>{notification.messagesUnviewed}</span>
        </div>
      );
    }
    return null;
  }

  const viewMessage = async (messageId) => {
    console.log("Mensagem visualidada:", messageId);
  };

  const viewChats = async () => {
    try {
      const responseViewChat = await axios.get(
        `http://localhost:8000/services/chats/user/${userId}`
      );

      const chats = responseViewChat.data;

      const chatsData = chats.map((chat) => {
        if (chat.isGroup) {
          return {
            ...chat,
            groupImage: chat.groupImage
              ? `data:image/jpeg;base64,${chat.groupImage}`
              : "http://localhost:3000/img/default-group.png",
          };
        } else {
          if (chat.chattings.length > 1) {
            return {
              ...chat,
              chattings: chat.chattings.map((chatting) => ({
                ...chatting,
                user: {
                  ...chatting.user,
                  profileImage:
                    chatting.user.id != userId && chatting.user.profileImage
                      ? `data:image/jpeg;base64,${chatting.user.profileImage}`
                      : chatting.user.profileImage ||
                        "http://localhost:3000/img/userProfile/default/user-profile-default.svg",
                },
              })),
            };
          } else {
            if (chat.userDeletedChat?.length > 0) {
              return {
                ...chat,
                groupImage:
                  "http://localhost:3000/img/userProfile/default/user-profile-default.svg",
                title: chat.userDeletedChat[0],
              };
            } else {
              return {
                ...chat,
                groupImage:
                  "http://localhost:3000/img/userProfile/default/user-profile-default.svg",
                title: "Usuário deletado",
              };
            }
          }
        }
      });

      const allChatsId = chats.map((chat) => chat.id);

      setAllChats(chatsData);
      setChatsId(allChatsId);

      // console.log(chatsId);
      // console.log(chatsData);
    } catch (err) {
      console.error(err);
      console.log(err);
    }
  };

  const reorderChats = async () => {
    setAllChats((prevChats) => {
      return [...prevChats].sort((a, b) => {
        const moreRecentDate = (chat) => {
          if (chat.messages?.length > 0) {
            const latestMessage = chat.messages.reduce((prev, curr) =>
              new Date(prev.timestamp) > new Date(curr.timestamp) ? prev : curr
            );
            return new Date(latestMessage.timestamp);
          }
          return new Date(chat.createdAt);
        };

        return moreRecentDate(b) - moreRecentDate(a);
      });
    });
    // const newOrderAllChats = ;
  };

  const viewAllInfoChat = async (chatId) => {
    try {
      const pageMessages = parseInt(
        messages.filter((msg) => msg.chatId === chatId).length / 20
      );

      const responseViewAllInfoChat = await axios.get(
        `http://localhost:8000/services/chats/${chatId}`,
        {
          params: { pageMessages },
        }
      );

      const chat = responseViewAllInfoChat.data;
      console.log(chat);

      setCurrentChat(chat);
      setChatId(chatId);

      if (messages.length === 0 || messages[0].chatId !== chat.id) {
        setMessages(chat.messages);
      } else {
        setMessages((prevMessages) => [...chat.messages, ...prevMessages]);
      }

      // scrollToLastMessage();
      // setAllChats(chatsData);
    } catch (err) {
      console.error(err);
      console.log(err);
    }
  };

  const createChat = async (userIdSent, userIdReceived, firstMessage) => {
    try {
      const responseCreateChat = await axios.post(
        `http://localhost:8000/services/chat/`,
        { userIdSent, userIdReceived, firstMessage }
      );
      const newChatCreated = responseCreateChat.data;
      const chattingsId = newChatCreated.chattings
        .map((chatting) => chatting.userId)
        .filter((id) => id !== userId);
      socket.emit("newChat", {
        chatId: responseCreateChat.data.id,
        chattingsId,
      });
      viewChats();
      viewAllInfoChat(responseCreateChat.data.id);
    } catch (err) {
      console.error(err);
      console.log(err);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const confirmDeleteChat = window.confirm(
        "Tem certeza que deseja deletar essa conversa?"
      );

      if (confirmDeleteChat) {
        const deleteChatOfUser = await axios.delete(
          `http://localhost:8000/services/user/chat/${chatId}`,
          {
            params: { userId: userId, username: username },
          }
        );

        alert(deleteChatOfUser.data);
        socket.emit("userExitChat", { chatId });
        exitChat();
        viewChats();
      }
    } catch (err) {
      console.error(err);
      console.log(err.message);
    }
  };

  return (
    <div className="webHome">
      <div className="chatLanding">
        <div className="leftContainerChat">
          <div
            className={`${
              changeProfileContainer
                ? "profileUserInChatContainerActive"
                : "profileUserInChatContainer"
            }`}
          >
            <div
              className={`${
                changeProfileContainer
                  ? "profileUserContainerActive"
                  : "profileUserContainer"
              }`}
            >
              {changeProfileContainer && (
                <div className="closeButtonContainer">
                  <button className="closeButton" onClick={discardAllChanges}>
                    x
                  </button>
                </div>
              )}
              <img
                className={`${
                  changeProfileContainer ? "profileImageActive" : "profileImage"
                }`}
                src={profileImage}
                onClick={(e) => {
                  setChangeProfileContainer(true);
                }}
              />
              {!changeProfileContainer ? (
                <a
                  className="textChangePage"
                  onClick={() => setChangeProfileContainer(true)}
                >
                  {account.username}
                </a>
              ) : (
                <div className="userInfoContainer">
                  <div className="uploadOverlay" onClick={handleClickInputImg}>
                    <input
                      id="imgProfileInput"
                      type="file"
                      accept="image/*"
                      style={{ opacity: "0" }}
                      // value={accountImage}
                      onChange={(e) => {
                        // console.log(file);
                        if (e.target.files[0]) {
                          uploadProfilePhoto(e.target.files[0]);
                        }
                      }}
                    />
                    <img src="/img/upload-photo-icon.svg" />
                  </div>
                  <div className="userInfos">
                    {!isVisibleUsernameChange ? (
                      <a
                        style={{
                          marginLeft: "0px",
                          marginBottom: "10px",
                          marginTop: "10px",
                        }}
                        className="textChangePage"
                        onClick={() => setChangeProfileContainer(true)}
                      >
                        {account.username}
                      </a>
                    ) : (
                      <input
                        type="text"
                        value={usernameUpdate}
                        // placeholder={username}
                        style={{
                          marginLeft: "0px",
                          marginBottom: "10px",
                          marginTop: "10px",
                        }}
                        className={`textChangePage inputUpdate ${
                          incorrectUsername ? "incorrectInput" : ""
                        }`}
                        onClick={() => setChangeProfileContainer(true)}
                        onChange={(e) => {
                          setUsername(e.target.value);

                          // if (error != "") {
                          //   setError("");
                          // }
                        }}
                      />
                    )}
                    <button
                      // style={{ "padding-left": "25px" }}
                      className="changeButton"
                      onClick={() => {
                        if (isVisibleUsernameChange) {
                          setIsVisibleUsernameChange(false);
                          !isVisiblePasswordChange && setIsVisible(false);
                          setUsername(username);
                          setIncorrectUsername(false);
                          setError("");
                        } else {
                          setIsVisible(true);
                          setIsVisibleUsernameChange(true);
                        }
                      }}
                    >
                      Mudar Username
                    </button>
                    <button
                      style={{ marginBottom: "10px" }}
                      className="changeButton"
                      onClick={() => {
                        if (isVisiblePasswordChange) {
                          setIsVisiblePasswordChange(false);
                          !isVisibleUsernameChange && setIsVisible(false);
                          setOldPassword("");
                          setPassword("");
                          setConfirmPassword("");
                          setIncorrectOldPassword("");
                          setIncorrectPassword("");
                          setIncorrectConfirmPassword("");
                        } else {
                          setIsVisible(true);
                          setIsVisiblePasswordChange(true);
                        }
                      }}
                    >
                      Mudar Senha
                    </button>
                    {isVisiblePasswordChange && (
                      <>
                        <input
                          style={{
                            marginLeft: "0px",
                            marginBottom: "10px",

                            fontSize: "18px",
                          }}
                          className={`textChangePage inputUpdate ${
                            incorrectOldPassword ? "incorrectInput" : ""
                          }`}
                          type="password"
                          placeholder="Senha antiga"
                          value={oldPassword}
                          onChange={(e) => {
                            setOldPassword(e.target.value);
                            setIncorrectOldPassword("");
                            if (e.target.value === password) {
                              setUpdateOldPassword(true);
                            } else {
                              setUpdateOldPassword(false);
                            }
                          }}
                        />
                        <input
                          style={{
                            marginLeft: "0px",
                            marginBottom: "10px",
                            fontSize: "18px",
                          }}
                          className={`textChangePage inputUpdate ${
                            incorrectConfirmPassword ? "incorrectInput" : ""
                          }`}
                          type="password"
                          placeholder="Nova Senha"
                          value={passwordUpdate}
                          onChange={(e) => {
                            if (e.target.value != password) {
                              if (e.target.value.length > 0) {
                                setPassword(e.target.value);
                              } else {
                                setPassword((e.value = ""));
                              }
                            }
                          }}
                        />
                        <input
                          style={{
                            marginLeft: "0px",
                            marginBottom: "10px",
                            fontSize: "18px",
                          }}
                          className={`textChangePage inputUpdate ${
                            incorrectConfirmPassword ? "incorrectInput" : ""
                          }`}
                          type="password"
                          placeholder="Confirme a nova senha"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (incorrectConfirmPassword) {
                              setIncorrectConfirmPassword(false);
                            }
                          }}
                        />
                      </>
                    )}
                    {isVisible && (
                      <>
                        <button
                          style={{
                            width: "100px",
                            cursor: "pointer",
                            fontFamily: "Helvetica",
                          }}
                          className={`inputUpdate ${
                            incorrectUsername ||
                            incorrectOldPassword ||
                            incorrectConfirmPassword
                              ? "incorrectInput"
                              : ""
                          }`}
                          onClick={handleUpdateAccount}
                        >
                          Salvar
                        </button>
                        {updateLoading && (
                          <span
                            style={{
                              display: updateLoading ? "block" : "none",
                            }}
                            className="loadingUpdate"
                          />
                        )}
                        {incorrectUsername && (
                          <a className="incorrect">{error}</a>
                        )}
                        {incorrectOldPassword != "" && (
                          <a className="incorrect">{incorrectOldPassword}</a>
                        )}
                        {incorrectConfirmPassword && (
                          <a className="incorrect">{incorrectPassword}</a>
                        )}
                      </>
                    )}
                  </div>
                  <div
                    style={{
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      marginTop: "30px",
                    }}
                  >
                    <img
                      style={{
                        "padding-left": "0px",
                      }}
                      src="/img/logout-icon.svg"
                      className="logoutButton"
                      onClick={() => onLogout(false)}
                    />
                    <a
                      style={{
                        color: "white",
                        textAlign: "center",
                        marginLeft: "5px",
                      }}
                      onClick={() => onLogout(false)}
                    >
                      Logout
                    </a>
                  </div>
                  <button
                    className="deleteButton"
                    onClick={handleDeleteAccount}
                  >
                    Deletar Conta
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* user messages and groups */}
          <div
            className="userChatsContainer"
            style={{ display: changeProfileContainer ? "none" : "block" }}
          >
            <div className="viewChatsRightContainer">
              {allChats.length > 0 ? (
                allChats.map((chat) => (
                  <div
                    className="viewChatsOverviewRightContainer"
                    style={{
                      border:
                        (chat.userDeletedChat.length > 0 ||
                          chat.deletedUser.length > 0) &&
                        !chat.isGroup
                          ? "0.5px solid rgb(255 0 0 / 50%)"
                          : "0.5px solid rgb(61 68 73 / 50%)",
                      // : "0.5px solid rgb(37 211 102 / 65%)",
                    }}
                    onMouseEnter={() => setShowOptionsOfChat(chat.id)}
                    onMouseLeave={() => {
                      setShowOptionsOfChat(null);
                      setShowMenuOptionsOfChat(null);
                    }}
                    onClick={() => {
                      setInicializeUserChat(true);
                      setCreatingChat(false);
                      if (chat.chattings.length > 1) {
                        setUsernameUserChatting(
                          chat.chattings.find((item) => item.user.id != userId)
                            ?.user.username
                        );
                      } else {
                        setUsernameUserChatting(chat.title);
                      }

                      setIdUserChatting(
                        chat.chattings.find((item) => item.user.id != userId)
                          ?.user.id
                      );
                      setProfileImageUserChatting(
                        chat.chattings.find((item) => item.user.id != userId)
                          ?.user.profileImage
                      );
                      setIsFirstMessage(false);
                      if (currentChat.id != chat.id) {
                        viewAllInfoChat(chat.id).then(viewMessage());
                      }
                    }}
                  >
                    <img
                      className="chatImage"
                      src={
                        chat.groupImage
                          ? chat.groupImage
                          : chat.chattings.find(
                              (item) => item.user.id != userId
                            )?.user.profileImage
                      }
                    />
                    <div className="chatTitleAndLastMessageContainer">
                      <a
                        className="chatTitle"
                        style={{
                          fontStyle:
                            (chat.userDeletedChat.length > 0 ||
                              chat.deletedUser.length > 0) &&
                            !chat.isGroup &&
                            "italic",
                          opacity:
                            (chat.userDeletedChat.length > 0 ||
                              chat.deletedUser.length > 0) &&
                            !chat.isGroup &&
                            "0.55",
                        }}
                      >
                        {chat.title === null
                          ? chat.chattings.find(
                              (item) => item.user.id != userId
                            )?.user.username
                          : chat.title}
                      </a>
                      {chat.messages[0] ? (
                        <div className="chatMessageCheckContainer">
                          <img
                            style={{
                              display: chat.messages[0] ? "block" : "none",
                            }}
                            src={
                              (
                                chat.chatId === lastMessage.chatId ??
                                chat.messages[0].id > lastMessage.id
                                  ? chat.messages[0].viewed
                                  : lastMessage.viewed
                              )
                                ? "/img/check-message-viewed-icon.svg"
                                : "/img/check-message-icon.svg"
                            }
                            className="chatCheckMessageIcon"
                          />
                          <a className="chatLastMessage">
                            <span
                              style={{
                                display: chat.isGroup ? "block" : "none",
                              }}
                            >
                              author
                            </span>{" "}
                            <ChatMessageContent
                              chat={chat}
                              lastMessage={lastMessage}
                            />
                          </a>
                        </div>
                      ) : (
                        <div className="chatMessageCheckContainer">
                          <a
                            className="chatLastMessage"
                            style={{ fontSize: "11px" }}
                          >
                            Seja o primeiro a enviar uma mensagem!
                          </a>
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        // alignItems: "center",
                        // justifyContent: "center",
                        height: "100%",
                        width: "19%",
                        // marginRight: "2%",
                        // paddingRight: "3%",
                        // transform: "translateX(-25%)",
                      }}
                    >
                      <div className="containerMessageViewedAndTimestamp">
                        {chat.messages.length > 0 && (
                          <div className="timestampLastMessageOfChat">
                            <ChatMessageTimestamp
                              chat={chat}
                              lastMessage={lastMessage}
                            />
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            height: "100%",
                            width: "100%",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <NumberNotifications chat={chat} />
                          <img
                            className="moreOptionsOnChatCard"
                            src="/img/ellipsis-vertical.svg"
                            style={{
                              scale: ".8",
                              transform: "translateY(-30%)",
                              display:
                                showOptionsOfChat === chat.id
                                  ? "block"
                                  : "none",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenuOptionsOfChat(chat.id);
                            }}
                          />
                          {showMenuOptionsOfChat === chat.id && (
                            <div
                              className="chatCardOptionsMenu"
                              style={{ userSelect: "none" }}
                              onMouseLeave={() => {
                                setShowOptionsOfChat(null);
                                setShowMenuOptionsOfChat(null);
                                // setShowMenuOptionsOfChat(false);
                              }}
                            >
                              <a
                                style={{
                                  color: "#ffffff",
                                  fontSize: "15px",
                                  letterSpacing: ".25px",
                                  // paddingLeft: "8px",
                                }}
                              >
                                Encaminhar contato
                              </a>
                              <a
                                style={{
                                  color: "#ff0000",
                                  fontSize: "15px",
                                  letterSpacing: ".25px",
                                  // paddingLeft: "8px",
                                }}
                                onClick={(e) => {
                                  handleDeleteChat(chat.id);
                                  e.stopPropagation();
                                }}
                              >
                                Deletar conversa
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="userWithNoChats">
                  <p style={{ userSelect: "none" }}>Nenhum chat disponível</p>
                </div>
              )}
            </div>
            <div
              className="userCreateChatsContainer"
              onMouseEnter={() => {
                setFocusedCreateChattingIcon(true);
              }}
              onMouseLeave={() => {
                setFocusedCreateChattingIcon(false);
              }}
            >
              <div
                className="userCreateChatsDescriptionContainer"
                style={{
                  display:
                    isFocusedCreateChattingIcon || isTutorial ? "flex" : "none",
                }}
              >
                <a
                  style={{ opacity: isFocusedCreateChattingIcon ? 1 : 0 }}
                  className="descriptionCreateChats"
                  onClick={() => {
                    setCreatingChat(true);
                    setChatGroup(false);
                    setChatUser(true);
                  }}
                >
                  Criar Conversa
                </a>
                <a
                  style={{ opacity: isFocusedCreateChattingIcon ? 1 : 0 }}
                  className="descriptionCreateChats"
                  onClick={() => {
                    setCreatingChat(true);
                    setChatUser(false);
                    setChatGroup(true);
                  }}
                >
                  Criar Grupo
                </a>
              </div>
              <div className="userCreateIconsContainer">
                <img
                  className="iconCreateChats"
                  style={{
                    filter:
                      isTutorial || isFocusedCreateChattingIcon
                        ? "brightness(150%)"
                        : "none" && creatingChatUser
                        ? "saturate(0%) brightness(300%)"
                        : "",
                  }}
                  onMouseEnter={() => {}}
                  src="/img/create-chat-icon.svg"
                  onClick={() => {
                    setSearchingUser(false);
                    setUsersData([]);
                    setUsersFoundQuantity("");
                    setCurrentPage(1);
                    setTotalPages("");
                    setChatGroup(false);
                    setChatUser(false);
                    setCreatingChat(true);
                    setChatGroup(false);
                    setChatUser(true);
                  }}
                />
                <img
                  style={{
                    filter:
                      isTutorial || isFocusedCreateChattingIcon
                        ? "brightness(150%)"
                        : "none" && creatingChatGroup
                        ? "saturate(0%) brightness(300%)"
                        : "",
                  }}
                  className="iconCreateChats"
                  src="/img/create-group-icon.svg"
                  onClick={() => {
                    setSearchingUser(false);
                    setUsersData([]);
                    setUsersFoundQuantity("");
                    setCurrentPage(1);
                    setTotalPages("");
                    setChatGroup(false);
                    setChatUser(false);
                    setCreatingChat(true);
                    setChatUser(false);
                    setSearchingUser(false);
                    setChatGroup(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="rightContainerChat">
          {isCreatingChat ? (
            <>
              {(creatingChatUser || creatingChatGroup) && (
                <div className="closeButtonContainer">
                  <button
                    style={{
                      position: "absolute",
                      fontSize: "50px",
                      top: "0px",
                      height: "fit-content",
                      // paddingRight: "30px",
                    }}
                    className="closeButton"
                    onClick={discardCreatingChat}
                  >
                    x
                  </button>
                </div>
              )}
              {creatingChatUser ? (
                <div className="creatingChatWithUserContainer">
                  <div className="creatingChatWithUserContainerChildren">
                    <img
                      style={{
                        width: "35%",
                        // height: "50%",
                        // border: "1px solid red",
                      }}
                      src="/img/Mailbox-bro.png"
                    />
                    <a
                      style={{
                        textAlign: "center",
                        color: "white",
                        fontSize: "25px",
                        marginBottom: "10px",
                      }}
                    >
                      Você deseja enviar mensagem direta para quem?
                    </a>
                    <input
                      className="creatingChatWithUserInput"
                      type="text"
                      placeholder="Digite o Username para qual deseja enviar a mensagem"
                      style={{ marginBottom: "10px" }}
                      onKeyUp={(e) => {
                        if (e.key === "Enter" && e.target.value.length > 0) {
                          setNoUserFound(false);
                          searchUser(searchUsername);
                          setSearchingUser(true);
                        }
                      }}
                      onChange={(e) => {
                        setSearchUsername(e.target.value);
                      }}
                    />
                    <button
                      className="creatingChatWithUserButton"
                      id="searchingUsernameButton"
                      onClick={() => {
                        setNoUserFound(false);
                        searchUser(searchUsername);
                        setSearchingUser(true);
                      }}
                    >
                      Pesquisar
                    </button>
                    <div
                      style={{ display: searchingUser ? "flex" : "none" }}
                      className="searchSendMessageContainer"
                    >
                      <span className="spanDiviseSearch"></span>
                      <a className="searchSendMessageLabel">
                        Usuários Encontrados
                      </a>
                      <span
                        className="spanDiviseSearch"
                        style={{ marginBottom: "5px" }}
                      ></span>
                      <div className="searchUserListContainer">
                        <div className="searchUsersQuantityLabelContainer">
                          <a>Encontrados {usersFoundQuantity} usuários.</a>
                        </div>
                        {!noUserFound && usersData.length > 0 ? (
                          usersData
                            // .filter((users) => users.id != userId)
                            .map((users) => (
                              <div
                                key={users.id}
                                className="userFoundContainer"
                                style={{
                                  display:
                                    // noUserFound ? "none" :
                                    "flex",
                                }}
                              >
                                <div className="userFoundPhotoContainer">
                                  <img
                                    className="userFoundImageProfile"
                                    // src="http://localhost:3000/img/userProfile/default/user-profile-default.svg"
                                    src={users.profileImage}
                                  />
                                </div>
                                <div className="userFoundInfosContainer">
                                  <a className="userFoundUsername">
                                    {users.username}
                                  </a>
                                  <a className="userFoundId">#{users.id}</a>
                                </div>
                                <button
                                  className="userFoundInicializeChat"
                                  onClick={() => {
                                    setInicializeUserChat(true);
                                    setCreatingChat(false);
                                    setUsernameUserChatting(users.username);
                                    setIdUserChatting(users.id);
                                    setProfileImageUserChatting(
                                      users.profileImage
                                    );
                                    // discardCreatingChat();
                                    setIsFirstMessage(true);
                                    // createChat(userId, users.id);
                                  }}
                                >
                                  Iniciar Conversa
                                </button>
                              </div>
                            ))
                        ) : (
                          <div
                            style={{
                              display: noUserFound ? "flex" : "none",
                              flexDirection: "column",
                              width: "100%",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <img
                              src="/img/person_search.svg"
                              style={{
                                width: "20%",
                                // filter: "saturate(0%)",
                                opacity: "0.5",
                                userSelect: "none",
                              }}
                            />
                            <a
                              style={{
                                color: "#ffffff",
                                userSelect: "none",
                                opacity: "0.7",
                              }}
                            >
                              Não foi encontrado um usuário com este username
                              que você não tenha uma conversa.
                            </a>
                          </div>
                        )}
                      </div>
                      <div
                        className="userFoundPages"
                        style={{ display: noUserFound ? "none" : "flex" }}
                      >
                        <>{renderedSearchUsernamePages()}</>
                      </div>
                    </div>
                  </div>
                </div>
              ) : creatingChatGroup ? (
                <div className="creatingChatGroupContainer">
                  <div>Grupo</div>
                </div>
              ) : null}
            </>
          ) : inicializeUserChat ? (
            // Chat
            <div className="userChatContainer">
              <div className="userChatLabel">
                <div className="closeChatButtonContainer">
                  <button className="closeButton" onClick={exitChat}>
                    x
                  </button>
                </div>
                <div className="userChattingProfileContainer">
                  <img
                    src={
                      profileImageUserChatting
                        ? profileImageUserChatting
                        : "http://localhost:3000/img/userProfile/default/user-profile-default.svg"
                    }
                  />
                  <a
                    className="usernameChatting"
                    style={{
                      color:
                        currentChat?.deletedUser?.length > 0 &&
                        !currentChat.isGroup
                          ? "#f700008c"
                          : "#ffffff",
                      fontStyle:
                        currentChat?.deletedUser?.length > 0 &&
                        !currentChat.isGroup
                          ? "italic"
                          : "normal",
                    }}
                  >
                    {usernameUserChatting}
                  </a>
                  {currentChat?.deletedUser?.length > 0 &&
                    !currentChat.isGroup && (
                      <img
                        onClick={() => handleDeleteChat(currentChat.id)}
                        style={{
                          scale: ".5",
                          transform: "translateX(-50%)",
                          cursor: "pointer",
                        }}
                        src={"http://localhost:3000/img/delete-icon.svg"}
                      />
                    )}
                </div>
                <div
                  style={{
                    className: "statusLabelUserChatting",
                    backgroundColor: onlineUsers.includes(idUserChatting)
                      ? "#25d366"
                      : "#f700008c",
                    boxShadow: onlineUsers.includes(idUserChatting)
                      ? "inset 0px 5px 7px 0px rgb(25 151 72) "
                      : "inset 0px -8px 7px 0px #f700008c",
                    width: "100%",
                    // height: "2.5px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      width: "100%",
                      // height: "100%",
                      textAlign: "center",
                      fontSize: "12px",
                      letterSpacing: "1.5px",
                      color: "#ffffff",
                      userSelect: "none",
                      overflow: "hidden",
                    }}
                  >
                    {onlineUsers.includes(idUserChatting)
                      ? "Online"
                      : currentChat?.userDeletedChat?.length > 0 &&
                        !currentChat?.isGroup
                      ? "Usuário deletou a conversa."
                      : "Offline"}
                  </span>
                </div>
              </div>
              <div
                className="chatContainer"
                onScroll={handleScrollLoadMoreMessages}
                ref={containerRef}
                onMouseEnter={viewMessage}
              >
                {messages.length === 0 && (
                  <div className="welcomeToUserChatContainer">
                    <a>Envie sua primeira mensagem ao {usernameUserChatting}</a>
                  </div>
                )}
                {messages.length > 0 &&
                  messages.map((msg, index) => (
                    <div
                      style={{
                        width: "100%",
                        height: "fit-content",
                        display: "flex",
                        justifyContent:
                          msg.authorId === userId ? "flex-end" : "flex-start",
                      }}
                      ref={
                        index === messages.length - 1 ? lastMessageSend : null
                      }
                    >
                      <div
                        key={index}
                        className={
                          // "messageSentContainer"
                          msg.authorId === userId
                            ? "messageSentContainer"
                            : "messageReceivedContainer"
                        }
                        onMouseEnter={() => {
                          if (msg.authorId === userId) {
                            setFocusedOnMessage(msg.id);
                          }
                        }}
                      >
                        <a className="messageContent">{msg.content}</a>
                        <div className="messageInfoCheckTimestamp">
                          <img
                            className="messageCheckIcon"
                            src={
                              msg.viewed
                                ? "/img/check-message-viewed-icon.svg"
                                : "/img/check-message-icon.svg"
                            }
                          />
                          <a className="messageTimestamp">
                            {formatTimestamp(msg.timestamp)}
                          </a>
                          <img
                            className="moreOptionsOnMessageCard"
                            src="/img/ellipsis-vertical.svg"
                            style={{
                              scale: ".6",
                              // transform: "translateY(-30%)",
                              display:
                                msg.authorId === userId ? "block" : "none",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              // setShowMenuOptionsOfChat(chat.id);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              {currentChat?.chattings?.length < 2 ? (
                <div
                  className="sendMessageToChatContainer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <a
                    style={{
                      color: "#25d366",
                      // fontStyle: "italic",
                    }}
                  >
                    Você é o único usuário dessa conversa, portanto a conversa
                    está disponível em modo de visualização.
                  </a>
                </div>
              ) : (
                <div className="sendMessageToChatContainer">
                  <input
                    className="sendMessageToChatInput"
                    type="text"
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                    }}
                    onKeyUp={(e) => {
                      if (e.key === "Enter" && e.target.value.length > 0) {
                        setMessageInput(e.target.value);
                        if (messages.length === 0) {
                          createChat(userId, idUserChatting, e.target.value);
                          setMessageInput("");
                        } else {
                          sendMessage();
                        }
                        if (currentChat?.messages?.length === 0) {
                          viewChats();
                        }
                      }
                    }}
                  />
                  <img
                    className="sendMessageIcon"
                    src="/img/send-message-icon.svg"
                    onClick={() => {
                      if (messages.length === 0) {
                        createChat(userId, idUserChatting, messageInput);
                        setMessageInput("");
                      } else {
                        sendMessage();
                      }
                      if (currentChat?.messages?.length === 0) {
                        viewChats();
                      }
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="landingChattingPage">
              <a>
                Nossa, como aqui está silencioso. Que tal conversar um pouco?😄
              </a>
              <img
                style={{ width: "600px" }}
                src="/img/messaging-landing.svg"
              />
              <a>
                Inicie uma conversa apertando nos{" "}
                <span
                  className="hoverTutorialChatting"
                  style={{
                    cursor: "help",
                    borderBottom: isTutorial ? "2px solid #25D366" : "none",
                    color: "#25D366",
                    fontWeight: "bold",
                  }}
                  onMouseEnter={() => {
                    setTutorial(true);
                  }}
                  onMouseLeave={() => {
                    setTutorial(false);
                  }}
                >
                  balões verdes{" "}
                </span>
                <img
                  className="hoverTutorialChattingIcon"
                  style={{ cursor: "help", width: "25px" }}
                  src="/img/create-chat-icon.svg"
                  onMouseEnter={() => {
                    setTutorial(true);
                  }}
                  onMouseLeave={() => {
                    setTutorial(false);
                  }}
                />{" "}
                no canto inferior esquerdo.
              </a>
              <br />
              <a>Ou converse com alguém clicando em seus chats na esquerda.</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
