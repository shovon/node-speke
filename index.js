var crypto = require('crypto');
var bigint = require('bigint');

module.exports = module.exports.createSPEKE = SPEKE;
function SPEKE(sizeOrKey, encoding) {
  if (!(this instanceof SPEKE)) {
    return new SPEKE(sizeOrKey, encoding);
  }

  if (typeof sizeOrKey === 'number') {
    // The actual Node.js crypto's Diffie-Hellman implementation will never be
    // used. Only its prime number generator will be of use.
    var dh = crypto.createDiffieHellman(sizeOrKey, encoding);
    this._prime = dh.getPrime();
  } else {
    this._prime = sizeOrKey;
  }
}

SPEKE.prototype.generateKeys = function (password, algorithm) {
  algorithm = algorithm || 'md5';

  var primebigint = bigint.fromBuffer(this._prime);

  // Create the generator.
  var hash = crypto.createHash(algorithm);
  hash.update(password);
  var h = hash.digest();
  this._generator =
    bigint.fromBuffer(h).powm(bigint('2'), primebigint);

  // Create the private key.
  this._privateKey = crypto.randomBytes(this._prime.length);

  // Create the public key.
  this._publicKey = this._generator
    .powm(bigint.fromBuffer(this._privateKey), primebigint);

  return this.getPublicKey();
};

SPEKE.prototype.computeSecret = function (other_public_key, input_encoding, output_encoding) {
  if (input_encoding) {
    other_public_key = new Buffer(other_public_key, input_encoding);
  }
  var secret = bigint.fromBuffer(other_public_key)
    .powm(bigint.fromBuffer(this._privateKey), bigint.fromBuffer(this._prime));

  var buf = secret.toBuffer();
  if (output_encoding) { return buf.toString(output_encoding); }
  return buf;
};

SPEKE.prototype.getPrime = function (encoding) {
  var buf = this._prime;
  if (encoding) { return buf.toString(encoding); }
  return buf;
};

SPEKE.prototype.getGenerator = function (encoding) {
  var buf = this._generator.toBuffer();
  if (encoding) { return buf.toString(encoding); }
  return buf;
};

SPEKE.prototype.getPublicKey = function (encoding) {
  var buf = this._publicKey.toBuffer();
  if (encoding) { return buf.toString(encoding); }
  return buf;
};

SPEKE.prototype.getPrivateKey = function (encoding) {
  var buf = this._privateKey.toBuffer();
  if (encoding) { return buf.toString(encoding); }
  return buf;
};

SPEKE.getSPEKE = function (group_name) {
  var prime = crypto.getDiffieHellman(group_name).getPrime();
  return new SPEKE(prime);
};
