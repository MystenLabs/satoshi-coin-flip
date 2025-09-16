const bls = require("@noble/bls12-381");
const hkdf = require("futoin-hkdf");

class BlsService {
  private SecretKey: any;
  private PublicKey: any;

  // key derivation function (deriving a sk from house's sk)
  constructor() {
    // @todo: keygen source should be coming from .env
    this.SecretKey = this.deriveBLS_SK();
    this.PublicKey = bls.getPublicKey(this.SecretKey);
    console.log("Public Key", this.PublicKey);
  }

  deriveBLS_SK() {
    // initial key material
    const ikm = process.env.SATOSHI_HOME_PRIVATE_KEY!;
    const length = 32;
    const salt = "satoshi";
    const info = "bls-signature";
    const hash = "SHA-256";
    const derived_sk = hkdf(ikm, length, { salt, info, hash });
    return Uint8Array.from(derived_sk);
  }

  async sign(msg: String): Promise<Uint8Array> {
    const sig = await bls.sign(msg, this.SecretKey);
    return sig;
  }

  async verify(msg: string, sig: Buffer) {
    const isValid = await bls.verify(
      Uint8Array.from(sig),
      msg,
      Uint8Array.from(this.PublicKey)
    );
    return isValid;
  }
}

export default BlsService;
