// const mongoose = require('mongoose');
// const UserSchema = new mongoose.Schema({
    
//     fullName: { type: String },
//     email: { type: String},
//     password: { type: String},
//     createdOn: { type: Date, default: Date.now },
// });

// const User = mongoose.model('User', UserSchema);

// module.exports = User;


const mongoose = require('mongoose');

// Define the User Schema including roles
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  createdOn: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
