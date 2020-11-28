const LocalStrategy = require("passport-local").Strategy;
const { Pool } =  require("pg");;
const bcrypt = require("bcrypt");
const pool = new Pool({
    user: 'gendb',
    host: 'localhost',
    database: 'gendb',
    password: 'gendb',
    port: 32784,

})
const pool1 = new Pool({
    user: 'gendb',
    host: 'localhost',
    database: 'gendb',
    password: 'gendb',
    port: 32784,

})


function initialize(passport) {
  console.log("Initialized");

  const authenticateUser = (username, password,done) => {
    console.log(username, password);
    var stringquery ="";
    const fhirids={};
    
        stringquery ="select * from public.\"GenPractitioner\"  where public.\"GenPractitioner\".username=$1 ";
    
    pool.query(
        stringquery,
      [username],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log(results.rows);

        if (results.rows.length > 0) {
          const user = results.rows[0];
                 

         /* bcrypt.compare(user.passport, user.password, (err, isMatch) => {
            if (err) {
              console.log(err);
            }
            if (isMatch) {*/
              return done(null, user);
          /*  } else {
              //password is incorrect
              return done(null, false, { message: "Password is incorrect" });
            }
          });*/
        } else {
          // No user
          return done(null, false, {
            message: "No user with that email address"
          });
        }
      }
    );
  };

  passport.use(
    new LocalStrategy(
      { usernameField: "username", passwordField: "password" },
      authenticateUser
    )
  );
  // Stores user details inside session. serializeUser determines which data of the user
  // object should be stored in the session. The result of the serializeUser method is attached
  // to the session as req.session.passport.user = {}. Here for instance, it would be (as we provide
  //   the user id as the key) req.session.passport.user = {id: 'xyz'}
  passport.serializeUser((user, done) => done(null, user.practionerid));

  // In deserializeUser that key is matched with the in memory array / database or any data resource.
  // The fetched object is attached to the request object as req.user

  passport.deserializeUser((id, done) => {
    pool.query(`SELECT * FROM public."GenPractitioner" WHERE id = $1`, [id], (err, results) => {
      if (err) {
        return done(err);
      }
      console.log(`ID is ${results.rows[0].id}`);
      return done(null, results.rows[0]);
    });
  });
}

module.exports = initialize;
