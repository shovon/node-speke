var SPEKE = require('./index');
var assert = require('assert');

describe('SPEKE', function () {
  it('should allow two hosts, Alice and Bob, to generate the same shared secret', function () {
    var password = 'keyboardcat';

    var alice = SPEKE.getSPEKE('modp5');
    var bob = SPEKE.getSPEKE('modp5');
    
    alice.generateKeys(password);
    bob.generateKeys(password);

    var alice_secret = alice.computeSecret(bob.getPublicKey(), null, 'hex');
    var bob_secret = bob.computeSecret(alice.getPublicKey(), null, 'hex');

    assert(alice_secret.length > 1);
    assert(alice_secret === bob_secret);
  });
});
