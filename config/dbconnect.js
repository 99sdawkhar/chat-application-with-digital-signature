const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

const url = "mongodb+srv://shubham:123@cluster0.skg95.mongodb.net/simple-chat?retryWrites=true&w=majority";

const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log("Db Connected"))
      .catch((err ) => console.log("Db Error", err));

module.exports = connect;
