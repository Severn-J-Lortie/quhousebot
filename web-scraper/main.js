const { Firestore } = require('./Firestore');
const { DatasourceUpdater } = require('./DatasourceUpdater');
const { AxonProperty } = require('./datasources/AxonProperty');
const { FrontenacProperty } = require('./datasources/FrontenacProperty');
const { LimestoneProperty } = require('./datasources/LimestoneProperty');
const { PanadewProperty } = require('./datasources/PanadewProperty');
const { QueensAccomodationListingService } = require('./datasources/QueensAccommodationListingService');
const { DataEntry } = require('./DataEntry');

async function main()
{
  const firestore = new Firestore();
  const datasources = [
    new AxonProperty(),
    new FrontenacProperty(),
    new LimestoneProperty(),
    new PanadewProperty(),
    new QueensAccomodationListingService(),
  ];
  const datasourceUpdater = new DatasourceUpdater(datasources, firestore);
  datasourceUpdater.startLoop();
}
main();