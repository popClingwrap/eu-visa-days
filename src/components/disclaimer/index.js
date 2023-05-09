import styles from './disclaimer.module.css';
export default function Disclaimer(){
    return <div className={styles.wrapper}>
        <p>This calculator is for reference only and does not constitute any actual right to stay in the EU.</p>
        <p>Select dates that you have traveled to, or plan to travel to, the EU by clicking them.</p>
        <p className={styles['desktop-only']}>Select ranges of dates by shift-clicking or dragging.</p>
        <p>Dates that fall outside the 90/180 day allowance will be flagged with an !</p>
    </div>
}