const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    sender: {
      type: String
    },
    message: {
      type: Buffer,
    },
    signature: {
      type: String,
      default: ''
    },
    unsigned: {
      type: Boolean,
      default: false
    },
    alter: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

let Chat = mongoose.model("theChat", chatSchema);

module.exports = Chat;
