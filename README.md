# speke

An incredibly simple balanced password-authenticated key exchange (PAKE) for Node.js.

[![Build Status](https://travis-ci.org/shovon/node-speke.svg)](https://travis-ci.org/shovon/node-speke)

This library is an implementation of [SPEKE](http://en.wikipedia.org/wiki/SPEKE_(cryptography)). Meant to reflect Node.js crypto's Diffie-Hellman API.

There are two types of PAKEs: balanced and augmented. An example of balanced would be SPEKE, and an example of augmented would be SRP. Here is a comparison between the two afforementioned key exchanges:

| | SPEKE | SRP |
| --- | --- | --- |
| **Pro** | Neither host is required to send passwords over the wire | Registration possible without storing passwords in plain text |
| **Con** | Passwords need to be stored in order to register users, and authenticate registered users that want to log in | Password hash sent over the wire |

The SRP protocol allows the server to authenticate the client, without it ever sending the plain text password over the wire. However, the client is required to send a "verifier" to the server when registering. Unfortunately, though, the "verifier" has been *derived* from a password, and hence it can be exposed using a brute force attack.

SPEKE on the other hand requires that both the client and the server know the password in advance. The password is therefore never sent across the wire. SPEKE can thus be used in a "two-factor" registration system, where a small password is generated on the fly, and can then be retrieved by a user somehow. Using the password, the client and the server will establish a secure channel after the SPEKE handshake. Afterwards, the client can securely send the verfier to the server.

## Example

```javascript
// Our password.
var password = 'keyboardcat';

// Prepares an object for both Alice and Bob, with a prime value set.
var alice = SPEKE.getSPEKE('modp5');
var bob = SPEKE.getSPEKE('modp5');

// Initialize the generator, based on the password, as well as create the
// private and private keys.
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

If you want to implement SRP, then you would simply establish a secure channel, using the shared secret as the password in a cipher (such as AES).

On the client:

```javascript
// Where `params` is the set of parameters used by the Mozilla SRP library,
// salt being a random nonce, identity being a unique identifier that represents
// a user (such as a username, email, etc.) and password represents the password
// that the user will enter, but the server won't know without brute forcing the
// verifier.
var verifier = srp.computeVerifier(params, salt, identity, password);

// Create a helper object to encipher the verifier, before sending it to the
// server.
//
// Do note that the `secret` parameter was generated during the SPEKE handshake.
var cipher = crypto.createCipher(algorithm, secret);

// Encipher the verifier.
var data = cipher.update(verifier);
data.write(cipher.final());

// Send the data to the server.
socket.send(data);
```

And then, on the server:

```javascript
// Let `read` be a synchronous socket stream function (not that any such
// function is available out of the box in Node.js), we will get the enciphered
// verifier from the client
var verifierEnciphered = read();

// Create a decipher object.
var decipher = crypto.createDecipher(algorithm, secret);

// Create a buffer that will store the deciphered verifier
var verifier = cipher.update(verifier);
verifier.write(cipher.final());

// Store the verifier however you want.
```

## API

The API is 100% compatible with [Node.js Crypto's Diffie-Hellman API](http://nodejs.org/api/crypto.html#crypto_class_diffiehellman), except that the `generateKeys` method **absolutely** requires a password as the first parameter, and the second parameter is an optional encoding type, which can either be set to `'binary'`, `'hex'`, or `'base64'`. At the absense of the latter parameter, a buffer is returned for the public key.