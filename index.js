require('./config/database').connect();
const express = require('express');
const cookieParser = require('cookie-parser'); // parse cookie header and populate req.cookies
const bodyParser = require('body-parser'); // parses incoming request bodies (req.body)
const app = express();
const expressLayouts = require('express-ejs-layouts');

// used for session cookie
const session = require('express-session');
const passport = require('passport');
const passportLocal = require('./config/passport-local-strategy');

const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const customMware = require('./config/middleware');

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieParser());

app.use(expressLayouts);

// set up view engine
app.set('view engine', 'ejs');
app.set('views', './views');

//serviing files
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// mongo store is used to store the session cookie in the db
app.use(
  session({
    name: 'employee-review-system',
    secret: process.env.SESSION_SECRET_KEY,
    saveUninitialized: false,
    resave: false,
    cookie: {
      maxAge: 1000 * 60 * 100,
    },
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URL,
      autoRemove: 'disabled',
    }),
    function(err) {
      console.log(err || 'connect-mongodb setup ok');
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// sets the authenticated user in the response
app.use(passport.setAuthenticatedUser);

app.use(flash());
app.use(customMware.setFlash);

// use express router44
app.use('/', require('./routes'));

app.listen(process.env.PORT || 5000, (err) => {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  }
  console.log(`Server is running on port: ${process.env.PORT}`);
});
