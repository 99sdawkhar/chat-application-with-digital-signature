'use strict';

const PromiseA = require('bluebird').Promise;
const fs = PromiseA.promisifyAll(require('fs'));
let path = require('path');
const ursa = require('ursa-purejs');
const mkdirp = require('mkdirp')
const mkdirpAsync = PromiseA.promisifyAll(require('mkdirp'));

const keypair = (pathname) => {
  let key = ursa.generatePrivateKey(1024, 65537);
  const privpem = key.toPrivatePem();
  const pubpem = key.toPublicPem();
  const privkey = path.join(pathname, 'privkey.pem');
  const pubkey = path.join(pathname, 'pubkey.pem');

  return mkdirpAsync(pathname).then(function () {
    return PromiseA.all([
      fs.writeFileAsync(privkey, privpem, 'ascii')
    , fs.writeFileAsync(pubkey, pubpem, 'ascii')
    ]);
  }).then(function () {
    return key;
  });
}

// PromiseA.all([
//   keypair('bob')
// , keypair('alice')
// ]).then(function (keys) {
//   console.log('generated %d keypairs', keys.length);
// });

module.exports = keypair;