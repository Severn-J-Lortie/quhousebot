const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

class Firestore
{
  constructor()
  {
    this.db = {};
    this.hashes = [];
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
    const db = getFirestore();
  }

  /**
   * Only write the document reference to Firestore if it does not exist.
   * @param {string} entryHash The hash of the document to write
   * @returns {boolean} Returns true if the document was written, false otherwise
   */
  async writeIfNotExist(entryHash, data)
  {
    const documentReference = this.db.collection('houses').doc(entryHash);
    const snapshot = await documentReference.get();
    if (snapshot.exists)
      return false;
    await documentReference.set(data);
    return true;
  }

  /**
   * Returns true if the provided hash is not in the cache
   * @param {string} hash The hash
   * @returns {boolean} True if the hash is uniquie, otherwise false
   */
  isNewHash(hash)
  {
    if (this.hashes.find(h => h === hash))
      return false;
    return true;
  }
}
module.exports.Firestore = Firestore;