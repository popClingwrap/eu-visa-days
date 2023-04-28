import styles from "./calendar-day.module.css";

const monthFormatter = new Intl.DateTimeFormat(undefined, {month: 'short'});
const dayFormatter = new Intl.DateTimeFormat(undefined, {day: '2-digit'});
const yearFormatter = new Intl.DateTimeFormat(undefined, {year:'numeric'});
let color = null;

function CalendarDay(props){
    color = `#${props.tripId ? props.tripId.toString(16).substring(1, 6).split().reverse().join('').padEnd(6, '0') : 'dadada'}`;

    return (
        <div className={`
            ${styles.border}
            ${props.tripId ? styles.isTrip : ''}
            `}

             onMouseDown={(e)=> {
                 props.mouseDownHandler(e, props.date.getTime())
             }}

             onMouseUp={(e)=> {
                 props.mouseUpHandler(e, props.date.getTime())
             }}

             onMouseEnter={(e)=> {
                 props.mouseOverHandler(e, props.date.getTime())
             }}
        >
            <div className={styles['month-area']}>
                <h1>{monthFormatter.format(props.date).toUpperCase()}</h1>
            </div>
            <div className={styles['day-area']} style={{background:color}}>
                <p>{yearFormatter.format(props.date)}</p>
                <p>{dayFormatter.format(props.date)}</p>
            </div>
        </div>
    );
}

export default CalendarDay;