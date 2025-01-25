import logo from "./logo.svg";
import { useState, useEffect } from "react";
import axios from "axios";
// import path from "path-browserify";
// import fs from "fs";
import imageCompression from "browser-image-compression";
import "./App.css";

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
      .catch((error) => {
        setIncorrectLoginError(error.response.data);
        return setIncorrectLogin(true);
      });
    if (login) {
      onLoginSuccess(login.data);
      setIncorrectLogin(false);
      return;
    }
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
          />
          <h3>Senha</h3>
          <input
            className={`loginInputs ${incorrectLogin ? "incorrectInput" : ""}`}
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
    } catch (error) {
      // console.log(error.response.data);
      return setError(`${error.response.data}`);
    }
  };

  // login com imagem atualizada do usuário
  useEffect(() => {
    profileImageUpdated();
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
    // if (usernameUpdate === username) {
    //   setError("Este username já existe.");
    //   return console.log("Este username já existe");
    // }
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
      // alert("Informações atualizadas com sucesso!");
      try {
        await axios.put(
          `http://localhost:8000/services/user/update/${userId}`,
          {
            username: usernameUpdate,
            password: passwordUpdate,
            // profileImage:
          }
        );
      } catch (error) {
        setIncorrectUsername(true);
        setUpdateLoading(false);
        return setError(`${error.response.data}`);
      }

      // .catch((error) => {
      //   setIncorrectLoginError(error.response.data);
      //   // return setIncorrectLogin(true);
      //   return;
      // });
      // if (updateUser) {
      //   console.log(updateUser.data);
      //   onLoginSuccess(updateUser.data);
      //   setIncorrectLogin(false);
      //   return;
      // }
      // App.setUser(updateUser.data);
      // setTimeout(async () => {
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
      // }, 1000);
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
          <div className="userChatsContainer">
            <div className="userCreateChatsContainer">
              <div className="userCreateChatsDescriptionContainer">
                <a className="descriptionCreateChats">Criar Conversa</a>
                <a className="descriptionCreateChats">Criar Grupo</a>
              </div>
              <div className="userCreateIconsContainer">
                <a className="iconCreateChats">b</a>
                <a className="iconCreateChats">c</a>
              </div>
            </div>
          </div>
        </div>
        <div className="rightContainerChat"></div>
      </div>
    </div>
  );
}

export default App;
