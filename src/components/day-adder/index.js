import styles from './day-adder.module.css';

export default function DayAdder(props){
    const clickHandler = ()=>{
        props.onClick(props.days);
    }

    return <div className={styles.wrapper}>
        <div className={styles.border} onClick={clickHandler}>
            <div className={styles['month-area']}>
                <span className="material-symbols-outlined">add_circle</span>
                <span>90 Days</span>
            </div>
        </div>
    </div>
}