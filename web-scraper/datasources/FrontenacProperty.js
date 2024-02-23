const { WebDataSource } = require('../WebDataSource');
const { DataEntry } = require('../DataEntry');
const config = require('../config');
const { JSDOM } = require('jsdom');
const { calculatePerPersonPrice } = require('../utils');
const fs = require('node:fs');
class FrontenacProperty extends WebDataSource
{
  constructor()
  {
    super(config.dataSources.frontenacProperty.url, config.dataSources.frontenacProperty.numBedrooms, "Frontenac");
    this.selectors = config.dataSources.frontenacProperty.selectors;
  }
  async getData()
  {
    console.log('--- Frontenac ---');
    console.log('Fetching latest listings....');
    const dataEntries = [];
    for (const bedroomCount of this.numBedrooms)
    {
      const listings = await fetch(this.url, {
        "headers": {
          "accept": "application/json, text/javascript, */*; q=0.01",
          "accept-language": "en-US,en;q=0.9",
          "cache-control": "no-cache",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "pragma": "no-cache",
          "sec-ch-ua": "\"Google Chrome\";v=\"119\", \"Chromium\";v=\"119\", \"Not?A_Brand\";v=\"24\"",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": "\"Windows\"",
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-requested-with": "XMLHttpRequest"
        },
        "referrer":`https://www.frontenacproperty.com/properties/stud/?bedrooms=${bedroomCount}&sort=availability&order=ASC`,
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": `bedrooms=${bedroomCount}&sort=availability&order=ASC&page=1&columnClass=col-sm-6+col-md-4&browse_section=stud&action=ajax_request`,
        "method": "POST",
        "mode": "cors",
        "credentials": "omit" 
      });
      const listingsResponse = await listings.json();
      const housingGridDOM = new JSDOM(listingsResponse.content.results);
      const houseCards = housingGridDOM.window.document.querySelector('body').children;
      for (let i = 0; i < houseCards.length; i++)
      {
        const houseCard = houseCards[i];
        const leaseStart = houseCard.querySelector(this.selectors.cardLeaseStart).innerHTML;
        if (leaseStart.toLowerCase().includes('rented'))
          continue;
        const address = houseCard.querySelector(this.selectors.cardAddress).innerHTML;
        const link = houseCard.querySelector(this.selectors.cardLink).href;
        let pricePerBed = houseCard.querySelector(this.selectors.cardPricePerBed).innerHTML;
        if (pricePerBed.includes('$'))
          pricePerBed = pricePerBed.substring(1);
        pricePerBed = calculatePerPersonPrice(bedroomCount, Number(pricePerBed));
        dataEntries.push(new DataEntry({
          address,
          link,
          pricePerBed,
          leaseStart,
          numBedrooms: bedroomCount,
          sourceName: this.name
        }));
      }
    }
    console.log(`Found ${dataEntries.length} candidates`);
    return dataEntries;
  }
}
module.exports.FrontenacProperty = FrontenacProperty;