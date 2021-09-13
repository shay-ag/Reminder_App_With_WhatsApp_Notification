require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

//configuration
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors());

//database setup
mongoose.connect('mongodb://localhost:27017/reminderAppDB', 
    {   useNewUrlParser: true, 
        useUnifiedTopology: true
    }, (err) => {
    if(err){
        console.log(err);
    } else{
        console.log("Database Connected");
    }
});

const ReminderSchema = new mongoose.Schema({
    reminderMsg: { type: String, require: true},
    remindAt: {type: String, require: true },
    remindStatus: { type: Boolean, require: true}
});

const Reminder = new mongoose.model('reminder', ReminderSchema);

//whatsapp reminder functionality

setInterval( () => {
    Reminder.find({}, (err, reminderList) => {
        if(err){
            console.log(err);
        }
        if(reminderList){
            reminderList.forEach( (reminder) => {
                if(!reminder.remindStatus){
                    const now = new Date();
                    if((new Date(reminder.remindAt) - now) < 0){
                        Reminder.findByIdAndUpdate(reminder._id, {remindStatus: true}, (err, remindObj) => {
                            if(err){
                                console.log(err);
                            } else{
                                const accountSid = process.env.accountSid; 
                                const authToken = process.env.authToken; 
                                const client = require('twilio')(accountSid, authToken); 
                                
                                  client.messages 
                                        .create({ 
                                           body: reminder.reminderMsg, 
                                           from: process.env.whatsappfrom,       
                                           to: process.env.whatsappto 
                                         }) 
                                        .then(message => console.log(message.sid)) 
                                        .done();
                            }
                        })
                    }
                }
            })
        }
    })

}, 1000)

    

//REST API Routes
app.get("/getAllReminders", (req, res) => {

    Reminder.find( {}, (err, reminderList) => {
        if(err){
            console.log(err);
        } else{
            res.send(reminderList);
        }
    });

});

app.post("/addReminder", (req, res) => {

    const { reminderMsg, remindAt } = req.body;

    const reminder = new Reminder({
        reminderMsg,
        remindAt,
        remindStatus: false
    });

    reminder.save( (error) => {
        if(error){
            console.log(error);
        } else{
            Reminder.find({}, (err, reminderList) => {
                if(err){
                    console.log(err);
                } else{
                    res.send(reminderList); 
                }
            })
        }
    })
});

app.post("/deleteReminder", (req, res) => {

    const id = req.body.id;

    Reminder.deleteOne({_id: id}, (error) => {
        if(error){
            console.log(error);
        } else{
            Reminder.find({}, (err, reminderList) => {
                if(err){
                    console.log(err);
                } else {
                    res.send(reminderList);
                }
            })
        }
    })
});

app.listen(5000, (req, res) => {
    console.log("Server started on PORT 5000");
});

