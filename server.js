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
    datecaught: Date
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
    if (Object.entries(req.query).length !== 0) {
      var sortedList = data.pokemon;
      if (req.query.category === 'number') {
        if (req.query.r === 'true') {
          sortedList.keySortReverse('number');
        } else sortedList.keySort('number');
      } else if (req.query.category === 'name') {
        if (req.query.r === 'true') {
          sortedList.keySortReverse('name');
        } else sortedList.keySort('name');
      } else if (req.query.category === 'datecaught') {
        if (req.query.r === 'true') {
          sortedList.keySortReverse('datecaught');
        } else sortedList.keySort('datecaught');
      }
      res.render('index', {trainerName: data.name, pokemonList: sortedList});
    }
    else res.render('index', {trainerName: data.name, pokemonList: data.pokemon});
    // res.json(data);
  })
})

var port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
})