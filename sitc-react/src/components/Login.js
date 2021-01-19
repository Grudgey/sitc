import React, {useState} from 'react';

function Login(props) {

    const [credentials, setCredentials] = useState({username: "", password: "" });

    const updateCredentials = e => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    function handleLogin(e) {
        e.preventDefault();
        console.log("about to post login info - " + credentials.username + " and " + credentials.password);
    
        props.authenticate(credentials);

      }

    return (<div>
        <h1>Login</h1>
    <form onSubmit={handleLogin}>
      <div>
        <label for="email">Email</label>
        <input onChange={updateCredentials} type="email" name="username" value={credentials.username} />
      </div>
      <div>
        <label for="password">Password</label>
        <input onChange={updateCredentials} type="password" name="password" value={credentials.password}/>
      </div>
      <button type="submit">Register</button>
    </form>
</div>)
}


export default Login;