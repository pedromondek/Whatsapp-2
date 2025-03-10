import logo from "./logo.svg";
import React, { useState, useEffect, useRef } from "react";
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
  };

  const handleLogout = (deletado) => {
    console.log(deletado);
    if (deletado === false) {
      const confirmLogout = window.confirm(
        "Tem certeza que deseja sair da sua conta?"
      );
      if (confirmLogout) {
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
    if (username === "") {
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
  // const [socketT, setSocketT] = useState(false);

  useEffect(() => {
    const onConnect = () => {
      socket.emit("registerConnection", { userId });
      setIsConnected(true);
    };

    function onDisconnect() {
      setIsConnected(false);
    }

    // const newSocket = socket(userId);
    // setSocketT(newSocket);
    // newSocket.on("connect");
    socket.on("connect", onConnect);
    // newSocket.on("disconnect");
    socket.on("disconnect", onDisconnect);

    return () => {
      // newSocket.off("connect");
      socket.off("connect", onConnect);
      // newSocket.off("disconnect");
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);
  const lastMessageSend = useRef(null);
  const [isFirstMessage, setIsFirstMessage] = useState(null);

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

  const [isTutorial, setTutorial] = useState(false);
  const [isCreatingChat, setCreatingChat] = useState(false);
  const [creatingChatUser, setChatUser] = useState(false);
  const [creatingChatGroup, setChatGroup] = useState(false);

  const [allChats, setAllChats] = useState([]);

  const [searchUsername, setSearchUsername] = useState("");
  const [searchingUser, setSearchingUser] = useState(false);
  const [usersFoundQuantity, setUsersFoundQuantity] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState("");
  let allPages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const [beyondThePagesLimit, setBeyondThePagesLimit] = useState(false);

  // let usersData = [];
  let [usersData, setUsersData] = useState([]);

  const [usernameUserChatting, setUsernameUserChatting] = useState("");
  const [idUserChatting, setIdUserChatting] = useState("");
  const [profileImageUserChatting, setProfileImageUserChatting] =
    useState(null);
  // const [noUserFound, setNoUserFound] = useState(true);
  const [noUserFound, setNoUserFound] = useState(false);

  const [inicializeUserChat, setInicializeUserChat] = useState(false);

  const [isSaved, setSave] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [error, setError] = useState("");

  const [changeProfileContainer, setChangeProfileContainer] = useState(false);
  // get username por id
  // const userJoin = await axios.get("http://localhost:8000/services/user/:id", {
  //       username
  //     });

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
      return setError(`${err.response.data}`);
    }
  };

  // login com imagem atualizada do usuário
  useEffect(() => {
    profileImageUpdated();
    viewChat();
    console.log(allChats);
  }, []);

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
    // return new Promise((resolve, reject) => {
    //   const reader = new FileReader();
    //   reader.onloadend = () => {
    //     const imgElement = new Image();
    //     imgElement.onload = () => {
    //       const canvas = document.createElement("canvas");
    //       const ctx = canvas.getContext("2d");

    //       const maxWidth = 200;
    //       const maxHeight = 200;
    //       let width = imgElement.width;
    //       let height = imgElement.height;

    //       if (width > height) {
    //         if (width > maxWidth) {
    //           height *= maxWidth / width;
    //           width = maxWidth;
    //         }
    //       } else {
    //         if (height > maxHeight) {
    //           width *= maxHeight / height;
    //           height = maxHeight;
    //         }
    //       }

    //       canvas.width = width;
    //       canvas.height = height;

    //       ctx.drawImage(imgElement, 0, 0, width, height);

    //       canvas.toBlob((blob) => {
    //         const fileName = `${username}_${Date.now()}.png`;
    //         const file = new File([blob], fileName, { type: "image/png" });
    //         resolve(file);
    //       }, "image/png");
    //     };
    //     imgElement.src = reader.result;
    //   };

    //   reader.readAsDataURL(file);
    // });

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
          `http://localhost:8000/services/user/${userId}`
        );
        console.log(deleteAccount);
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
  };

  // const searchUserById = async (id) => {}
  const searchUser = async (username, page) => {
    try {
      const reqSearchUser = await axios.get(
        `http://localhost:8000/services/user/search?username=${username}&page=${page}`
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

      // console.log(reqSearchUser.data.itemsPerPage);
    } catch (error) {
      if (error.status === 404) {
        setNoUserFound(true);
      } else {
        // console.error(error);
        console.log(error);
      }
    }
  };

  // const handleClickInputSearchUsername = async () => {
  //   document.getElementById("searchingUsernameButton").click();
  // };

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
      }
      // // logica para pagina maior que 5 de diferença inicial
      // if (currentPage > 5 && beyondThePagesLimit === true) {
      //   renderedPages.push(
      //     <React.Fragment key={`ellipsis-${1}`}>
      //       <a
      //         key={1}
      //         onClick={() => {
      //           handleChangePageSearch(1);
      //         }}
      //         className={
      //           currentPage === 1
      //             ? "userFoundPagesNumberActive"
      //             : "userFoundPagesNumberInactive"
      //         }
      //       >
      //         {1}
      //       </a>
      //       <a className="userFoundBeyondPages">...</a>
      //     </React.Fragment>
      //   );

      //   for (
      //     let index = currentPage - 1;
      //     // index <= Math.min(allPages.length - 1, currentPage + 4);
      //     index <= currentPage - 4;
      //     index--
      //   ) {
      //     const page = allPages[index];

      //     renderedPages.push(
      //       <a
      //         key={page}
      //         onClick={() => handleChangePageSearch(page)}
      //         className={
      //           currentPage === page
      //             ? "userFoundPagesNumberActive"
      //             : "userFoundPagesNumberInactive"
      //         }
      //       >
      //         {page}
      //       </a>
      //     );
      //   }

      //   break;
      // }
      else {
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

  const handleInicializeUserChat = () => {};

  const handleEnterInputMessage = async (event) => {
    //   if (event.key === "Enter") ();
    // };
  };

  const sendMessage = async () => {
    if (messageInput && messageInput.length > 0) {
      socket.emit("message", messageInput);
      setMessageInput("");
    }
  };

  // socket io
  const scrollToLastMessage = () => {
    if (lastMessageSend.current) {
      lastMessageSend.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    socket.on("message", (message) => {
      // setMessages([message]);
      setMessages((prevMessages) => [...prevMessages, message]);
      console.log(messages);
    });

    return () => {
      socket.off("message");
    };
  }, [sendMessage]);

  useEffect(() => {
    scrollToLastMessage();
  }, [messages]);

  const formatTimestamp = (timestamp) => {
    // console.log(typeof timestamp);
    const dateTimestamp = new Date(timestamp);
    // console.log(typeof dateTimestamp);
    const diffTimestamp = differenceInDays(new Date(), dateTimestamp);

    if (diffTimestamp < 1) {
      const timestampWithZoneTime = toZonedTime(
        dateTimestamp,
        "America/Sao_Paulo"
        // timezone
      );

      const formatDefaultTimestamp = format(timestampWithZoneTime, "HH:mm:ss");

      return formatDefaultTimestamp;
    } else if (diffTimestamp < 2) {
      const timestampWithZoneTime = toZonedTime(
        dateTimestamp,
        "America/Sao_Paulo"
        // timezone
      );

      const formatDefaultTimestamp = format(timestampWithZoneTime, "HH:mm:ss");

      return `Ontem ${formatDefaultTimestamp}`;
    } else if (diffTimestamp < 3) {
      const timestampWithZoneTime = toZonedTime(
        dateTimestamp,
        "America/Sao_Paulo"
        // timezone
      );

      const formatDefaultTimestamp = format(timestampWithZoneTime, "HH:mm:ss");

      return `Anteontem ${formatDefaultTimestamp}`;
    } else {
      const timestampWithZoneTime = toZonedTime(
        dateTimestamp,
        "America/Sao_Paulo"
        // timezone
      );

      const formatDefaultTimestamp = format(
        timestampWithZoneTime,
        "dd/MM/yyyy HH:mm:ss"
      );

      return formatDefaultTimestamp;
    }
  };

  const viewChat = async () => {
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
        }
      });

      setAllChats(chatsData);

      console.log(chatsData);
    } catch (err) {
      console.error(err);
      console.log(err);
    }
  };

  // useEffect(() => {
  const createChat = async (userIdSent, userIdReceived) => {
    // if (isFirstMessage) {
    try {
      const responseCreateChat = await axios.post(
        `http://localhost:8000/services/chat/`,
        { userIdSent, userIdReceived }
      );

      console.log(responseCreateChat.data);

      setAllChats((prevChats) => [...prevChats, createChat]);
    } catch (err) {
      console.error(err);
      console.log(err);
    }
    // };
  };

  // }, [isFirstMessage]);

  // useEffect(async () => {

  // }, [allChats]);

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
                  // if (changeProfileContainer) {
                  // setChangeProfileContainer(false);
                  // } else {
                  setChangeProfileContainer(true);
                  // }
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
            {allChats.length > 0 ? (
              allChats.map((chat) => (
                <div className="viewChatsRightContainer">
                  <div className="viewChatsOverviewRightContainer">
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
                      <a className="chatTitle">
                        {chat.title === null
                          ? chat.chattings.find(
                              (item) => item.user.id != userId
                            )?.user.username
                          : chat.title}
                      </a>
                      <div className="chatMessageCheckContainer">
                        <img
                          src={
                            chat.messages[0].viewed
                              ? "/img/check-message-viewed-icon.svg"
                              : "/img/check-message-icon.svg"
                          }
                          className="chatCheckMessageIcon"
                        />
                        <a className="chatLastMessage">
                          <span
                            style={{ display: chat.isGroup ? "block" : "none" }}
                          >
                            author
                          </span>{" "}
                          {chat.messages[0].content}
                        </a>
                      </div>
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
                      {/* ARRUMAR TIMESTAMP SEM NOTIFICACAO */}
                      <div className="containerMessageViewedAndTimestamp">
                        <a className="timestampLastMessageOfChat">
                          {formatTimestamp(chat.messages[0].timestamp)}
                        </a>
                        <span
                          className="numberOfNotificationsOnChat"
                          style={{
                            display:
                              chat.messages[0].authorId != userId
                                ? // ? "none"

                                  "block"
                                : "none",
                            // "block",
                          }}
                        >
                          1
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>Nenhum chat disponível.</p>
            )}
            <div className="userCreateChatsContainer">
              <div
                className="userCreateChatsDescriptionContainer"
                style={{
                  display:
                    isFocusedCreateChattingIcon || isTutorial ? "flex" : "none",
                }}
                onMouseEnter={() => {
                  setFocusedCreateChattingIcon(true);
                }}
                onMouseLeave={() => {
                  setFocusedCreateChattingIcon(false);
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
              <div
                className="userCreateIconsContainer"
                // onFocus={() => {
                //   setFocusedCreateChattingIcon(true);
                //   console.log(isFocusedCreateChattingIcon);
                // }}
                onMouseEnter={() => {
                  setFocusedCreateChattingIcon(true);
                }}
                onMouseLeave={() => {
                  setFocusedCreateChattingIcon(false);
                }}
              >
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
                  src="/img/create-chat-icon.svg"
                  onClick={() => {
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
                                    handleInicializeUserChat();
                                    setUsernameUserChatting(users.username);
                                    setIdUserChatting(users.id);
                                    setProfileImageUserChatting(
                                      users.profileImage
                                    );
                                    discardCreatingChat();
                                    setIsFirstMessage(true);
                                    createChat(userId, users.id);
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
                              Não foi encontrado um usuário com este Username.
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
            <div className="userChatContainer">
              <div className="userChatLabel">
                <div className="userChattingProfileContainer">
                  <img src={profileImageUserChatting} />
                  <a className="usernameChatting">{usernameUserChatting}</a>
                </div>
              </div>
              <div className="chatContainer">
                {isFirstMessage && (
                  <div className="welcomeToUserChatContainer">
                    <a>Envie sua primeira mensagem ao {usernameUserChatting}</a>
                  </div>
                )}
                {messages.map((msg, index) => (
                  <a key={index} ref={lastMessageSend} className="messageSend">
                    {msg}
                  </a>
                ))}
              </div>
              <div className="sendMessageToChatContainer">
                <input
                  className="sendMessageToChatInput"
                  type="text"
                  value={messageInput}
                  onKeyDown={handleEnterInputMessage}
                  onChange={(e) => {
                    setMessageInput(e.target.value);
                  }}
                  onKeyUp={(e) => {
                    if (e.key === "Enter" && e.target.value.length > 0) {
                      setMessageInput(e.target.value);
                      sendMessage();
                      setIsFirstMessage(false);
                    }
                  }}
                />
                <img
                  className="sendMessageIcon"
                  src="/img/send-message-icon.svg"
                  onClick={sendMessage}
                />
              </div>
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
