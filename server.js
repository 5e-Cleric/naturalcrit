'use strict';

import _ from 'lodash';
import 'app-module-path/register';  // Equivalent to .addPath('./shared')

import jwt from 'jwt-simple';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import express from 'express';
import config from 'nconf';
import mongoose from 'mongoose';
import passport from 'passport';
import authRoutes from './server/auth_routes';
// import userRoutes from './server/profile_routes';  // Uncomment if needed
import passportSetup from './server/passport_setup';
import accountApi from './server/account.api.js';
import { pack } from 'vitreum'; // Updated import
import renderTemplate from './client/template.js';

const app = express();

// Middleware setup
app.use(express.static(`${__dirname}/build`));
app.use(bodyParser.json());
app.use(cookieParser());

// Configuration setup
config
  .argv()
  .env({ lowerCase: true })
  .file('environment', { file: `config/${process.env.NODE_ENV}.json` })
  .file('defaults', { file: 'config/default.json' });

// Database connection
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/naturalcrit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

mongoose.connection.on('error', () => {
  console.error(">>>ERROR: Run Mongodb.exe ya goof!");
});

// Passport setup
// app.use(passport.initialize());  // Uncomment if passport setup is used

// User authentication middleware
app.use((req, res, next) => {
  if (req.cookies && req.cookies.nc_session) {
    try {
      req.user = jwt.decode(req.cookies.nc_session, config.get('authentication_token_secret'));
    } catch (e) {
      console.error("Couldn't find a current logged-in user");
      console.error(e);
    }
  }
  return next();
});

// API Routes
app.use(accountApi);
app.use('/auth', authRoutes);
// app.use('/user', userRoutes);  // Uncomment if userRoutes are needed

// Homebrew Redirect
app.all('/homebrew*', (req, res) => {
  res.redirect(302, `https://homebrewery.naturalcrit.com${req.url.replace('/homebrew', '')}`);
});

// Load render function from the correct path
const getRenderFunction = async () => {
  const { render } = await pack('./path/to/your/entry/file', {
    // Your configuration options if any
  });
  return render;
};

// Render routes
app.get('/badges', async (req, res) => {
  try {
    const render = await getRenderFunction();
    const page = await render('badges', renderTemplate, { url: req.url });
    res.send(page);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('*', async (req, res) => {
  try {
    const render = await getRenderFunction();
    const page = await render('main', renderTemplate, {
      url: req.url,
      user: req.user,
      domain: config.get('domain')
    });
    res.send(page);
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
const port = process.env.PORT || 8010;
app.listen(port, () => {
  console.log(`Listening on localhost:${port}`);
});
