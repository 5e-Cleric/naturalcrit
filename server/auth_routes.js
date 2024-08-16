import { Router } from 'express';
import passport from 'passport';
import * as token from './token.js';
// Assuming AccountModel is imported from the right module
import { AccountModel } from './account.model.js'; 

const router = Router();

function generateUserToken(req, res) {
  const accessToken = token.generateAccessToken(req, res);
  console.log("Successfully Generated JWT after Google Login");
  console.log(accessToken);
  return accessToken;
}

// Auth login
router.post('/login', async (req, res) => {
  const { user, pass } = req.body;

  try {
    const jwt = await AccountModel.login(user, pass);
    res.json(jwt);
  } catch (err) {
    res.status(err.status || 500).json(err);
  }
});

// Render login page
router.get('/login', (req, res) => {
  res.render('login');
});

// Handle logout
router.get('/logout', (req, res) => {
  // handle with passport
  res.send('logging out');
});

// Auth with Google - Initiates Google authentication
router.get('/google',
  passport.authenticate('google', {
    session: false,
    scope: ['profile', 'https://www.googleapis.com/auth/drive.file'],
    accessType: 'offline', // Uncomment these if refreshToken is not sent
    prompt: 'consent'
  })
);

// Callback route for Google after authentication
router.get('/google/redirect',
  passport.authenticate('google', { session: false }),
  (req, res, next) => {
    if (!req.user.username) { // Stay on the page if we still need local sign in
      return next();
    }
    const jwt = generateUserToken(req, res);
    console.log("About to redirect");
    const JWTToken = jwt;
    res.cookie('nc_session', JWTToken, {
      maxAge: 1000 * 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
      domain: '.naturalcrit.com'
    });
    res.redirect('/success');
  }
);

export default router;
