import Calendar from "./components/calendar";
import CalendarContext from "./store/calendar-ctx";
import {useState, useEffect} from "react";

const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
const offsetFromToday = (offsetDays)=>{//Returns a Date that is offset from today by a given amount of days
    const responseDate = new Date(today);
    responseDate.setDate(responseDate.getDate() + offsetDays);
    return responseDate;
}

const getAllTripDates = (tripsArr)=>{
    if(!tripsArr) return [];

    return tripsArr.sort((a,b)=>{//Sort trips chronologically by start date
        if(a.s < b.s) return -1;
        if(a.s > b.s) return 1;
        return 0;
    })
        .map(trip=>{//Map to array of all dates in trip
            const dates = [];
            const tempDate = new Date(trip.s);
            const limit = new Date(trip.e)
            while(tempDate <= limit){//Expand the start/end dates to a full range of dates
                dates.push({
                    tripId: trip.s,//Relate each date item to its parent trip
                    date: new Date(tempDate)
                });

                tempDate.setDate(tempDate.getDate()+1)
            }

            return dates
        })
        .reduce((acca, val)=>{//Reduce to a 1 dimensional array of all dates associated with a trip
            return acca.concat(val);
        },[]);
}

const createModel = (allTripDates)=>{
    const cutOff = offsetFromToday(-180);
    const tempDate = allTripDates.length > 0 ? new Date(allTripDates.at(-1).date) : new Date();
    const res = [];
    //Populate the model with all dates in the valid range - 180 days in the past to the furthest provided date in the future
    while(tempDate >= cutOff){
        const data = {
            tripId: null,
            date: new Date(tempDate)
        };

        //If the date is part of a trip then keep that association
        if(tempDate.getTime() === allTripDates.at(-1).date.getTime()){
            data.tripId = allTripDates.at(-1).tripId;
            allTripDates.pop()
        }

        res.unshift(data);
        tempDate.setDate(tempDate.getDate()-1);
    }

    return res;
}

function App() {
    const [model, setModel] = useState([]);

    useEffect(()=>{
        let dataStr = localStorage.getItem('allTrips');
        let dataObj = JSON.parse(dataStr||'{}');
        setModel(createModel(getAllTripDates(dataObj)));
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
