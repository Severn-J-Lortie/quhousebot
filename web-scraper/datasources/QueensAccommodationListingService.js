const { WebDataSource } = require('../WebDataSource');
const { DataEntry } = require('../DataEntry');
const config = require('../config');
const { JSDOM } = require('jsdom');
const { calculatePerPersonPrice } = require('../utils');
const fs = require('node:fs');
class QueensAccomodationListingService extends WebDataSource
{
  constructor()
  {
    const quConfig = config.dataSources.queensAccommodationListingService;
    super(quConfig.url, quConfig.numBedrooms, "Queen's Accomodation Listing Service");
    this.quConfig = quConfig;
  }
  async getData()
  {
    console.log('--- Queen\'s Accomodation Listing Service ---');
    console.log('Fetching entries....');
    const dataEntries = [];
    for (const bedroomCount of this.numBedrooms)
    {
      const housingListFilteredResponse = await fetch(`${this.url}&number_of_rooms=${bedroomCount}`);
      const housingListFiltered = (await housingListFilteredResponse.json())[0];
      if (housingListFiltered.includes(this.quConfig.noResultsReturnedText))
        continue;

      const housingListFilteredInTable = `<table>${housingListFiltered}</table>`;
      const responseDom = new JSDOM(housingListFilteredInTable);
      const table = responseDom.window.document.getElementsByTagName('table')[0];
      for (let i = 0; i < table.rows.length; i++)
      {
        const tableRow = table.rows.item(i);
        const tableRowId = tableRow.dataset.id;
        /*
        Current field mapping
        td[1] --> Address
        td[2] --> Listing type
        td[3] --> Lease length
        td[4] --> Bedroom count
        td[5] --> Lease start
        td[6] --> Empty
        td[7] --> Rent total
        span inside contact info td --> id === row id has landlord name
        */
        const tableRowDataEntries = tableRow.getElementsByTagName('td');
        const dataEntry = new DataEntry({
          address: tableRowDataEntries[1].innerHTML,
          pricePerBed: calculatePerPersonPrice(bedroomCount, Number(tableRowDataEntries[7].innerHTML.substring(1))),
          landlord: responseDom.window.document.getElementById(tableRowId).innerHTML,
          leaseStart: tableRowDataEntries[5].innerHTML,
          leaseType: tableRowDataEntries[2].innerHTML,
          link: responseDom.window.document.getElementById(`detail${tableRowId}`).href,
          numBedrooms: bedroomCount,
          sourceName: this.name
        });
        dataEntries.push(dataEntry);
      }
    }
    console.log(`Found ${dataEntries.length} candidates`);
    return dataEntries;
  }
}
module.exports.QueensAccomodationListingService = QueensAccomodationListingService;