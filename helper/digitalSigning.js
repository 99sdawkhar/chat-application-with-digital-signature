'use strict';

var fs = require('fs');
var ursa = require('ursa-purejs');
var msg;
var sig;
var enc;
var rcv;


// msg = "IT’S A SECRET TO EVERYBODY.";

const encryptSign = (msg) => {
  // Bob has his private and Alice's public key
  var privkeyBob = ursa.createPrivateKey(fs.readFileSync('./bob/privkey.pem'));
  var pubkeyAlice = ursa.createPublicKey(fs.readFileSync('./alice/pubkey.pem'));
  
  console.log('Encrypt with Alice Public; Sign with Bob Private');
  enc = pubkeyAlice.encrypt(msg, 'utf8', 'base64');
  sig = privkeyBob.hashAndSign('sha256', msg, 'utf8', 'base64');
  // console.log('encrypted', enc, '\n');
  // console.log('signed', sig, '\n');
  return {
    enc: enc,
    sig: sig
  }
}

const verifyAndDecrypt = (enc, sig) => {

  // Alice has her private and Bob's public key
  var privkeyAlice = ursa.createPrivateKey(fs.readFileSync('./alice/privkey.pem'));
  var pubkeyBob = ursa.createPublicKey(fs.readFileSync('./bob/pubkey.pem'));

  console.log('Decrypt with Alice Private; Verify with Bob Public');
  const decyptedMessage = privkeyAlice.decrypt(enc, 'base64', 'utf8');
  // if (msg !== rcv) {
  //   throw new Error("invalid decrypt");
  // }

  // Converting Data to hash/buffer again
  rcv = new Buffer.from(decyptedMessage).toString('base64');

  if (!pubkeyBob.hashAndVerify('sha256', rcv, sig, 'base64')) {
    // throw new Error("invalid signature");
    console.log('Signature is Invalid. Data is Compromised');
  } else {
    console.log('Signature is Valid. Data is Secure');
  }
  // console.log('decrypted', decyptedMessage, '\n');
  return {
    rcv: rcv,
    decyptedMessage: decyptedMessage
  }
}
// const data = encryptSign('Hello')
// console.log('ENcy Data', data.enc);
// console.log("signn ",data.sig);
// console.log(verifyAndDecrypt(data.enc, data.sig));


module.exports.encryptSign = encryptSign
module.exports.verifyAndDecrypt = verifyAndDecrypt
// module.exports = { encryptSign, verifyAndDecrypt}