import {useContext, useRef, useEffect} from "react";
import CalendarContext from "../../store/calendar-ctx";
import styles from './calendar.module.css';
import DayAdder from "../day-adder";
import CalendarMonth from "../calendar-month";

let dragEffect = undefined;
let isDragging = false;
let shiftKey = false;
let shiftSelectedRange = [];
let numDates = 0;

function Calendar(){
    const {model, setModel} = useContext(CalendarContext);
    const nativeEl = useRef();

    //Get the earliest date that has a tripId and is directly connected to the data at <index> in the model
    const getEarliestSiblingIndex = (index)=>{
        while(true){
            index--;
            if(index < 0 || !model[index].tripId){
                return index+1;
            }
        }
    }

    //Start from the given index and assign that tripId to all subsequent connected dates
    const assignIdUpstream = (index)=>{
        if(model[index]?.tripId){
            let newId = model[index].date.getTime();
            while(index < model.length && model[index].tripId){
                model[index].tripId = newId;
                index++;
            }
        }
    }

    const toggleRange = (startIndex, endIndex, effect)=>{
        let newId = effect === 'show' ? model[startIndex].date.getTime() : null;
        const modelClone = [...model];
        while(startIndex <= endIndex){
            modelClone[startIndex].tripId = newId;
            startIndex++;
        }

        assignIdUpstream(getEarliestSiblingIndex(startIndex));

        setModel(checkLegality())
    }

    const toggleTargetItem = (index)=>{
        const data = model[index];
        const earliestSiblingIndex = getEarliestSiblingIndex(index)

        if(data.tripId){
            if(!dragEffect) dragEffect = 'hide';
            if(dragEffect === 'hide'){
                data.tripId = null;

                //Upstream date are now part of a new trip if they exist so reassign tripId
                assignIdUpstream(index+1);
            }
        }
        else {
            if(!dragEffect) dragEffect = 'show';
            if(dragEffect === 'show'){
                data.tripId = data.date.getTime()

                //If downstream dates exist this new selection is part of that trip so must take that tripId
                //If upstream dates also exist they will also be reassigned the same id as they are now joined
                assignIdUpstream(earliestSiblingIndex);
            }
        }

        setModel(checkLegality());
    }

    const handleDayMouseDown = (e, t)=>{
        const index = model.findIndex(i=>i.date.getTime() === t);
        toggleTargetItem(index);
        isDragging = true;

        shiftKey = e.shiftKey;
        if(shiftKey) {
            shiftSelectedRange.push(index);
            if(shiftSelectedRange.length === 2){
                toggleRange(
                    Math.min(shiftSelectedRange[0], shiftSelectedRange[1]),
                    Math.max(shiftSelectedRange[0], shiftSelectedRange[1]),
                    dragEffect
                );
                shiftSelectedRange = [];
                shiftKey = false;
            }
        }
        else {
            shiftSelectedRange = [index];
        }
    }

    const handleDayMouseOver = (e, t)=>{
        if(isDragging){
            const index = model.findIndex(i=>i.date.getTime() === t);
            toggleTargetItem(index);
        }
    }

    const handleDayMouseUp = ()=>{
        if(isDragging){
            dragEffect = undefined;
            isDragging = false;
            saveChanges();
        }
    }

    const checkLegality = ()=>{
        return model.map((item, index, arr)=>{
            if(item.tripId === null){//Date is not part of a trip so legality is not an issue
                return {
                    ...item,
                    allowanceIndex: null
                }
            }

            const startDate = arr[Math.max(index - 179, 0)].date;//The furthest date in the past with which to compare the current date item
            const euDays = arr.filter(prev=>{//Find the number of days spent in the EU prior to the date being checked
                return prev.tripId !== null
                    && prev.date.getTime() <= item.date.getTime()
                    && prev.date.getTime() >= startDate.getTime();
            })

            return {
                ...item,
                allowanceIndex: euDays.length//The index of this EU day as it stands within the last 180. If this goes over 90 it becomes illegal
            }
        })
    };

    const saveChanges = ()=>{
        const allTripDates = model.filter(i=>i.tripId);
        if(allTripDates.length === 0){//There are no dates selected in the current calendar - all indexes are null
            localStorage.removeItem('allTrips')
        }
        else{
            const toUpload = [{s:allTripDates[0].tripId, e:allTripDates[0].tripId}];
            allTripDates.forEach(d=>{
                if(d.tripId !== toUpload[0].s){
                    toUpload.unshift({s:d.tripId, e:d.tripId})
                }
                else{
                    toUpload[0].e = d.date.getTime();
                }
            })

            localStorage.setItem('allTrips', JSON.stringify(toUpload))
        }
    }

    //Add a span of new, blank dates to the end of the calendar
    const addDatesToCalendar = (n)=>{
        const tempDate = new Date(model[model.length-1].date);
        const modelClone = [...model];
        for(let count = 0; count < n; count++){
            tempDate.setDate(tempDate.getDate() + 1);
            modelClone.push({
                tripId: null,
                date: new Date(tempDate)
            })
        }

        setModel(modelClone);
    }

    useEffect(()=>{
        if(model.length > 0 && numDates !== model.length){//Dates have been added to the display
            nativeEl.current.scrollIntoView({block:'end', behavior:'smooth'});
            if(numDates === 0) {
                setModel(checkLegality());//First run
            }
            numDates = model.length;
        }
    }, [model]);

    const splitOutMonths = ()=>{
        let tempMonth;
        return model.map(item=>{
            if(item.date.getMonth() !== tempMonth){
                tempMonth = item.date.getMonth();
                const days = model.filter(i=>{
                    return item.date.getFullYear() === i.date.getFullYear() && item.date.getMonth() === i.date.getMonth();
                })
                return <CalendarMonth
                    key={item.date.getTime()}
                    days={days}
                    mouseDownHandler={handleDayMouseDown}
                    mouseOverHandler={handleDayMouseOver}
                    mouseUpHandler={handleDayMouseUp}
                ></CalendarMonth>
            }

            return undefined;
        });
    };

    return (
        <div id={styles.calendar} ref={nativeEl}>
            {splitOutMonths()}
            <DayAdder onClick={addDatesToCalendar} days={90}></DayAdder>
        </div>
    );
}

export default Calendar;