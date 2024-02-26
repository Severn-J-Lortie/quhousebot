const { WebDataSource } = require('../WebDataSource');
const { DataEntry } = require('../DataEntry');
const config = require('../config');
const { JSDOM } = require('jsdom');
const { calculatePerPersonPrice } = require('../utils');
const fs = require('node:fs');
class AxonProperty extends WebDataSource
{
  constructor()
  {
    const apConfig = config.dataSources.axonProperty;
    super(apConfig.url, "Axon");
    this.apConfig = apConfig;
    this.selectors = apConfig.selectors;
  }
  async getData()
  {
    const dataEntries = [];
    for (let i = 0; i < config.maxBedrooms; i++)
    {
      const bedroomCount = i + 1;
      const listings = await fetch(this.url, {
        "headers": {
          "cache-control": "no-cache",
          "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
          "pragma": "no-cache"
        },
        "body": `action=jet_smart_filters&provider=jet-engine%2Fdefault&query%5B_meta_query_bedrooms%5D=${bedroomCount}+Bedroom&defaults%5Bpost_status%5D%5B%5D=publish&defaults%5Bpost_type%5D=available-listings&defaults%5Bposts_per_page%5D=20&defaults%5Bpaged%5D=1&defaults%5Bignore_sticky_posts%5D=1&defaults%5Border%5D=ASC&defaults%5Borderby%5D=meta_value_num&defaults%5Bmeta_key%5D=ranking_student&defaults%5Bmeta_type%5D=NUMERIC&defaults%5Btax_query%5D%5B0%5D%5Btaxonomy%5D=property-type&defaults%5Btax_query%5D%5B0%5D%5Bfield%5D=IN&defaults%5Btax_query%5D%5B0%5D%5Bterms%5D%5B%5D=10&defaults%5Btax_query%5D%5B0%5D%5Bterms%5D%5B%5D=31&defaults%5Btax_query%5D%5B0%5D%5Boperator%5D=IN&defaults%5Btax_query%5D%5B1%5D%5Btaxonomy%5D=listing-status&defaults%5Btax_query%5D%5B1%5D%5Bfield%5D=IN&defaults%5Btax_query%5D%5B1%5D%5Bterms%5D%5B%5D=11&defaults%5Btax_query%5D%5B1%5D%5Boperator%5D=IN&defaults%5Btax_query%5D%5Brelation%5D=AND&settings%5Blisitng_id%5D=553&settings%5Bcolumns%5D=3&settings%5Bcolumns_tablet%5D=&settings%5Bcolumns_mobile%5D=1&settings%5Bcolumn_min_width%5D=240&settings%5Bcolumn_min_width_tablet%5D=&settings%5Bcolumn_min_width_mobile%5D=&settings%5Binline_columns_css%5D=false&settings%5Bpost_status%5D%5B%5D=publish&settings%5Buse_random_posts_num%5D=&settings%5Bposts_num%5D=20&settings%5Bmax_posts_num%5D=9&settings%5Bnot_found_message%5D=No+Current+Listings&settings%5Bis_masonry%5D=&settings%5Bequal_columns_height%5D=&settings%5Buse_load_more%5D=&settings%5Bload_more_id%5D=&settings%5Bload_more_type%5D=click&settings%5Bload_more_offset%5D%5Bunit%5D=px&settings%5Bload_more_offset%5D%5Bsize%5D=0&settings%5Bloader_text%5D=&settings%5Bloader_spinner%5D=&settings%5Buse_custom_post_types%5D=&settings%5Bcustom_post_types%5D=&settings%5Bhide_widget_if%5D=&settings%5Bcarousel_enabled%5D=&settings%5Bslides_to_scroll%5D=1&settings%5Barrows%5D=true&settings%5Barrow_icon%5D=fa+fa-angle-left&settings%5Bdots%5D=&settings%5Bautoplay%5D=true&settings%5Bautoplay_speed%5D=5000&settings%5Binfinite%5D=true&settings%5Bcenter_mode%5D=&settings%5Beffect%5D=slide&settings%5Bspeed%5D=500&settings%5Binject_alternative_items%5D=&settings%5Bscroll_slider_enabled%5D=&settings%5Bscroll_slider_on%5D%5B%5D=desktop&settings%5Bscroll_slider_on%5D%5B%5D=tablet&settings%5Bscroll_slider_on%5D%5B%5D=mobile&settings%5Bcustom_query%5D=&settings%5Bcustom_query_id%5D=&settings%5B_element_id%5D=&props%5Bfound_posts%5D=0&props%5Bmax_num_pages%5D=0&props%5Bpage%5D=1`,
        "method": "POST"
      });
      if (listings.status !== 200)
        throw new Error('Failed to fetch Axon Property website');
      const listingsResponse = (await listings.json()).content;
      const axonDOM = new JSDOM(listingsResponse);
      const listingsContainer = axonDOM.window.document.querySelector(this.selectors.listingsContainer);
      for (const houseCard of listingsContainer.children)
      {
        const address = houseCard.querySelector(this.selectors.houseCardAddress);
        if (address === null)
          continue;
        const leaseStart = houseCard.querySelector(this.selectors.houseCardLeaseStart).innerHTML;
        const price = houseCard.querySelector(this.selectors.houseCardPrice).innerHTML;
        const bathrooms = houseCard.querySelector(this.selectors.houseCardBathrooms).innerHTML;
        const link = houseCard.querySelector(this.selectors.houseCardLink).dataset.url;
        const dataEntry = new DataEntry({
          address: address.innerHTML,
          link,
          pricePerBed: calculatePerPersonPrice(bedroomCount, Number(price.replace(/\D+/g, ''))),
          leaseStart,
          numBedrooms: bedroomCount,
          numBathrooms: Number(bathrooms.replace(/\D+/g, '')),
          sourceName: this.name
        });
        dataEntries.push(dataEntry);
      }
    }
    return dataEntries;
  }
}
module.exports.AxonProperty = AxonProperty;

