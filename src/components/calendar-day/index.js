import styles from "./calendar-day.module.css";

const monthFormatter = new Intl.DateTimeFormat(undefined, {month: 'short'});
const dayDateFormatter = new Intl.DateTimeFormat(undefined, {day: '2-digit'});
const dayNameFormatter = new Intl.DateTimeFormat(undefined, {weekday: 'short'});
const yearFormatter = new Intl.DateTimeFormat(undefined, {year:'numeric'});
let color = null;

function CalendarDay(props){
    // color = `#${props.tripId ? props.tripId.toString(16).substring(1, 6).split().reverse().join('').padEnd(6, '0') : 'dadada'}`;
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
            {props.allowanceIndex && <div className={styles.legality}>{props.allowanceIndex}</div>}
            <div className={styles['month-area']}>
                <h1>{monthFormatter.format(props.date).toUpperCase()}</h1>
            </div>
            <div className={`${styles['day-area']} ${props.allowanceIndex > 90 ? styles.illegal : styles.legal}`} style={{background:color}}>
                <p>{yearFormatter.format(props.date)}</p>
                <p>
                    <span>{dayNameFormatter.format(props.date).substring(0,1)}</span>
                    &nbsp;{dayDateFormatter.format(props.date)}
                </p>
            </div>
        </div>
    );
}

export default CalendarDay;