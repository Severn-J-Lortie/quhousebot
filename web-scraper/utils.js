const config = require('./config');

/**
 * Take the SHA256 hash of a string
 * @param {string} input A string to hash
 * @returns {string} The hash
 */
const crypto = require('node:crypto')
module.exports.computeSHA256Hash = function computeSHA256Hash(input)
{
  const hashFn = crypto.createHash('sha256');
  hashFn.update(input);
  return hashFn.digest('hex');
}

/**
 * Calculate the cost per person of a house. If the totalRent is actually a per bedroom rent, this function attempts to return that instead.
 * It decides that the rent is per bedroom if it is less than the amount in config.minBedroomPrice.
 * @param {number} numBedrooms the number of bedrooms the listing has
 * @param {number} totalRent the total rent for the house
 * @returns {number} the cost per bedroom
 */
module.exports.calculatePerPersonPrice = function calculatePerPersonPrice(numBedrooms, totalRent)
{
  let pricePerBed = totalRent / numBedrooms;
  if (pricePerBed < config.minBedroomPrice)
    pricePerBed = totalRent;
  return Math.round(pricePerBed);
}