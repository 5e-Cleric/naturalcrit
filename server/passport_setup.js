import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Account } from './account.model.js';
import nconf from 'nconf';

// Load configuration values
nconf
    .argv()
    .env({ lowerCase: true })
    .file('environment', { file: `config/${process.env.NODE_ENV}.json` })
    .file('defaults', { file: 'config/default.json' });

const config = nconf.get();
console.log(config.googleClientId);

// Initialize Passport
passport.initialize();

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await Account.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.authentication_token_secret,
            issuer: config.authentication_token_issuer,
            audience: config.authentication_token_audience,
        },
        async (payload, done) => {
            try {
                const user = users.getUserById(parseInt(payload.sub));
                if (user) {
                    return done(null, user, payload);
                }
                return done(null, false);
            } catch (error) {
                return done(error);
            }
        }
    )
);

passport.use(
    new GoogleStrategy(
        {
            callbackURL: '/auth/google/redirect',
            clientID: config.googleClientId,
            clientSecret: config.googleClientSecret,
            passReqToCallback: true,
            proxy: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                let user = await Account.findOne({ googleId: profile.id });

                if (user) {
                    user.googleRefreshToken = refreshToken;
                    user.googleAccessToken = accessToken;
                    await user.save();
                    console.log('User logged in via Google:', user);
                    return done(null, user);
                } 

                if (req.user) {
                    const localUser = await Account.findOne({ username: req.user.username });
                    localUser.googleId = profile.id;
                    localUser.googleRefreshToken = refreshToken;
                    localUser.googleAccessToken = accessToken;
                    const updatedUser = await localUser.save();
                    console.log('Local user updated with Google Id:', updatedUser);
                    return done(null, updatedUser);
                } 

                console.log('Not logged in locally');
                const newAccount = new Account({
                    googleId: profile.id,
                    googleRefreshToken: refreshToken,
                    googleAccessToken: accessToken,
                });
                req.user = newAccount;
                return done(null, newAccount);

            } catch (error) {
                console.error('Error handling Google login:', error);
                return done(error);
            }
        }
    )
);

// Export the initialized passport
export default passport;
