import Calendar from "./components/calendar";
import CalendarContext from "./store/calendar-ctx";
import {useState, useEffect} from "react";

const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
const offsetFromToday = (offsetDays)=>{//Returns a Date that is offset from today by a given amount of days
    const responseDate = new Date(today);
    responseDate.setDate(responseDate.getDate() + offsetDays);
    return responseDate;
}

const cutOff = offsetFromToday(-180);

const getAllTripDates = (tripsArr)=>{

    //For test purposes, add a trip that straddles the 180-day mark and test trimming
    tripsArr.unshift({
        s: offsetFromToday(-182).getTime(),
        e: offsetFromToday(-177).getTime()
    })

    if(!tripsArr) return [];

    console.log(`Trips that start before the 180 cutoff point should be adjusted so that they exist as a trip that STARTS on the cutoof day and have a tripID that natches otherwise the tripId as start datew rule breaks when they get resaved`)
    return tripsArr
        .filter(trip=>trip.e >= cutOff.getTime())//Filter out stored trips that ended further back that the cutoff
        .sort((a,b)=>{//Sort remaining trips chronologically by start date
        if(a.s < b.s) return -1;
        if(a.s > b.s) return 1;
        return 0;
    })
        .map(trip=>{//Map to array of all dates in trip (those between the provided start and end dates)
            trip.s = Math.max(trip.s, cutOff.getTime());
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
