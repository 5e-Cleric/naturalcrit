import jwt from 'jwt-simple';
import { Router } from 'express';
import nconf from 'nconf';
import { model as AccountModel } from './account.model.js';

const router = Router();

const config = nconf
  .argv()
  .env({ lowerCase: true })
  .file('environment', { file: `config/${process.env.NODE_ENV}.json` })
  .file('defaults', { file: 'config/default.json' });

// Bump these out to an API file
router.post('/login', (req, res) => {
  const user = req.body.user;
  const pass = req.body.pass;

  AccountModel.login(user, pass)
    .then((jwt) => {
      return res.json(jwt);
    })
    .catch((err) => {
      return res.status(err.status || 500).json(err);
    });
});

router.post('/signup', (req, res) => {
  const user = req.body.user;
  const pass = req.body.pass;

  AccountModel.signup(user, pass)
    .then((jwt) => {
      return res.json(jwt);
    })
    .catch((err) => {
      return res.status(err.status || 500).json(err);
    });
});

router.post('/link', (req, res) => {
  AccountModel.findOne({ username: req.body.username })
    .then((localUser) => {
      // Add Google ID to user
      localUser.googleId = req.body.user.googleId;
      localUser.googleRefreshToken = req.body.user.googleRefreshToken;

      localUser.save((err, updatedUser) => {
        if (err) {
          return res.status(err.status || 500).json(err);
        }
        console.log('Local user updated with Google ID: ' + updatedUser);
        updatedUser.googleAccessToken = req.body.user.googleAccessToken;
        return res.json(updatedUser.getJWT());
      });
    });
});

router.get('/user_exists/:username', (req, res) => {
  if (!req.params.username) {
    return res.json(false);
  }
  AccountModel.getUser(req.params.username)
    .then((user) => {
      return res.json(!!user);
    })
    .catch((err) => {
      return res.status(err.status || 500).json(err);
    });
});

export default router;
