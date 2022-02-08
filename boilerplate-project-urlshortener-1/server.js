require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongodb = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const { nanoid } = require('nanoid');


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Solution Below // 


var ShortURL = mongoose.model('ShortURL', new mongoose.Schema ({
original_url: String,
short_url: String,
}));


app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())


let urlExtract = function(url) {
  const urlSplit = url.split("https://");
  if (urlSplit[1] == undefined) {
    return urlSplit[0].split("/")[0];
  } else {
    return urlSplit[1].split("/")[0];
  }
};

app.post("/api/shorturl/", (req, res, next) => {
  let original_url = req.body.url;
  let extractUrl = urlExtract(original_url);

  dns.resolveAny(extractUrl, (err) => {
    if (err) {
      res.json ({
        error: 'invalid url'
      });
    } else {
      let short_url = nanoid()
     
      // saving on mongodb //

      let newURL = new ShortURL({
        original_url: original_url,
        short_url: short_url
      });

      newURL.save((err, data) => {
        if (err) return console.error(err);
      });

      res.json ({
        original_url: original_url,
        short_url: short_url
      });
    };
  });
});

app.get("/api/shorturl/:short_url?", (req, res) => {
  let short_url = req.params.short_url;

  ShortURL.findOne({ short_url: short_url}, (err, data) => {
    if (err) return console.log(err);

     res.redirect(301, data.original_url);
  });
});






// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
