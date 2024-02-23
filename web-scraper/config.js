module.exports = {
  updateInterval: 15 * 60 * 1000, // 15 minutes
  dryRun: false,
  minBedroomPrice: 500,
  maxBedrooms: 7,
  dataSources: {
    frontenacProperty: {
      selectors:
      {
        cardLeaseStart: 'article > div.ribbon > div > div',
        cardAddress: 'article > h4 > a',
        cardLink: 'article > h4 > a',
        cardPricePerBed: 'article > div.listing-footer > div.footer-right.pull-right > span > b',
      },
      url: 'https://www.frontenacproperty.com/wp-admin/admin-ajax.php'
    },
    queensAccommodationListingService: {
      url: 'https://listingservice.housing.queensu.ca/public/getByFilter?property_type_id=&lease_type_id=&shared_accommodation=false&water_included=false&heat_included=false&electricity_included=false&furnished=false&parking_available=false&air_conditioning=false&accessibility_features=false&laundry_hookup=false&onsite_laundry=false&landlord_contract_program=false&queens_owned=false&date_available=&show_test=0&num_items=10',
      noResultsReturnedText: 'This search returned no listings.'
    },
    limestoneProperty: {
      url: 'https://www.limestonepropertymanagement.ca/_api/cloud-data/v1/wix-data/collections/query',
      headers: {
        'authorization': 'wixcode-pub.c5f12e03432a7282789786e2a4d38dee407e6d45.eyJpbnN0YW5jZUlkIjoiMmU3OTg5OTUtZWEwMS00YTE5LTgxYzQtYjE0NzJlZDk1ZTg2IiwiaHRtbFNpdGVJZCI6ImI5MzZlMzNlLTU3ZWItNDNlMC05ZGY1LTY0ZDk1ZGFiNTMzZiIsInVpZCI6bnVsbCwicGVybWlzc2lvbnMiOm51bGwsImlzVGVtcGxhdGUiOmZhbHNlLCJzaWduRGF0ZSI6MTcwMjg1MDA0MjY0OCwiYWlkIjoiOGU1MjhjOGQtYmY1MC00ODRjLWI2NWQtNTdmMTNmYTQ0MGQyIiwiYXBwRGVmSWQiOiJDbG91ZFNpdGVFeHRlbnNpb24iLCJpc0FkbWluIjpmYWxzZSwibWV0YVNpdGVJZCI6IjUzNDYyYjkyLTg5NmUtNGQzOS1hNzkwLTc1MjZlN2UzOTExZCIsImNhY2hlIjpudWxsLCJleHBpcmF0aW9uRGF0ZSI6bnVsbCwicHJlbWl1bUFzc2V0cyI6IkFkc0ZyZWUsSGFzRG9tYWluLFNob3dXaXhXaGlsZUxvYWRpbmciLCJ0ZW5hbnQiOm51bGwsInNpdGVPd25lcklkIjoiZGJlY2QxOWQtYzM3MS00NDhhLTllZjEtNGNmMDU5NGIyMWZjIiwiaW5zdGFuY2VUeXBlIjoicHViIiwic2l0ZU1lbWJlcklkIjpudWxsLCJwZXJtaXNzaW9uU2NvcGUiOm51bGwsImxvZ2luQWNjb3VudElkIjpudWxsLCJpc0xvZ2luQWNjb3VudE93bmVyIjpudWxsfQ==',
      }
    },
    axonProperty: {
      url: 'https://axonproperties.ca/wp-admin/admin-ajax.php',
      selectors: {
        listingsContainer: 'body > div > div',
        houseCardAddress: 'div > div > section > div > div > div > div.elementor-element.elementor-element-64ab4e1.elementor-widget.elementor-widget-heading > div > h2',
        houseCardLeaseStart: 'div > div > section > div > div > div > div.elementor-element.elementor-element-4c5b3f6.elementor-widget.elementor-widget-heading > div > h2',
        houseCardPrice: 'div > div > section > div > div > div > div.elementor-element.elementor-element-e287928.elementor-widget.elementor-widget-heading > div > h2',
        houseCardBathrooms: 'div > div > section > div > div > div > div.elementor-element.elementor-element-18c8b70.elementor-icon-list--layout-inline.elementor-list-item-link-full_width.elementor-widget.elementor-widget-icon-list > div > ul > li:nth-child(2) > span.elementor-icon-list-text',
        houseCardLink: 'div'
      }
    },
    panadewProperty: {
      url: 'https://www.panadew.ca/search-results/?lang=',
      selectors: {
        listingsContainer: '#content > div.twelve.columns.omega > form',
        houseCardAddress: 'div.listingblocksection > h4',
        houseCardLeaseStart: 'div.listingblocksection > p.twofeatures',
        houseCardPrice: 'div.listingblocksection > p.price',
        houseCardLink: 'div.listingblocksection > a'
      }
    }
  }
};
