const express=require("express")
const mongoose=require("mongoose")
const bodyParser=require("body-parser")
const jwt=require("jsonwebtoken")
const cookieParser=require("cookie-parser")
const User=require("./models/user")
const app=express()
const bcrypt=require('bcryptjs');
// require('./connection')
const mysql = require('mysql'); 
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database:"tomarrow_land"
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Database Connected!");
});
// mongoose.connect("mongodb://localhost:27017/API",{
//     useNewUrlParser:true,
//     useUnifiedTopology:true,
// }).then(()=>{
//     console.log("database connected successfully!")
// }).catch((error)=>{
//     console.log("got error while connecting!")
// })
const createToken=(id)=>{
    return jwt.sign({id},"secret",{
        expiresIn:"20d"
    });
}
app.listen(3000,()=>{
    console.log("Running on port 3000 successfully")
})
app.use(cookieParser())
app.get('/',(req,res)=>{
    res.send("Hello This is for API's")
})
const salt=bcrypt.genSaltSync();
app.use(bodyParser.urlencoded({ extended: false }));    
app.post('/app/user',async (req,res)=>{
    const selected=`SELECT username from user where username='${req.body.username}'`
    con.query(selected,async(err,result)=>{
        if(err){
            console.log("Got error while checking if register",err)
            res.send(err)
        }
        else if(result.length===0){
            console.log(result,"got res")
            // res.send("You have already registered. please login")
            
            const password= bcrypt.hashSync(req.body.password,req.body.password);
            const hash=bcrypt.compareSync(req.body.password,password);
            console.log(hash,"00000000")
            // console.log(salt,password)
            const q=`INSERT INTO user (username,password) VALUES ('${req.body.username}','${password}');`
            con.query(q,(err,r)=>{
                if(err){
                    console.log("Got error while inserting",err)
                    // throw err
                    res.status(400).send(JSON.stringify({status:err.code,status_code:400}))
                }
                else{
                    console.log("Record inserted successfully!")
                    // res.send("successful created")
                    res.json(JSON.stringify({status:"Account successfully created",status_code:200}))
                }
            })
        }else{
            console.log("already present in the database")
            // res.send("Account is already created")
            res.json(JSON.stringify({status:"Account is already created",status_code:200}))
        }
    })
    // res.send("Success")
})
app.post('/app/user/login',async(req,res)=>{
    const username=req.body.username;
    try{
        const selected=`SELECT username,password from user where username='${username}' limit 1`
        con.query(selected,async(err,result)=>{
            if(err){
                console.log("error while logging in")
            }
            else if(result.length===1){
                // console.log(JSON.stringify(result[0]["password"]))
                const password=result[0]["password"]
                const gen=bcrypt.hashSync(req.body.password,10)
                const auth=bcrypt.compareSync(req.body.password,gen)
                console.log(auth)
                if(password===gen){
                    console.log("You have logged in successfully",auth)
                    res.json({
                        status:"success",
                        username:username,
                        status_code:200,
                    })
                }
                else{
                    console.log("You have entered wrong password",auth,req.body.password)
                    res.json(JSON.stringify({
                        status:"Incorrect username/ password provided. Please retry",
                        status_code:401,
                    }))
                }
            }
            else{
                res.json(JSON.stringify({
                    status:"You're not registered. Please register and retry"
                }))
            }
        })
    }catch(error){
        res.send(error)
    }
})