'use strict';

var fs = require('fs');
var ursa = require('ursa-purejs');
var sig;
var enc;
var rcv;

const encryptSign = (msg) => {
  // Bob has his private and Alice's public key
  var privkeyBob = ursa.createPrivateKey(fs.readFileSync('./bob/privkey.pem'));
  var pubkeyAlice = ursa.createPublicKey(fs.readFileSync('./alice/pubkey.pem'));
  
  console.log("Encrypt with Receiver's Public; Sign with Sender's Private");
  enc = pubkeyAlice.encrypt(msg, 'utf8', 'base64');
  sig = privkeyBob.hashAndSign('sha256', msg, 'utf8', 'base64');
  return {
    enc: enc,
    sig: sig
  }
}

const verifyAndDecrypt = (enc, sig) => {
  try {
    // Alice has her private and Bob's public key
    var privkeyAlice = ursa.createPrivateKey(fs.readFileSync('./alice/privkey.pem'));
    var pubkeyBob = ursa.createPublicKey(fs.readFileSync('./bob/pubkey.pem'));

    let verificationFailed = false;
    console.log("Decrypt with Receiver's Private; Verify with Sender's Public");
    const decyptedMessage = privkeyAlice.decrypt(enc, 'base64', 'utf8');

    // Converting Data to hash/buffer again
    rcv = new Buffer.from(decyptedMessage).toString('utf8');
    let rcvbase64 = new Buffer.from(decyptedMessage).toString('base64');

    if (decyptedMessage !== rcv) {
      verificationFailed = true;
      // throw new Error("invalid decrypt");
    }
    if (!pubkeyBob.hashAndVerify('sha256', rcvbase64, sig, 'base64')) {
      // throw new Error("invalid signature");
      console.log('Signature is Invalid. Data is Compromised');
      verificationFailed = true;
    } else {
      console.log('Signature is Valid. Data is Secure');
    }
    // console.log('decrypted', decyptedMessage, '\n');
    return {
      rcv: rcv,
      decyptedMessage: decyptedMessage,
      verificationFailed: verificationFailed
    }
  } catch(error) {
    console.log('Error: ',error);
    return {
      decyptedMessage: '',
      verificationFailed: true
    }
  }
}

module.exports.encryptSign = encryptSign
module.exports.verifyAndDecrypt = verifyAndDecrypt