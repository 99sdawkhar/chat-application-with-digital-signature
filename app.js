//require the express module
const express = require("express");
const app = express();
const dateTime = require("simple-datetime-formater");
const bodyParser = require("body-parser");
const PromiseA = require('bluebird').Promise;
// const chatRouter = require("./route/chatroute");
const keypair = require('./helper/generateTwoWayKeys');
const digitalSigning = require('./helper/digitalSigning');

// const loginRouter = require("./route/loginRoute");

//require the http module
const http = require("http").Server(app);

// require the socket.io module
const io = require("socket.io")

const port = 5000;

//bodyparser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

//routes
// app.use("/chats", chatRouter);
// app.use("/login", loginRouter);

//set the express.static middleware
app.use(express.static(__dirname + "/public"));

//integrating socketio
socket = io(http, { cors: {origin: "*"}});

//database connection
const Chat = require("./models/Chat");
const connect = require("./config/dbconnect");

// app.post('/messages', async (req, res) => {
//   try {
//     let msg = req.body.message;
//     let signature;
//     let unsigned = req.body.unsigned;
//     let alter = req.body.alter;
//     // console.log(unsigned);
//     // console.log(alter);
//     if (unsigned === 'false' && alter === 'false') {
//       const data = digitalSigning.encryptSign(msg);
//       msg = data.enc;
//       signature = data.sig;
//     }
//     // console.log(signature);
//     let chatMessage = new Chat({ message: msg, sender: "Anonymous", signature: signature, unsigned: unsigned, alter: alter });

//     var savedMessage = chatMessage.save();
//     res.sendStatus(200);
//     console.log('Message Posted')
//   }
//   catch (error){
//     res.sendStatus(500);
//     return console.log('error',error);
//   }
// })

//setup event listener
socket.on("connection", socket => {
  // Fetch All data from db and broadcast message to everyone in port:5000 except yourself.
    // connectdb.then(db => {
      // let data = Chat.find({ message: "Anonymous" });
      Chat.find({}).then(chats  =>  {
        const decryptedData = chats.map((chat) => {
          let unsignedValue;
          let altered = '';
          if (chat.unsigned === true || chat.alter === true) {
            let decyptedMessage = chat.message.toString('utf8');
            if (chat.alter === true) {
              altered = 'Compromised ';
              decyptedMessage =   `I'm Altering this Message ${decyptedMessage}`
            }
            unsignedValue = 'Not Secure ';

            const newData = {
              decyptedMessage: decyptedMessage,
              sender: chat.sender,
              unsigned: unsignedValue,
              alter: altered,
              createdAt: chat.createdAt
            }
            // console.log('Decryped Not Secure', newData);
            return newData;
          } else {
            unsignedValue = 'Secure ';
            const message = chat.message;
            const signature = chat.signature;
            const data2 = digitalSigning.verifyAndDecrypt(message, signature);
            const newData = {
              decyptedMessage : data2.decyptedMessage.toString('utf8'),
              sender: chat.sender,
              unsigned: unsignedValue,
              alter: altered,
              createdAt: chat.createdAt
            }
            // console.log('Decryped Secure',newData);
            return newData;
          }
        });
        // console. log('Decryped Secure',decryptedData);
        socket.broadcast.emit("output-messages", decryptedData);
        socket.emit("output-messages", decryptedData);
        // socket.emit("received", decryptedData);
        // res.json(decryptedData);
      });
  // });
  // sendStatus = (s) => {
  //   socket.emit('status', s);
  // }

  console.log("user connected");
  
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  // Handle Input
  // get data from submit and add to db
  socket.on("chat message", (getData) => {
      let message = getData.message
      const unsigned = getData.unsigned
      const alter = getData.alter
      let signature
      // console.log('unsigned',unsigned);
      // console.log('alter',alter);
      if (unsigned === true || alter === true) {
        //   console.log('unsigned Inside',unsigned);
        // console.log('alter Inside',alter);
        // encMessage = message
        // console.log('Inside',message);
      } else {
        const data = digitalSigning.encryptSign(message);
        message = data.enc;
        signature = data.sig;
        // console.log('encMessage ',message)
        // console.log('signature', signature)
      }
      //save chat to the database
      connect.then(db => {
      console.log("connected correctly to the server to save data");
      let chatMessage = new Chat({ message: message, sender: "Anonymous", signature: signature,  unsigned: unsigned, alter: alter });
        chatMessage.save().then(() => {
          // console.log('chatMessage   ', chatMessage);
          
          // After saving data decrypt it on clients End
            const getMessage = chatMessage.message
            const getSender = chatMessage.sender
            const getSignature = chatMessage.signature
            const getUnsigned = chatMessage.unsigned
            const getAlter = chatMessage.alter
            const createdAt = chatMessage.createdAt
            // return;  
            // const decryptedData = chats.map((chat) => {
              // return
            let unsignedMessage;
            let alterMessage = '';
            let newData;
            if (getUnsigned === true || getAlter === true) {
              let decyptedMessage = getMessage.toString('utf8');
              if (getAlter === true) {
                alterMessage = 'Compromised ';
                decyptedMessage =   `I'm Altering this Message ${decyptedMessage}`
              }
              // console.log('message message   ' ,getMessage)
              unsignedMessage = 'Not Secure ';
              newData = {
                decyptedMessage,
                sender: getSender,
                unsigned: unsignedMessage,
                alter: alterMessage,
                createdAt: createdAt
              }
              // console.log('Decryped Not Secure', newData);
            } else {
              unsignedMessage = 'Secure ';
              // console.log('message message   ' ,getMessage)
              // console.log('signature signature   ',getSignature)
              const data2 = digitalSigning.verifyAndDecrypt(getMessage, getSignature);
              newData = {
                decyptedMessage : data2.decyptedMessage.toString('utf8'),
                sender: getSender,
                unsigned: unsignedMessage,
                alter: alterMessage,
                createdAt: createdAt
              }
              // console.log('Decryped Secure',newData);
            }
            // });
            // console. log('Decryped Secure',newData);
            socket.broadcast.emit("message", newData);
            socket.emit("message", newData);
            // socket.emit("received", decryptedData);
            // res.json(decryptedData);
        })
      
        // sendStatus({
        //   successMessage: 'Message sent.',
        //   clear: true
        // })

      });
    // }
  });

  // socket.on('clear',() => {

  // })

});

// To send data only once
// let send = 0;
// if (send == 0) {
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
