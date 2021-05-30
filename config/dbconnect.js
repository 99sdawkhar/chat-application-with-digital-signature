const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const dotenv = require('dotenv');
dotenv.config({ path: './.env'})

const url = process.env.URL;;

const connect = mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log("Db Connected"))
      .catch((err ) => console.log("Db Error", err));

module.exports = connect;
