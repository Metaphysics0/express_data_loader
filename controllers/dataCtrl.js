const AWS = require('aws-sdk');
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
const fs = require('fs');
const sampleData = fs.readFileSync('/Users/ryan/Desktop/express/covid-data-json.json');
const objectsToCsv = require('objects-to-csv');

// AWS
const S3 = new AWS.S3({
  accessKeyId: process.env.ACCESS_KEY,
  secretAccessKey: process.env.ACCESS_KEY_SECRET,
});

// Send data to DB
const sendDataDB = async (req, res) => {
  const dataObj = fs.readFileSync(req.body);
  const data = dataObj || sampleData;
  try {
    await client.connect();
    const db = client.db('covid-data-main').collection('main');
    const result = await db.insertOne(JSON.parse(data));
    res.status(201).json({
      message: 'Success',
      statusCode: 201,
      body: result.ops,
    });
  } catch (e) {
    res.status(500).send('An internal server error occurred ' + e);
  }
};

// Run query and store as CSV file.
const query = async (req, res) => {
  try {
    await client.connect();
    const db = client.db('covid-data-main').collection('main');
    const result = await db
      .find({
        name: { $exists: true },
      })
      .count();
    const csv = await new objectsToCsv([{ countries: result }]).toDisk('../test.csv');
    res.status(201).json({ message: 'success!', body: result, csv: csv });
  } catch (error) {
    res.status(500).send(error);
  }
};

// Send query result to AWS S3 bucket
const sendToAws = async (req, res) => {
  const fileContent = fs.readFileSync('../test.csv');
  const params = {
    Bucket: 'main',
    Key: 'test.csv',
    Body: fileContent,
  };
  S3.upload(params, (err, data) => {
    if (err) res.status(500).json({ error: err });
  });
  res.status(200).json({ message: 'File successfully uploaded', body: data });
};

module.exports = { sendDataDB, query, sendToAws };
