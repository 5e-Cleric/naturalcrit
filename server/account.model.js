import mongoose from 'mongoose';
import _ from 'lodash';
import nconf from 'nconf';
import jwt from 'jwt-simple';
import bcrypt from 'bcrypt-nodejs';

const SALT_WORK_FACTOR = 10;

const AccountSchema = new mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: false },
  googleId: String,
  googleAccessToken: String,
  googleRefreshToken: String,
}, { versionKey: false });

AccountSchema.pre('save', function(next) {
  const account = this;
  //if (!account.isModified('password')) return next(); //Need to remove this to allow logins without password via google
  if (account.isModified('password')) {
    const salt = bcrypt.genSaltSync(SALT_WORK_FACTOR);
    const hash = bcrypt.hashSync(account.password, salt);

    if (!hash) return next({ ok: false, msg: 'Error creating password hash' });
    account.password = hash;
  }
  return next();
});

AccountSchema.statics.login = function(username, pass) {
  const BadLogin = { ok: false, msg: 'Invalid username and password combination.', status: 401 };

  let user;
  return this.getUser(username)
    .then((_user) => {
      if (!_user) throw BadLogin;
      user = _user;
    })
    .then(() => user.checkPassword(pass))
    .then((isMatch) => {
      if (!isMatch) throw BadLogin;
      return user.getJWT();
    });
};

AccountSchema.statics.signup = function(username, pass) {
  return this.getUser(username)
    .then((user) => {
      if (user) throw { ok: false, msg: 'User with that name already exists', status: 400 };
    })
    .then(() => this.makeUser(username, pass))
    .then((newUser) => newUser.getJWT());
};

AccountSchema.statics.makeUser = function(username, password) {
  return new Promise((resolve, reject) => {
    const newAccount = new this({ username, password });
    newAccount.save((err, obj) => {
      if (err) {
        console.log(err);
        return reject({ ok: false, msg: 'Issue creating new account' });
      }
      return resolve(newAccount);
    });
  });
};

AccountSchema.statics.getUser = function(username) {
  return new Promise((resolve, reject) => {
    this.find({ username }, (err, users) => {
      if (err) return reject(err);
      if (!users || users.length === 0) return resolve(false);
      return resolve(users[0]);
    });
  });
};

AccountSchema.methods.checkPassword = function(candidatePassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
      if (err) return reject(err);
      return resolve(isMatch);
    });
  });
};

AccountSchema.methods.getJWT = function() {
  const payload = this.toJSON();
  payload.issued = (new Date());

  delete payload.password;
  delete payload._id;

  return jwt.encode(payload, nconf.get('secret'));
};

const Account = mongoose.model('Account', AccountSchema);

export { AccountSchema, Account };
