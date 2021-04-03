const path = require('path');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const { param, query } = require('express-validator');

require('dotenv').config();

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'pug');

mongoose.connect(process.env.MONGO_URI, 
{
  useNewUrlParser: true, 
  useUnifiedTopology: true
})

var trainerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  pokemon: [{
    number: {
      type: Number,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    datecaught: Date,
    balltype: String
  }]
})

const Trainer = mongoose.model("Trainer", trainerSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
})

Array.prototype.keySort = function (sortParameter) {
  function compare(a, b) {
    const keyA = a[sortParameter];
    const keyB = b[sortParameter];
  
    let comparison = 0;
    if (keyA > keyB) {
      comparison = 1;
    } else if (keyB > keyA) {
      comparison = -1;
    }
    return comparison;
  }
  this.sort(compare);
}

Array.prototype.keySortReverse = function (sortParameter) {
  function compare(a, b) {
    const keyA = a[sortParameter];
    const keyB = b[sortParameter];
  
    let comparison = 0;
    if (keyA < keyB) {
      comparison = 1;
    } else if (keyB < keyA) {
      comparison = -1;
    }
    return comparison;
  }
  this.sort(compare);
}

app.get("/trainer/:trainerName/", [param('trainerName').trim().not().isEmpty().escape(), query('category').escape(), query('r').escape()], (req, res) => {
  trainerName = req.params.trainerName 
  // In case the validator fails to sanitize properly?
  var regex = /[^A-Za-z0-9_]+/gi
  
  // console.log(trainerName)
  if (regex.test(trainerName)) {
    res.json("Invalid trainer name");
    return;
  }
  Trainer.findOne({name: trainerName}).exec((err, data) => {
    if (err) {
      res.json("Trainer name does not exist. Catch a Pokemon first as that trainer.");
      throw err;
    }
    var sortedList = data.pokemon;
    const SORTLINKSBASE = ["?category=number", "?category=name", "?category=datecaught"]
    var sortLinks = SORTLINKSBASE;
    if (Object.entries(req.query).length !== 0) {
      sortLinks = SORTLINKSBASE;
      if (req.query.category === 'number') {
        sortLinks[0] = "?category=number&r=true"
        if (req.query.r === 'true') {
          sortLinks[0] = "?category=number";
          sortedList.keySortReverse('number');
        } else sortedList.keySort('number');
      } else if (req.query.category === 'name') {
        sortLinks[1] = "?category=name&r=true"
        if (req.query.r === 'true') {
          sortLinks[1] = "?category=name";
          sortedList.keySortReverse('name');
        } else sortedList.keySort('name');
      } else if (req.query.category === 'datecaught') {
        sortLinks[2] = "?category=datecaught&r=true"
        if (req.query.r === 'true') {
          sortLinks[2] = "?category=datecaught";
          sortedList.keySortReverse('datecaught');
        } else sortedList.keySort('datecaught');
      }
    }
    res.render('index', {trainerName: data.name, pokemonList: sortedList, sortLinks: sortLinks});
    // res.json(data);
  })
})

var port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
})