import {useContext} from "react";
import CalendarContext from "../../store/calendar-ctx";
import CalendarDay from "../calendar-day";
import styles from './calendar.module.css';

let dragEffect = undefined;
let isDragging = false;
let shiftKey = false;
let shiftSelectedRange = [];

function Calendar(){
    const {model, setModel} = useContext(CalendarContext);

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
        while(startIndex <= endIndex){
            model[startIndex].tripId = newId;
            startIndex++;
        }
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

        setModel([...model]);
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
        else shiftSelectedRange = [index];
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

    return (
        <div id={styles.calendar}>
            {model.map(item=> {
                return <CalendarDay
                    tripId={item.tripId}
                    date={item.date}
                    key={item.date.getTime()}
                    mouseDownHandler={handleDayMouseDown}
                    mouseOverHandler={handleDayMouseOver}
                    mouseUpHandler={handleDayMouseUp}
                >
                </CalendarDay>
            })}
        </div>
    );
}

export default Calendar;