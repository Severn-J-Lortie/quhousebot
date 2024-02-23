class DataEntry
{
  constructor(houseDescriptor)
  {
    this.hash =  houseDescriptor.hash;
    this.address = houseDescriptor.address;
    this.leaseStart = houseDescriptor.leaseStart;
    this.pricePerBed = houseDescriptor.pricePerBed;
    this.datePosted = houseDescriptor.datePosted;
    this.landlord = houseDescriptor.landlord;
    this.leaseType = houseDescriptor.leaseType;
    this.link = houseDescriptor.link;
    this.numBedrooms = houseDescriptor.numBedrooms;
    this.numBathrooms = houseDescriptor.numBathrooms;
    this.description = houseDescriptor.description;
    this.houseType = houseDescriptor.houseType;
    this.sourceName = houseDescriptor.sourceName;
  }
}
module.exports.DataEntry = DataEntry;