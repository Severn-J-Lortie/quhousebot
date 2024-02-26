const { WebDataSource } = require('../WebDataSource');
const { DataEntry } = require('../DataEntry');
const config = require('../config');
const { calculatePerPersonPrice } = require('../utils');
class LimestoneProperty extends WebDataSource
{
  constructor()
  {
    const lpConfig = config.dataSources.limestoneProperty;
    super(lpConfig.url, "Limestone");
    this.lpConfig = lpConfig;
  }
  async getData()
  {
    const dataEntries = [];
    for (let i = 0; i < config.maxBedrooms; i++)
    {
      const bedroomCount = i + 1;
      const responseText = await fetch(this.url, {
        headers: this.lpConfig.headers,
        body: `{\"collectionName\":\"Properties\",\"dataQuery\":{\"filter\":{\"$and\":[{\"$and\":[{\"type\":{\"$eq\":2}}]},{\"bedrooms\":${bedroomCount}},{\"availableYes\":true}]},\"sort\":[{\"fieldName\":\"availableYes\",\"order\":\"DESC\"},{\"fieldName\":\"available\",\"order\":\"ASC\"},{\"fieldName\":\"rate\",\"order\":\"ASC\"},{\"fieldName\":\"_updatedDate\",\"order\":\"DESC\"}],\"paging\":{\"offset\":0,\"limit\":12},\"fields\":[]},\"options\":{},\"includeReferencedItems\":[\"location\",\"status1\",\"propertyType\"],\"segment\":\"LIVE\",\"appId\":\"4dc3111e-2454-408a-be40-c5eda295fb8a\"}`,
        method: 'POST',
      });
      const responseJson = await responseText.json();
      for (const listing of responseJson.items)
      {
        const dataEntry = new DataEntry({
          address: `${listing.mapLocation.streetAddress.number} ${listing.mapLocation.streetAddress.name}`,
          leaseStart: (new Date(listing.available.$date)).toLocaleString('default', {month: 'long', day: 'numeric', year: 'numeric'}),
          pricePerBed: calculatePerPersonPrice(bedroomCount, listing.rate),
          link: `${new URL(this.url).origin}${listing['link-properties-title']}`,
          numBedrooms: bedroomCount,
          numBathrooms: listing.bathrooms,
          description: listing.descriptiveText,
          sourceName: this.name
        });
        dataEntries.push(dataEntry);
      }
    }
    return dataEntries;
  }
}
module.exports.LimestoneProperty = LimestoneProperty;