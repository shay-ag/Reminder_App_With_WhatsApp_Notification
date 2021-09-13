import React, {useState, useEffect} from 'react';
import './App.css';

import axios from 'axios';
import DateTimePicker from 'react-datetime-picker';

function App() {

  const [reminderMsg, setReminderMsg] = useState("");
  const [remindAt, setReminderAt] = useState();
  const [reminderList, setReminderList] = useState([]);

  useEffect( () => {
    axios.post("http://localhost:5000/getAllReminders").then( (res) => {
      setReminderList(res.data);
    })
  }, []);

  const handleChange = (event) => {
      setReminderMsg(event.target.value);
  }

  const addReminder = () => {
      axios.post("http://localhost:5000/addReminder", { reminderMsg, remindAt })
      .then( (res) => {
        setReminderList(res.data);
      });
      setReminderMsg("");
      setReminderAt();
  }

  const deleteReminder = (id) => {
      axios.post("http://localhost:5000/deleteReminder", { id })
      .then( res => setReminderList(res.data));
  }

  return (
    <div className="App">
    <div className="homepage">
    <h1 className="heading">WhatsApp Reminder Web Application </h1>
      <div className="homepage_header">
          <h1>Remind Me 🙋‍♂️</h1>
          <input type="text" placeholder="Reminder Notes Here..." onChange={handleChange} value={reminderMsg} />
          <DateTimePicker 
              value={remindAt}
              onChange={setReminderAt}
              minDate={new Date()}
              minutePlaceholder="mm"
              hourPlaceholder="hh"
              dayPlaceholder="DD"
              monthPlaceholder="MM"
              yearPlaceholder="YY"
          />
          <div className="button" onClick={addReminder}>Add Reminder</div>
      </div>

      <div className="homepage_body">

        {
          reminderList.map( (reminder) => {
            return(
              <div className="reminder_card" key={reminder._id}>
              <h2>{reminder.reminderMsg}</h2>
              <h3>Remind Me At: </h3>
              <p>{reminder.remindAt}</p>
              {/* <p>{ String(new Date(reminder.remindAt.toLocaleString( {timezone: "Asia/Kolkata"})))}</p> */}
              <div className="button" onClick={() => deleteReminder(reminder._id)}>Delete</div>
            </div>
            ) 
          })
        }

        

      </div>
    </div>
    </div>
  );
}

export default App;
