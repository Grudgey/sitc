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
    console.log(
      "about to post login info - " +
        credentials.username +
        " and " +
        credentials.password
    );
    console.log(e.nativeEvent.submitter.name);
    props.authenticate(credentials, e.nativeEvent.submitter.name);
  }

  return (
    <div className="login-div">
      <img className="mb-3" src="./images/sitc-logo.png" width="200px" alt="" />

      <h1 className="">Please login to the Studio</h1>
      <form className="form-signin" onSubmit={handleLogin}>
        <div>
          <label for="inputEmail" className="visually-hidden">
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
          <label for="inputPassword" className="visually-hidden">
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
        {/* <button type="submit" name="register">Register</button> */}
        <button
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
