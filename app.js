const express = require("express");
const app = express();
const dateTime = require("simple-datetime-formater");
const bodyParser = require("body-parser");
const PromiseA = require('bluebird').Promise;
const keypair = require('./helper/generateTwoWayKeys');
const digitalSigning = require('./helper/digitalSigning');
const dotenv = require('dotenv');
//require the http module
const http = require("http").Server(app);

// environmental path
dotenv.config({ path: './.env'})

// require the socket.io module
const io = require("socket.io")

const port = process.env.PORT;

//bodyparser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//set the express.static middleware
app.use(express.static(__dirname + "/public"));

//integrating socketio
socket = io(http, { cors: {origin: "*"}});

//database connection
const connect = require("./config/dbconnect");
const users = {}

//setup event listener
socket.on("connection", socket => {
  // Fetch All data from db and broadcast message to everyone in port:5000 except yourself.
      Chat.find({}).then(chats  =>  {
        const decryptedData = chats.map((chat) => {
          let unsignedValue;
          let altered = '';
          if (chat.unsigned === true || chat.alter === true) {
            let decyptedMessage = chat.message.toString('utf8');
            if (chat.alter === true) {
              altered = 'Compromised ';
              decyptedMessage =   `Compromised message found`
            }
            unsignedValue = 'Not secure ';

            const newData = {
              decyptedMessage: decyptedMessage,
              sender: chat.sender,
              unsigned: unsignedValue,
              alter: altered,
              createdAt: chat.createdAt
            }
            return newData;
          } else {
            unsignedValue = 'Secure ';
            const message = chat.message;
            const signature = chat.signature;
            const data2 = digitalSigning.verifyAndDecrypt(message, signature);
            let decryptedData = data2.decyptedMessage.toString('utf8')
            if (data2.verificationFailed) {
              decryptedData = 'Compromised message found'
              unsignedValue = 'Not secure ';
              console.log(data2.verificationFailed);
            }
            const newData = {
              decyptedMessage : decryptedData,
              sender: chat.sender,
              unsigned: unsignedValue,
              alter: altered,
              createdAt: chat.createdAt
            }
            return newData;
          }
        });
        socket.broadcast.emit("output-messages", decryptedData);
        socket.emit("output-messages", decryptedData);
        // console.log(decryptedData)
      });

  // console.log("user connected");
  socket.on("new-user", (name) => {
    users[socket.id] = name
    console.log("user connected", name.name);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // get data from submit and add to db
  socket.on("chat message", (getData) => {
    const name = getData.name
    let message = getData.message
    const unsigned = getData.unsigned
    const alter = getData.alter
    let signature
    if (unsigned === true || alter === true) {
    } else {
      const data = digitalSigning.encryptSign(message);
      message = data.enc;
      signature = data.sig;
    }
    //save chat to the database
    connect.then(db => {
    console.log("connected correctly to the server to save data");
    let chatMessage = new Chat({ message: message, sender: name, signature: signature,  unsigned: unsigned, alter: alter });
      chatMessage.save().then(() => {
        // After saving data decrypt it on clients End
        const getMessage = chatMessage.message
        const getSender = chatMessage.sender
        const getSignature = chatMessage.signature
        const getUnsigned = chatMessage.unsigned
        const getAlter = chatMessage.alter
        const createdAt = chatMessage.createdAt
        let unsignedMessage;
        let alterMessage = '';
        let newData;
        if (getUnsigned === true || getAlter === true) {
          let decyptedMessage = getMessage.toString('utf8');
          if (getAlter === true) {
            alterMessage = 'Compromised ';
            decyptedMessage =   `Compromised message found`
          }
          unsignedMessage = 'Not secure ';
          newData = {
            decyptedMessage,
            sender: getSender,
            unsigned: unsignedMessage,
            alter: alterMessage,
            createdAt: createdAt
          }
        } else {
          unsignedMessage = 'Secure ';
          const data2 = digitalSigning.verifyAndDecrypt(getMessage, getSignature);
          let decryptedData = data2.decyptedMessage.toString('utf8')
          if (data2.verificationFailed) {
            decryptedData = 'Compromised message found'
            unsignedMessage = 'Not secure ';
            console.log(data2.verificationFailed);
          }
          newData = {
            decyptedMessage : decryptedData,
            sender: getSender,
            unsigned: unsignedMessage,
            alter: alterMessage,
            createdAt: createdAt
          }
        }
        socket.broadcast.emit("message", newData);
        socket.emit("message", newData);
      })
    });
  });
});

// To send data only once
// let send = 0;
// if (send === 0) {
//   // Generate Key Pairs For Sender and Receiver
//   PromiseA.all([
//     keypair('bob')
//   , keypair('alice')
//   ]).then(function (keys) {
//     console.log('generated %d keypairs', keys.length);
//   });
//   send = 1;
// }

http.listen(port, () => {
  console.log("Running on Port: " + port);
});
