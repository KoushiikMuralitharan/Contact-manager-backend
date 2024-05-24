const mongoose = require('mongoose');

const  contactDetailsSchema = new mongoose.Schema({
    name:{
        type: String
    },
    phoneno:{
        type: Number
    },
    age:{
        type:Number
    },
    typeOfContact:{
        type:String
    },
    userID:{
        type: String
      }
},{versionKey:false});

const userDetailsSchema = new mongoose.Schema({
    username:{
        type : String
    },
    email:{
        type : String
    },
    password:{
        type : String
    }
},{versionKey:false});


const Contacts = mongoose.model('ContactDetails' , contactDetailsSchema);
const  User = mongoose.model('UserDetails',userDetailsSchema);
module.exports={Contacts , User};