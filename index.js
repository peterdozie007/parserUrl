require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
// const mongoose = require("mongoose");
// mongoose.set('strictQuery', false);
const { MongoClient } = require("mongodb");
const dns = require("dns");
const urlParser = require("url");

const client = new MongoClient(process.env.URI);
const db = client.db("urlshortner");
const urls = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());


/**DB CONNECT */
// const db = mongoose.connect(process.env.URI, (err) => {
//   if (err) {
//     console.log(err);
//   }
//   console.log("connected to database successfully...");
// });

// const urls = new mongoose.Schema({
//   original_url: String,
//   short_url: String
// });

// const urlss = db.collections(urls)

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function (req, res) {
  const { url } = req.body;
  dns.lookup(urlParser.parse(url).hostname, async function (err, address, family) {
    if (err) {
      res.json({ error: "invalid url" });
    } else {
      const urlCount = await urls.countDocuments({});

      const urlDoc = {
        url,
        short_url: urlCount
      }

      const result = await urls.insertOne(urlDoc);
      console.log(result);
      return res.json({
        original_url: url,
        short_url: urlCount
      })
    }
  })
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const { short_url } = req.params;
  const urlDoc = await urls.findOne({ short_url: +short_url });
  if(!urlDoc){
    res.json({error:"No URL was found"})
  }else{
    return res.redirect(urlDoc.url);
  }
  
})

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
