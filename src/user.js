const mongoose = require('mongoose');

// Clear out mongoose's model cache to allow --watch to work for tests:
// https://github.com/Automattic/mongoose/issues/1251
mongoose.models = {};
mongoose.modelSchemas = {};

mongoose.Promise = Promise;
mongoose.connect('mongodb://localhost/users', { useMongoClient: true });

const UserSchema = new mongoose.Schema({
  // TODO: fill in this schema
    username: {
        type: String,
        require: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model('User', UserSchema);


// First, write the schema for the user model in `src/user.js`. Each user has two
// properties: `username`, a String, and `passwordHash`, also a String. Both
// properties are required, and the username should be unique (use the option
// `unique: true`).  This prevents two users from having the same username.

// ### `POST /users`
// The `POST /users` route expects two parameters: `username` and `password`. When
// the client makes a `POST` request to `/users`, hash the given password and
// create a new user in MongoDB. Send the user object as a JSON response.

// Make sure to do proper validation and error checking. If there's any error,
// respond with an appropriate status and error message using the `sendUserError()`
// helper function.
