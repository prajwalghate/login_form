var express = require('express');
var router = express.Router();
var multer  = require('multer');
var passport = require('passport');
var LocalStrategy=require('passport-local');


var upload = multer({ dest: './uploads' });
var User = require('../models/user');



/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/registers', function(req, res, next) {
  res.render('register',{
      'title':'Register'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login',{
      'title':'Login'
  });
});





router.post('/register', upload.single('profileimage'),function(req, res, next){
    //get values
    var name=req.body.name;
    var email=req.body.email;
    var username=req.body.username;
    var password=req.body.password;
    var password2=req.body.password2;

    if(req.file){
        console.log('Uploading Image...');
        
        //file info
        var profileImageOriginalName=req.files.profileimage.originalname;
        var profileImageName=req.files.profileimage.name;
        var profileImageMime=req.files.profileimage.mimetype;
        var profileImagePath=req.files.profileimage.path;
        var profileImageExt=req.files.profileimage.extension;
        var profileImageSize=req.files.profileimage.size;
    }else{
        //set default image
        var profileImageName='noimage.png';
    }
    
    
    //form validation
    req.checkBody('name','Name field is required').notEmpty();
    req.checkBody('email','Email field is required').notEmpty();
    req.checkBody('email','Email not valid').isEmail();
    req.checkBody('username','UserName field is required').notEmpty();
    req.checkBody('password','Password field is required').notEmpty();
    req.checkBody('password2','Password do not match').equals(req.body.password);
    
    
    //check for errors
    var errors = req.validationErrors();
    //var errors=validationResult(req);
    if(errors){
        res.render('register',{
            errors:errors,
            name:name,
            email:email,
            username:username,
            password:password,
            password2:password2
          });
    }else{
        var newUser=new User({
            name:name,
            email:email,
            username:username,
            password:password,
            profileimage:profileImageName
            
        });
        
        //Create User
        User.createUser(newUser,function(err,user){
            if(err) throw err;
            console.log(user);
        });
        
        //success Message
        req.flash('success','You are now registered and may log in');
        
        res.location('/');
        res.redirect('/');
        
    } 
    
});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy(
function(username,password,done){
    User.getUserByUsername(username,function(err,user){
        if(err) throw err;
        if(!user){
            console.log('Unknown User');
            return done(null,false,{message: 'unlnown User'});
        }
        
        User.comparePassword(password,user.password, function(err,isMatch){
            if(err) throw err;
            if(isMatch){
                return done(null,user);
            } else {
                console.log('Invalid Password');
                return done(null,false, {message:'Invalid Password'});
       ""     }
        });
    }); 
}));

router.post('/login',passport.authenticate('local',{failureRedirect:'/users/login',failureFlash:'Invalid username or password'}),function(req,res){
    console.log('Authentication Successful');
    req.flash('Success','You are logged in');
    res.redirect('/');
});


router.get('/logout',function(req,res){
    req.logout();
    req.flash('successs','You Have Logged Out');
    res.redirect('/users/login');
});


module.exports = router;
 