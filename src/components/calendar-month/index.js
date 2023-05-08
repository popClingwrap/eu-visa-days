import styles from './calendar-month.module.css';
import CalendarDay from "../calendar-day";

export default function CalendarMonth(props) {
    return <div className={styles.month}>
        <div className={styles['month-header']}>
            <div className={styles.label}>{new Intl.DateTimeFormat(undefined, {month:"long", year:'numeric'}).format(props.days[0].date)}</div>
            <div className={styles.strike}></div>
        </div>
        <div className={styles.days}>
            {props.days.map(day=>{
                return <CalendarDay
                    tripId={day.tripId}
                    date={day.date}
                    status={day.status}
                    key={day.date.getTime()}
                    mouseDownHandler={props.mouseDownHandler}
                    mouseOverHandler={props.mouseOverHandler}
                    mouseUpHandler={props.mouseUpHandler}
                ></CalendarDay>
            })}
        </div>
    </div>
}