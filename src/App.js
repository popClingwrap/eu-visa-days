import Calendar from "./components/calendar";
import CalendarContext from "./store/calendar-ctx";
import {useState, useEffect} from "react";

const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
const calendarModel = [];//Date for every date in the valid range - from 180 days ago to the furthest trip date in the future

const offsetFromToday = (offsetDays)=>{//Returns a Date that is offset from today by a given amount of days
    const responseDate = new Date(today);
    responseDate.setDate(responseDate.getDate() + offsetDays);
    return responseDate;
}

const cutOff = offsetFromToday(-180);

const DUMMY_DATA = [
    {//this trip is to straddle the 180-day mark and test trimming
        startDate: offsetFromToday(-182),
        endDate: offsetFromToday(-178)
    },
    {
        startDate: new Date(2022, 8, 6),
        endDate: new Date(2022, 8, 27)
    },
    {
        startDate: new Date(2022, 11, 20),
        endDate: new Date(2022, 11, 27)
    },
    {
        startDate: new Date(2023, 1, 7),
        endDate: new Date(2023, 2, 7)
    },
    {
        startDate: new Date(2023, 2, 29),
        endDate: new Date(2023, 3, 12)
    },
    {//this trip is to occur in the future
        startDate: offsetFromToday(2),
        endDate: offsetFromToday(4)
    }
];

const currentData = DUMMY_DATA
    .sort((a,b)=>{//Sort trips chronologically by start date
        if(a.startDate < b.startDate) return -1;
        if(a.startDate > b.startDate) return 1;
        return 0;
    })
    .map(trip=>{//Map to array of all dates in trip
        const dates = [];
        const tempDate = new Date(trip.startDate);
        while(tempDate <= trip.endDate){//Expand the start/end dates to a full range of dates
            dates.push({
                tripId: trip.startDate.getTime(),//Relate each date item to its parent trip
                date: new Date(tempDate)
            });

            tempDate.setDate(tempDate.getDate()+1)
        }

        return dates
    })
    .reduce((acca, val)=>{//Reduce to a 1 dimensional array of all dates associated with a trip
        return acca.concat(val);
    },[]);


//Populate the model with all dates in the valid range - 180 days in the past to the furthest provided date in the future
const tempDate = new Date(currentData.at(-1).date);

while(tempDate >= cutOff){
    const data = {
        tripId: null,
        date: new Date(tempDate)
    };

    //If the date is part of a trip then keep that association
    if(tempDate.getTime() === currentData.at(-1).date.getTime()){
        data.tripId = currentData.at(-1).tripId;
        currentData.pop()
    }

    calendarModel.unshift(data);
    tempDate.setDate(tempDate.getDate()-1);
}

function App() {
    const [model, setModel] = useState(calendarModel);
    useEffect(()=>{
        let fromLs = localStorage.getItem('allTrips');
        console.log(fromLs)
    }, []);

    return (
        <div className="App">
            <CalendarContext.Provider value={{model, setModel}}>
                <Calendar></Calendar>
            </CalendarContext.Provider>
        </div>
    );
}

export default App;
