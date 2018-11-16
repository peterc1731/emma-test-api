const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const config = require('../config');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (username, password, done) => {
      try {
        const user = await User.findByEmail(username);
        const authed = await user.authenticate(password);
        if (authed) return done(null, user);
        return done(null, false);
      } catch (e) {
        return done(e);
      }
    },
  ),
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.secret,
    },
    (jwtPayload, cb) => User.findById(jwtPayload.id)
      .then(user => cb(null, user))
      .catch(err => cb(err)),
  ),
);

module.exports = passport;
