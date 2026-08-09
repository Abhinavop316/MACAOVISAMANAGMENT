const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  referenceNo: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  Category: {
    type: String,
    default: "Tourist Visa",
  },
  FullName: {
    type: String,
    required: true,
  },
  Email: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
    default: "Male",
  },
  Address: {
    type: String,
    required: true,
  },
  telephone: {
    type: String,
    required: true,
  },
  DOB: {
    type: Date,
    required: true,
  },
  POB: {
    type: String,
    required: true,
  },
  CountryofCitizenship: {
    type: String,
    required: true,
  },
  PassportNumber: {
    type: String,
    required: true,
  },
  Status: {
    type: String,
    default: "Pending",
  },
  Paragraph: {
    type: String,
    default: "Currently the status is pending, the application is under review.",
  },
}, { timestamps: true });


const clientModel = mongoose.model('Client', clientSchema);

module.exports = clientModel;