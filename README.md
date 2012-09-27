### socket-login-demo

This is just a little demo of using socket.io to perform user authentication and to deliver content.

I used dojo to do all of the ui stuff on the client.

It requires redis for use as a session store, and since it is a demo users are not persisted and are just stored in a javascript object.

By default there is one user:

login: jimmy
password: letmein
