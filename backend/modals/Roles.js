// Example User Schema with Role
const userSchema = new mongoose.Schema({
    email: String,
    passwod: String,
    role: {
      type: String,
      enum: ['admin', 'employee'],
      default: 'employee'
    }
  });
  