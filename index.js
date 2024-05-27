const express = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser");
const cors = require("cors");
const { Contacts, User } = require("./Schema");
const jwt = require("jsonwebtoken");
const dotenv=require("dotenv");

const app = express();
dotenv.config();
app.use(bodyparser.json());
app.use(cors());

const port = process.env.PORT || 8000;

// this part of code deals with the connection establishment of the mongodb .
async function connectiontodb() {
  try {
    await mongoose.connect(
      process.env.MONGO_URL
    );
    app.listen(port, () => {
      console.log("The app is listening the port no 8000 ...");
    });
  } catch (error) {
    console.log(error);
    console.log("connection cannot be established ...");
  }
}

connectiontodb();

const accessKey = process.env.JWT_ACCESS_KEY ;
function generateToken(userDetail) {
  return jwt.sign(userDetail, accessKey);
}

//middleware
function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader && authHeader.split(" ")[1];
    if (accessToken) {
      jwt.verify(accessToken, accessKey, (error, userDetail) => {
        if (error) {
          console.log(error);
          res.status(403).json({
            status: "failure",
            message: "access denied",
          });
        } else {
          next();
        }
      });
    } else {
      res.status(401).json({
        status: "failure",
        message: "acess token not found",
      });
    }
  } catch (error) {
    res.status(500).json({});
  }
}
// api handeling methods are defined here  .

// add contact

// localhost:6000/add-contact
app.post("/add-contact/:id", authenticateToken, async (req, res) => {
  console.log(req.params.id);
  try {
    const contactadded = await Contacts.find({"phoneno":req.body.phoneno,"userID":req.params.id})
  
    if(contactadded.length === 0){
      await Contacts.create({
        name: req.body.name,
        phoneno: req.body.phoneno,
        age: req.body.age,
        typeOfContact: req.body.typeOfContact,
        userID: req.params.id
      });
      res.json({
        status: "success",
        message: "entry successfully added",
      });
    }
    else{
      res.json({
        status: "failure",
        message: "the contact is already present."
      });
    }
   
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: "entry not added",
      error: error,
    });
  }
});

//  localhost:6000/get-contacts

app.get("/get-contacts/:userID", authenticateToken, async (req, res) => {
  try {
    const contactDetail = await Contacts.find({"userID":req.params.userID})
    res.status(200).json(
       contactDetail
    );
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: "Data cannot be fetched.",
      error: error,
    });
  }
});

app.get("/gettingcontact/:id", authenticateToken, async (req,res) =>{
 try{
  const id = req.params.id;
  const val = await Contacts.findById({_id:id})
  res.json(val)
 }catch(error){
  res.status(500).json({
    status: "failure",
    message: "Data cannot be fetched.",
    error: error,
  });
 }
 
})

//

app.delete("/delete-contact/:id", authenticateToken, async (req, res) => {
  try {
    await Contacts.findByIdAndDelete(req.params.id);
    res.status(200).json({
      status: "success",
      message: "entry delete",
    });
  } catch (error) {
   console.log(error);
  }
});

app.patch("/update-contact/:id", authenticateToken,async (req, res) => {
  try {
    await Contacts.findByIdAndUpdate(req.params.id, {
      name: req.body.name,
      phoneno: req.body.phoneno,
      age: req.body.age,
      typeOfContact: req.body.typeOfContact,
    });
    res.status(200).json({
      status: "success",
      message: "entry updated",
    });
  } catch (error) {
    res.status(500).json({
      status: "failure",
      message: "couldn't update entry.",
      error: error,
    });
  }
});

app.post("/addUser", async (req, res) => {
  try {
    const user = await User.find({ email: req.body.email });
    if (user.length === 0) {
      const user = await User.create({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
      });
      const userDetail = {
        username: user.username,
        email: user.email,
        userID: user._id.toString(),
      };
      const accessToken = generateToken(userDetail);
      res.json({
        status: "success",
        message: "user account created successfully",
        accessToken: accessToken,
      });
    } else {
      res.status(409).json({
        message: "user already present .",
        status: "failure",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "user cannot be created",
      status: "failure",
    });
  }
});

app.post("/validateUser", async (req, res) => {
  try {
    const user = await User.find({
      email: req.body.email,
      password: req.body.password,
    });
    if (user.length === 0) {
      res.status(401).json({
        message: "user does not exist",
        status: "failure",
      });
    } else {
      const userDetail = {
        username: user[0].username,
        email: user[0].email,
        password: user[0].password,
        userID: user[0]._id
      };
      const accessToken = generateToken(userDetail);
      res.json({
        message: "entered into the website .",
        status: "success",
        accessToken: accessToken,
        userDetail : userDetail
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "no user found",
      error: error,
    });
  }
});
