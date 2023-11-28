require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

const newUser =  mongoose.Schema({
  name: String,
  email: String,
  password: String,
});

const User = mongoose.model('users', newUser);


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); 


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html'); 
});
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/signup.html');
});


app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;

  const encrypt_password = await bcrypt.hash(password, 10);

  const userDetail = {
    name: name,
    email: email,
    password: encrypt_password,
  };

  const user_exist = await User.findOne({ email: email });

  if (user_exist) {
    res.send({ message: "The Email is already in use !" });
  } else {
    User.create(userDetail).then((result) => {
      res.send({ userDetail, message: "User Created Succesfully" });
    }).catch((err) => {
      res.status(500).send({ message: err.message });
    })
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userDetail = await User.findOne({ email: email });

  if (userDetail) {
    if (await bcrypt.compare(password, userDetail.password)) {
      res.send(userDetail);
    } else {
      res.send({ error: "invaild Password" });
    }
  } else {
    res.send({ error: "user is not exist" });
  }
});

// Start the server
connectDB().then(() => {
  app.listen(PORT, () => {
      console.log("listening for requests");
  })
})
