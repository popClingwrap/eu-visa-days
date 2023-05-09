import Calendar from "./components/calendar";
import CalendarContext from "./store/calendar-ctx";
import {useState, useEffect} from "react";
import Header from "./components/header";
import Disclaimer from "./components/disclaimer";

function App() {
    const [model, setModel] = useState([]);

    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const offsetFromToday = (offsetDays)=>{//Returns a Date that is offset from today by a given amount of days
        const responseDate = new Date(today);
        responseDate.setDate(responseDate.getDate() + offsetDays);
        return responseDate;
    }

    const cutOff = offsetFromToday(-180);

    const getAllTripDates = (tripsArr)=>{
        //For test purposes, a place to push edge-case data into the feed before it is parsed
        // tripsArr=[{
        //     s: offsetFromToday(-20).getTime(),
        //     e: offsetFromToday(-10).getTime()
        // }]

        if(!tripsArr) return [];

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
            .reduce((acca, val)=>{//Reduce to a 1 dimensional array of all dates associated with any trip
                return acca.concat(val);
            },[]);
    }

    const createModel = (allTripDates)=>{
        const tempDate = allTripDates.length > 0
            ? new Date(Math.max(allTripDates.at(-1).date.getTime(), today.getTime()))
            : new Date(today.getTime());

        const res = [];

        //Populate the model with all dates in the valid range - 180 days in the past to the furthest provided date in the future
        while(tempDate >= cutOff){
            const data = {
                tripId: null,
                date: new Date(tempDate)
            };

            if(allTripDates.length > 0 && tempDate.getTime() === allTripDates.at(-1).date.getTime()){
                data.tripId = allTripDates.at(-1).tripId;
                allTripDates.pop()
            }

            res.unshift(data);
            tempDate.setDate(tempDate.getDate()-1);
        }

        return res;
    }

    useEffect(()=>{
        let dataStr = localStorage.getItem('allTrips');
        let dataObj = JSON.parse(dataStr||'[]');
        setModel(createModel(getAllTripDates(dataObj)));
    }, []);

    return (
        <div className="App">
            <Header></Header>
            <Disclaimer></Disclaimer>
            <CalendarContext.Provider value={{model, setModel}}>
                <Calendar></Calendar>
            </CalendarContext.Provider>
        </div>
    );
}

export default App;
