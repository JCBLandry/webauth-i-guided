const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bcrypt = require('bcryptjs')

const db = require('./database/dbConfig.js');
const Users = require('./users/users-model.js');

const server = express();

server.use(helmet());
server.use(express.json());
server.use(cors());

server.get('/', (req, res) => {
  res.send("It's alive!");
});

server.post('/api/register', (req, res) => {
  let user = req.body;
  console.log('password arriving from client', user.password);
  


user.password = bcrypt.hashSync(user.password, 6);

  Users.add(user)
    .then(saved => {
      res.status(201).json(saved);
    })
    .catch(error => {
      res.status(500).json(error);
    });
});

server.post('/api/login', (req, res) => {
  let { username, password } = req.body;


  Users.findBy({ username })
    .first()
    .then(user => {
  
      if (user && bcrypt.compareSync(password, user.password)) {
        res.status(200).json({ message: `Welcome ${user.username}!` });
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
    })
    .catch(error => {
      res.status(500).json(error);
    });
});


//should be protected
// req.header should have the correct username and passowrd
//req.headers.username, req.headers.password
//if incorrect, block

server.get('/api/users', restricted, ( req,  res) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(err => res.send(err));
});


// MIDDLEWARE TO CHECK CREDENTIALS
function restricted(req, res, next) {
  let { username, password } = req.headers;

  if(username && password) {
    Users.findBy({ username })
    .first()
    .then(user => {
      
      // CHECKS IF PASSWORD IS MATCHING PASSWORD IN DB SAVED WHEN REGISTERED
      if (user && bcrypt.compareSync(password, user.password)) {
        next()
      } else {
        res.status(401).json({ message: 'Invalid Credentials' });
      }
      
    })
    .catch(error => {
      res.status(500).json(error);
    });
  } else {
    res.status(400).json({ message: 'please provide valid credentials'})
  }
}

const port = process.env.PORT || 5000;
server.listen(port, () => console.log(`\n** Running on port ${port} **\n`));
