const { Firestore } = require('./Firestore');
const { computeSHA256Hash } = require('./utils');
const config = require('./config');
class DatasourceUpdater
{
  /**
   * Create a new DatasourceUpdater instance
   * @param {object[]} datasources List of Datasources to pull from
   */
  constructor(datasources)
  {
    this.datasources = this.datasources;
    this.firestore = new Firestore();
  }

  /**
   * Initialize the DatasourceUpdater
   */
  init() {
    this.firestore.init();
    setInterval(this.updateLoop, config.updateInterval);
  }

  /**
   * This method grabs the newest listings from each data source
   * @returns {object} A list of DataEntries representing the results of fetching from each Datasource
   */
  async pullFromDatasources()
  {
    const dataEntries = [];
    for (const datasource of this.datasources)
    {
      console.log(` --- Fetching ${datasource.name} --- `)
      try {
        const newDataEntries = await datasource.getData();
        console.log(`Got ${newDataEntries.length} listings`);
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
    const unwrapToString = (value) => value ? value : '';
    const newDataEntries = await this.pullFromDatasources();
    for (const dataEntry of newDataEntries)
    {
      const hashString = unwrapToString(dataEntry.address) + unwrapToString(dataEntry.pricePerBed) + unwrapToString(dataEntry.numBedrooms);
      const hash = computeSHA256Hash(hashString);
      this.firestore.writeIfNotExist(hash, dataEntry);
    }
  }
}