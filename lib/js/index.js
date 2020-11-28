const {Client} = require("pg");
const express = require("express")
const path = require("path")
const app = express()
const bcrypt = require("bcrypt");
const passport = require("passport")
const passportPract = require("passport")
const flash = require("express-flash");
const session = require("express-session");

//require("./fhir-client");
//require("./get-data-test");
//require("./lib/css/styles.css");
app.use(express.json())
app.use(express.urlencoded({extented:false}))
app.use(express.static(__dirname + '../..'));
app.set('views', __dirname + '../..');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('css', express.static(path.join(__dirname, '../css')))
app.set('js', express.static(path.join(__dirname, '../js')))
app.set('view engine', 'html'); 
const initializePassport = require("./passportConfig");
const initializePractitionerPassport = require("./passPractitionerConfig");

app.use(
    session({
      // Key we want to keep secret which will encrypt all of our information
      secret: "secret",
      // Should we resave our session variables if nothing has changes which we dont
      resave: false,
      // Save empty value if there is no vaue which we do not want to do
      saveUninitialized: false
    })
  );
  initializePassport(passport);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
/*initializePractitionerPassport(passportPract);
app.use(passportPract.initialize());
app.use(passportPract.session());*/






const client = new Client({
    user: 'gendb',
    host: 'localhost',
    database: 'gendb',
    password: 'gendb',
    port: 32784,

})

app.get("/", (req, res) => 
{
    var path1 = path.join(__dirname, '../..', 'login.html');
    res.sendFile(path1);
})

app.get("/users/index", (req, res) => 
{
    app.use(express.static(path.join(__dirname, '../css')))
    app.use(express.static(path.join(__dirname, '../js')))
    var path1 = path.join(__dirname, '../..', 'index');
    res.render(path1,{ user: req.user.fhirid });
})

app.get("/users/login", (req, res) => 
{
    app.use(express.static(path.join(__dirname, '../css')))
    app.use(express.static(path.join(__dirname, '../js')))
    var path1 = path.join(__dirname, '../..', 'login');
    res.render(path1);
})

app.get("/users/practitioner", async (req, res) => 
{
    app.use(express.static(path.join(__dirname, '../css')))
    app.use(express.static(path.join(__dirname, '../js')))
    var path1 = path.join(__dirname, '../..', 'Practitioner');
    
    try
    {
        var stringquery = 'select fhirid from public.\"GenPractitioner\" inner join public.\"GenPatient\" on \
        public.\"GenPractitioner\".practionerid = public.\"GenPatient\".practionerid where \
       public.\"GenPractitioner\".practionerid= $1';
       client.query(
        stringquery,
      [req.user.practionerid],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log('Found patients with count:' +results.rowCount)
        res.render(path1,{ fhirid: req.user.practionerfhirid, name: req.user.practionername,tblids:JSON.stringify(results.rows) });;
    })
    }
    catch(e)
    {
        console.log(exception);
        return []
    }
   
    
})
app.get("/users/logout", (req, res) => {
  req.logout();
  app.use(express.static(path.join(__dirname, '../css')))
    app.use(express.static(path.join(__dirname, '../js')))
    var path1 = path.join(__dirname, '../..', 'login');
    res.render(path1);
});
app.get("/getpatient",async (req,res) => 
{
    
    try{
        //res.send("Got inside the getpatient");
        const user = req.query.userId;         
        const rows = await readpatientbyId(user); 
        res.setHeader("content-type","application/json")
        res.send(JSON.stringify(rows));     
    
        }
        catch(exception)
        {
            console.log(exception);
            res.send([]);
        }
       
}
)



app.post(
    "/users/login",
    passport.authenticate("local", {       
        
      successRedirect: "/users/index",
      failureRedirect: "/",
      failureFlash: true
    
    })
  );

  app.post(
    "/practitioner/login",
    passport.authenticate("local", {       
        
      successRedirect: "/users/practitioner",
      failureRedirect: "/",
      failureFlash: true
    
    })
  );
  app.get("/users/register", (req, res) => {
    app.use(express.static(path.join(__dirname, '../css')))
    app.use(express.static(path.join(__dirname, '../js')))
    var path1 = path.join(__dirname, '../..', 'register');
    res.render(path1);
  });

  app.post("/users/register", async (req, res) => {
    let { practitionername, username, password, password2,fhirid } = req.body;
  
    let errors = [];
  
    console.log({
      practitionername,
      username,
      password,
      password2,
      fhirid
    });
  
    if (!practitionername || !username || !password || !password2) {
      errors.push({ message: "Please enter all fields" });
    }
  
   // if (password.length < 6) {
     // errors.push({ message: "Password must be a least 6 characters long" });
    //}
  
   // if (password !== password2) {
     // errors.push({ message: "Passwords do not match" });
    //}
  
    if (errors.length > 0) {
      res.render("register", { errors, practitionername,username, password, password2,fhirid });
    } else {
      hashedPassword = password;//await bcrypt.hash(password, 10);
      var practitionerfhirid="";
      var practitionerid=0;
      console.log(hashedPassword);
      client.query('select practionerfhirid,practionerid from public."GenPractitioner" where username=$1',
     [practitionername]
     ,
        (err, results) => {
          if (err) {
            console.log(err);
          }
          if(results.rows.length>0)
          {
            practitionerfhirid=results.rows[0].practionerfhirid;
            practitionerid=results.rows[0].practionerid;

          }
          else{
            return res.render("register", {
              message: "Practitioner's Username incorrect"
            });
          }
        })
           // Validation passed
           client.query(
        `SELECT * FROM public.\"GenPatient\" WHERE username = $1`,
        [username],
        (err, results) => {
          if (err) {
            console.log(err);
          }
          console.log(results.rows);
  
          if (results.rows.length > 0) {
            return res.render("register", {
              message: "Username already registered"
            });
          }           
          else{
            client.query(
              `INSERT INTO public."GenPatient"(
                 username, hashedpassword, fhirid, practionerid, practionerfhirid, practionername)
                VALUES ($1, $2, $3, $4, $5, $6);`,
              [username, password, fhirid,practitionerid,practitionerfhirid,practitionername],
              (err, results) => {
                if (err) {
                  throw err;
                }
                console.log(results.rows);
                req.flash("success_msg", "Patient is registered. Please log in");
                res.redirect("/users/login");
              }
            );
          }
        }
      );
    }
  });
  
  
  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect("/users/index");
    }
    next();
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect("/users/login");
  }
  
app.listen(8080,() => console.log("web api listening"))
start()

async function start() {
    await connect();
}

async function connect() {
    try {
        await client.connect(); 
    }
    catch(e) {
        console.error(`Failed to connect ${e}`)
    }
}

 async function readpatientbyId(userid)
{
    try
    {
        const result = await client.query('select fhirid from public."GenPatient" where username= \''+userid+'\'')
        return  result.rows;
    }
    catch
    {
        console.log(exception);
        return []
    }
}

async function getPractionersPatient(practitionerId)
{
    try
    {
        var stringquery = 'select fhirid, public.\"GenPractitioner\".practionername, public.\"GenPractitioner\".practionerfhirid from public.\"GenPractitioner\" inner join public.\"GenPatient\" on \
        public.\"GenPractitioner\".practionerid = public.\"GenPatient\".practionerid where \
       public.\"GenPractitioner\".practionerid= $1';
       await client.query(
        stringquery,
      [practitionerId],
      (err, results) => {
        if (err) {
          throw err;
        }
        console.log('Found patients with count:' +results.rowCount)
        return  results.rows;
    })
    }
    catch(e)
    {
        console.log(exception);
        return []
    }
}

function getLoggedInPatient(userid)
{
    
    try{
    
    client.connect();
    console.log("connected succesfully");
    const results = client.query('select * from public."GenPatient" where username ='+"'"+userid+"'");
    return results.rows;

    }
    catch
    {
        console.log(exception);
        return [];
    }
    

}