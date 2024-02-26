const { Firestore } = require('./Firestore');
const { computeSHA256Hash } = require('./utils');
const config = require('./config');
class DatasourceUpdater
{
  /**
   * Create a new DatasourceUpdater instance
   * @param {object[]} datasources List of Datasources to pull from
   */
  constructor(datasources, firestore)
  {
    this.datasources = datasources;
    this.firestore = firestore;
  }

  /**
   * Begin running update very config.updateInterval milliseconds
   */
  startLoop() {
    setInterval(() => this.updateLoop(), config.updateInterval);
    console.log(`Starting update loop with interval of ${config.updateInterval / 1000 / 60 } min`);
  }

  /**
   * This method grabs the newest listings from each data source
   * @returns {object} A list of DataEntries representing the results of fetching from each Datasource
   */
  async pullFromDatasources()
  {
    let dataEntries = [];
    for (const datasource of this.datasources)
    {
      console.log(` --- Fetching ${datasource.name} --- `)
      try {
        const newDataEntries = await datasource.getData();
        console.log(`Got ${newDataEntries.length} listings`);
        dataEntries = dataEntries.concat(newDataEntries);
      }
      catch (error)
      {
        console.log(`${datasource.name} failed to fetch.`, error);
      }
    }
    return dataEntries;
  }

  /**
   * Pull from Datasources, write to Firestore, repeat
   */
  async updateLoop()
  {
    const newDataEntries = await this.pullFromDatasources();
    let writtenCount = 0;
    let cachedCount = 0;
    let alreadyUploadedCount = 0;
    for (const dataEntry of newDataEntries)
    {
      const result = await this.firestore.writeIfNotExist(dataEntry);
      if (result.written)
      {
        writtenCount++;
      }
      else
      {
        if (result.reason === 'CACHE')
          cachedCount++;
        else if (result.reason === 'FIRESTORE')
          alreadyUploadedCount++;
      }
    }
    console.log(`
${writtenCount} entries written to Firestore. 
${cachedCount} rejected due to in-memory cache, ${alreadyUploadedCount} were already in Firestore.
    `);
  }
}
exports.DatasourceUpdater = DatasourceUpdater;