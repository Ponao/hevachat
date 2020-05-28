/**
 * User.js
 * Author: Roman Shuvalov
 */
"use strict";

const mongoose = require("../database");
const Schema = mongoose.Schema;

// The number of rounds to use when hashing a password with bcrypt
const NUM_ROUNDS = 12;

const UserSchema = new Schema({
  name: {
    first: String,
    last: String
  },
  email: { type: String, select: false },
  password: { type: String, select: false },
  roomLang: { type: String, default: 'eng', select: false },
  online: { type: Boolean, default: true },
  onlineAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now, select: false },
  dialogs: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Dialog' }
  ],
  color: { type: String },
  buff: Buffer
});

const User = mongoose.model('User', UserSchema);


// class User extends Model {
//   // Database table name for User
//   static get table() {
//     return "users";
//   }

//   // Create a new User instance
//   constructor(opts) {
//     super(opts);
//     this.id = opts.id;
//     this.user = opts;

//     this.table = "users";
//   }
//   // Get an User by id from the database
//   static async getById(id) {
//     try {
//       const [user] = await db(this.table).where("id", id);
//       // User not found: return null
//       if (!user) {
//         return null;
//       }
//       return new User(user);
//     } catch (e) {
//       throw new Error(e);
//     }
//   }

//   // Get an User by email from the database
//   static async getByEmail(email) {
//     try {
//       const [user] = await db(this.table).where("email", email);
//       if (!user) {
//         return null;
//       }
//       return new User(user);
//     } catch (e) {
//       throw new Error(e);
//     }
//   }

//   static async getByPhone(phone) {
//     try {
//       const [user] = await db(this.table).where("phone", phone);
//       if (!user) {
//         return null;
//       }
//       return new User(user);
//     } catch (e) {
//       throw new Error(e);
//     }
//   }

//   // Get an User by resetPasswordToken from the database
//   static async getByResetPasswordToken(token) {
//     try {
//       const [user] = await db(this.table)
//         .where("resetPasswordToken", token)
//         .where("resetPasswordExpires", ">", Date.now());

//       if (!user) {
//         return null;
//       }
//       return new User(user);
//     } catch (e) {
//       throw new Error(e);
//     }
//   }

//   static async getByVerifiedToken(token) {
//     try {
//       const [user] = await db(this.table)
//         .where("verifiedToken", token)
//         .where("verifiedTokenExpires", ">", Date.now());

//       if (!user) {
//         return null;
//       }
//       return new User(user);
//     } catch (e) {
//       throw new Error(e);
//     }
//   }

//   // Renders the User as JSON. By default, this returns a shallow version.
//   // This method accepts an options object:
//   //    from the database and includes it in the JSON output.
//   toJSON() {
//     // Note: we omit the password field from the JSON representation
//     const json = this.user;

//     delete json.password;
//     delete json.verifiedToken;
//     delete json.verifiedTokenExpires;
//     delete json.resetPasswordToken;
//     delete json.resetPasswordExpires;

//     return json;
//   }

//   // Create a new User object in our database
//   // This method requires:
//   //  - email: the email for user to log in
//   //  - password: the password for the new user
//   static async create(user) {
//     // Make sure we've included a password field
//     if (!user.email || !user.password) {
//       throw new Error("Missing a required parameter: email, password");
//     }
//     try {
//       // Hash the password using bcrypt before saving it
//       const hashed = await bcrypt.hash(user.password, NUM_ROUNDS);

//       // DB: Insert the new User, and get back the id of the created object
//       user.password = hashed;

//       const [userId] = await this.insert(user);
//       user.id = userId;

//       // Return a new User instance
//       return new User(user);
//     } catch (e) {
//       throw new Error(e);
//     }
//   }

//   async updatePassword(password) {
//     const hashed = await bcrypt.hash(password, NUM_ROUNDS);

//     return await db(this.table)
//       .where("email", this.user.email)
//       .update({ password: hashed, resetPasswordExpires: 0 });
//   }

//   async verifiedUser() {
//     return await db(this.table)
//       .where("email", this.user.email)
//       .update({ isVerified: 1, verifiedToken: "", verifiedTokenExpires: "" });
//   }

//   // Compare the given password to the stored hash using bcrypt
//   async comparePassword(password) {
//     const match = await bcrypt.compare(password, this.user.password);
//     return match;
//   }

//   static async generatePasswordReset(email) {
//     const resetPasswordToken = crypto.randomBytes(20).toString("hex");
//     const resetPasswordExpires = Date.now() + 86400000;

//     await db(this.table)
//       .where("email", email)
//       .update({ resetPasswordToken, resetPasswordExpires });
//     return resetPasswordToken;
//   }

//   static async generateVerifiedToken(email) {
//     const verifiedToken = crypto.randomBytes(20).toString("hex");
//     const verifiedTokenExpires = Date.now() + 86400000;

//     await db(this.table)
//       .where("email", email)
//       .update({ verifiedToken, verifiedTokenExpires });
//     return verifiedToken;
//   }
// }

module.exports = User;
