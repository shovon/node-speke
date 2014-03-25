# speke

An incredibly simple balanced password-authenticated key exchange (PAKE) for Node.js.

This library is an implementation of SPEKE. Meant to reflect Node.js crypto's Diffie-Hellman API.

There are two types of PAKEs: balanced and augmented. An example of balanced would be SPEKE, and an example of augmented would be SRP. Here is a comparison between the two afforementioned key exchanges:

| | SPEKE | SRP |
| --- | --- | --- |
| **Pro** | Neither host is required to send passwords over the wire | Registration possible without storing passwords in plain text |
| **Con** | Passwords need to be stored in order to register users, and authenticate registered users that want to log in | Password hash sent over the wire |

The SRP protocol allows the server to authenticate the client, without it ever sending the plain text password over the wire. However, the client is required to send a "verifier" to the server when registering. Unfortunately, though, the "verifier" has been *derived* from a password, and hence it can be exposed using a brute force attack.

SPEKE on the other hand requires that both the client and the server know the password in advance. The password is therefore never sent across the wire. SPEKE can thus be used in a "two-factor" registration system, where a small password is generated on the fly, and can then be retrieved by a user somehow. Using the password, the client and the server will establish a secure channel via SPEKE. Afterwards, the client can securely send the verfier to the server.

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

## API

The API is 100% compatible with [Node.js Crypto's Diffie-Hellman API](http://nodejs.org/api/crypto.html#crypto_class_diffiehellman), except that the `generateKeys` method **absolutely** requires a password as the first parameter, and the second parameter is an optional encoding type, which can either be set to `'binary'`, `'hex'`, or `'base64'`.