# speke

An incredibly simple balanced password-authenticated key exchange (PAKE) for Node.js.

[![Build Status](https://travis-ci.org/shovon/node-speke.svg)](https://travis-ci.org/shovon/node-speke)

This library is an implementation of [SPEKE](http://en.wikipedia.org/wiki/SPEKE_(cryptography)). Meant to reflect Node.js crypto's Diffie-Hellman API.

## Example

```javascript
// Our password.
var password = 'keyboardcat';

// Prepares an object for both Alice and Bob, with a prime value set.
var alice = SPEKE.getSPEKE('modp5');
var bob = SPEKE.getSPEKE('modp5');

// Initialize the generator, based on the password, as well as create the
// public and private keys.
alice.generateKeys(password);
bob.generateKeys(password);

// Compute the shared secret, with Alice using Bob's public key, and Bob using
// Alice's public key.
var alice_secret = alice.computeSecret(bob.getPublicKey(), null, 'hex');
var bob_secret = bob.computeSecret(alice.getPublicKey(), null, 'hex');

// We should now have the same shared secret.
assert(alice_secret.length > 1);
assert(alice_secret === bob_secret);
```

## API

The API is 100% compatible with [Node.js Crypto's Diffie-Hellman API](http://nodejs.org/api/crypto.html#crypto_class_diffiehellman), except that the `generateKeys` method **absolutely** requires a password as the first parameter, and the second parameter is an optional encoding type, which can either be set to `'binary'`, `'hex'`, or `'base64'`. At the absence of the latter parameter, a buffer is returned for the public key.
