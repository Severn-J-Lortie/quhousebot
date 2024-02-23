const { WebDataSource } = require('../WebDataSource');
const { DataEntry } = require('../DataEntry');
const config = require('../config');
const jsdom = require('jsdom');
const { calculatePerPersonPrice } = require('../utils');
const fs = require('node:fs');
class PanadewProperty extends WebDataSource
{
  constructor()
  {
    const pnConfig = config.dataSources.panadewProperty;
    super(pnConfig.url, pnConfig.numBedrooms, "Panadew");
    this.pnConfig = pnConfig;
    this.selectors = pnConfig.selectors;
  }
  async getData()
  {
    console.log('--- Panadew ---');
    console.log('Fetching newest listings...');
    const dataEntries = [];
    const bedroomCount = this.numBedrooms.sort((a, b) => a - b)[0];
    const listings = await fetch(this.url, {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "no-cache",
        "content-type": "application/x-www-form-urlencoded",
        "pragma": "no-cache",
        "sec-ch-ua": "\"Not A(Brand\";v=\"99\", \"Google Chrome\";v=\"121\", \"Chromium\";v=\"121\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "Referer": "https://www.panadew.ca/search-results/?lang=",
        "Referrer-Policy": "strict-origin-when-cross-origin"
      },
      "body": `location_level1=&rentbuy=&beds=${bedroomCount}&baths=&minprice_buy=0&maxprice_buy=9999999999999&minprice_rent=0&maxprice_rent=9999999999999&propertytype2=&resorcomm=&garage=`,
      "method": "POST"
    });
    if (listings.status !== 200)
      throw new Error('Failed to fetch Panadew Property website');
    const listingsResponse = await listings.text();
    fs.writeFileSync('response.html', listingsResponse);

    const { JSDOM } = jsdom;
    const virtualConsole = new jsdom.VirtualConsole();
    virtualConsole.on('error', () => { /* do nothing */});
    const panadewDOM = new JSDOM(listingsResponse, { virtualConsole });

    const listingsContainer = panadewDOM.window.document.querySelector(this.selectors.listingsContainer);
    for (const houseCard of listingsContainer.children)
    {
      const address = houseCard.querySelector(this.selectors.houseCardAddress);
      if (address === null)
        continue;
      const addressText = houseCard.querySelector(this.selectors.houseCardAddress).innerHTML.trim();
      const leaseAndBedrooms = houseCard.querySelector(this.selectors.houseCardLeaseStart).innerHTML.trim().split('\n');
      const leaseStart = leaseAndBedrooms[1];
      const bedrooms = Number(leaseAndBedrooms[0].replace(/\D+/g, ''));
      if (!this.numBedrooms.includes(bedrooms))
        continue;
      const price = houseCard.querySelector(this.selectors.houseCardPrice).innerHTML.trim();
      const link = houseCard.querySelector(this.selectors.houseCardLink).href;
      const dataEntry = new DataEntry({
        address: addressText,
        link,
        pricePerBed: calculatePerPersonPrice(bedrooms, Number(price.replace(/\D+/g, ''))),
        leaseStart,
        numBedrooms: bedrooms,
        sourceName: this.name
      });
      dataEntries.push(dataEntry);
      }
    console.log(`Found ${dataEntries.length} candidates`);
    return dataEntries;
  }
}
module.exports.PanadewProperty = PanadewProperty;

