const path = require('path');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const { param } = require('express-validator');

require('dotenv').config();

app.use(cors());

app.use(express.static(path.join(__dirname, 'public')))

app.set('view engine', 'pug');

// mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true})
mongoose.connect(`mongodb+srv://${process.env.MONGO_URL}`, 
{
  useNewUrlParser: true, 
  useUnifiedTopology: false,
  user: process.env.MONGO_USER,
  pass: process.env.MONGO_PASS,
  dbName: process.env.MONGO_DB
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

app.get("/trainer/:trainerName/", [param('trainerName').trim().not().isEmpty().escape()], (req, res) => {
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
    res.render('index', {trainerName: data.name, pokemonList: data.pokemon});
    // res.json(data);
  })
})

var port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Now listening on port ${port}`);
})