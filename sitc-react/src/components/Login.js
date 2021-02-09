import React, { useState } from "react";

function Login(props) {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const updateCredentials = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  function handleLogin(e) {
    e.preventDefault();
    props.authenticate(credentials, e.target.name);
  }

  return (
    <div className="login-div">
      <img className="mb-3" src="./images/sitc-logo.png" width="200px" alt="" />

      <h1 className="">Please login to the Studio</h1>
      <form className="form-signin">
        <div>
          <label htmlFor="inputEmail" className="visually-hidden">
            Email
          </label>
          <input
            onChange={updateCredentials}
            placeholder="Email address"
            required
            autoFocus
            id="inputEmail"
            className="form-control top-input"
            type="email"
            name="username"
            value={credentials.username}
          />
        </div>
        <div>
          <label htmlFor="inputPassword" className="visually-hidden">
            Password
          </label>
          <input
            onChange={updateCredentials}
            type="password"
            name="password"
            value={credentials.password}
            id="inputPassword"
            className="form-control bottom-input"
            placeholder="Password"
            required
          />
        </div>
        <button
          onTouchStart={handleLogin}
          onClick={handleLogin}
          className="btn btn-lg btn-dark btn-block"
          type="submit"
          name="register"
        >
          Register
        </button>
        <button
          onTouchStart={handleLogin}
          onClick={handleLogin}
          className="btn btn-lg btn-light btn-block"
          type="submit"
          name="login"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
