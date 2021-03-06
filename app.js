const express=require("express")
const mongoose=require("mongoose")
const bodyParser=require("body-parser")
const jwt=require("jsonwebtoken")
const cookieParser=require("cookie-parser")
const User=require("./models/user")
const app=express()
const bcrypt=require('bcryptjs');
const stations=[ 
    {
        "arrival_station": "Borivali",
        "arrival_time": "9:30 AM",
        "destination_station": "Kurla",
        "destination_time": "3:30 PM"
    },
    {
        "arrival_station": "Borivali",
        "arrival_time": "7:30 AM",
        "destination_station": "Kandivali",
        "destination_time": "8:30 AM"
    },
    {
        "arrival_station": "Bandra",
        "arrival_time": "7:30 AM",
        "destination_station": "Kurla",
        "destination_time": "8:30 AM"
    }
]
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
const station_table="CREATE TABLE `tomarrow_land`.`stations` ( `arrival_station` VARCHAR(20) NOT NULL , `arrival_time` VARCHAR(10) NOT NULL , `destination_station` VARCHAR(20) NOT NULL , `destination_time` VARCHAR(10) NOT NULL ) ENGINE = InnoDB;"
con.query(station_table,()=>{
    console.log("Stations Table created successfully!")
})
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
            
            const password= bcrypt.hashSync(req.body.password,10);
            const hash=bcrypt.compareSync(req.body.password,password);
            console.log(hash,"00000000")
            // console.log(salt,password)
            const q=`INSERT INTO user (username,password) VALUES ('${req.body.username}','${password}');`
            con.query(q,(err,r)=>{
                if(err){
                    console.log("Got error while inserting",err)
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
                const auth=bcrypt.compareSync(req.body.password,password)
                console.log(auth,password,gen)
                if(auth){
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
app.get('/app/sites/list/:arrival_station_name/:sort_by_arrival_time',(req,res)=>{
    const sortAT=req.params.sort_by_arrival_time
    const arrivalST=req.params.arrival_station_name
    if(arrivalST){
        res.json(stations.filter((item)=>item.arrival_station===arrivalST))
    }else{
        res.json(stations)
    }
})