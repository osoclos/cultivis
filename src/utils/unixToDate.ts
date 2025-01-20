export const MONTH_NAMES: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export function unixToDate(unix: number): string {
    const date = new Date(unix);
        
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    return `${day} ${MONTH_NAMES[month]} ${year}`;
}