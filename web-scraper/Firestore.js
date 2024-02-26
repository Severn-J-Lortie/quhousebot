const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { computeSHA256Hash } = require('./utils');

class Firestore
{
  constructor()
  {
    this.db = {};
    this.hashes = [];
    this.init();
  }

  /**
   * Initialize the Firestore database. Assumes the path to the admin credentials is stored in an environment variable called
   * GOOGLE_APPLICATION_CREDENTIALS
   */
  init()
  {
    const serviceAccount = require(process.env['GOOGLE_APPLICATION_CREDENTIALS']);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    this.db = getFirestore();
    this.db.settings({ ignoreUndefinedProperties: true })
  }

  /**
   * Only write the document reference to Firestore if it does not exist.
   * @param {object} dataEntry The dataEntry of the listing to write
   * @returns {object} An object with the form { written: true|false, reason: '' }
   */
  async writeIfNotExist(dataEntry)
  {
    const hash = this.makeHash(dataEntry);
    if (!this.isNewHash(hash))
      return { written: false, reason: 'CACHE' };
    const documentReference = this.db.collection('houses').doc(hash);
    const snapshot = await documentReference.get();
    if (snapshot.exists)
      return { written: false, reason: 'FIRESTORE' };
    await documentReference.set(dataEntry.toObject());
    return { written: true, reason: '' };
  }

  /**
   * Check if the hash is in the cache and add it if it is not
   * @param {string} hash 
   * @returns {boolean} True if the hash is novel, false otherwise
   */
  isNewHash(hash)
  {
    if (this.hashes.find(h => h === hash))
      return false;
    this.hashes.push(hash);
    return true;
  }

  /**
   * Returns a hash of the provided dataEntry based on its price, beds, and address
   * @param {object} dataEntry The DataEntry
   * @returns {string} The hash
   */
  makeHash(dataEntry)
  {
    const unwrapToString = (value) => value ? value : '';
    const hashString = unwrapToString(dataEntry.address) + unwrapToString(dataEntry.pricePerBed) + unwrapToString(dataEntry.numBedrooms);
    const hash = computeSHA256Hash(hashString);
    return hash;
  }
}
module.exports.Firestore = Firestore;