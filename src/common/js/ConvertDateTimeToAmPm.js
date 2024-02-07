import { short_months } from "../constant/Constants";
import { ConvertToJSDateFormat } from "./ConvertDateTimeFormat";

export const GetAmPmDateTime = (dateTimeString) => {
    try {

        const dateObj = new Date(ConvertToJSDateFormat(dateTimeString));

        const day = parseInt(dateObj.getDate()) < 10 ? '0' + dateObj.getDate() : dateObj.getDate();
        const monthIndex = dateObj.getMonth();
        const year = dateObj.getFullYear();
        let hour = parseInt(dateObj.getHours()) < 10 ? '0' + dateObj.getHours() : dateObj.getHours();
        const minute = parseInt(dateObj.getMinutes()) < 10 ? '0' + dateObj.getMinutes() : dateObj.getMinutes();
        const ampm = hour >= 12 ? 'PM' : 'AM';

        // Convert 24-hour time to 12-hour time
        hour = hour % 12 || 12;

        return `${day} ${short_months[monthIndex]} ${year} - ${hour}:${minute} ${ampm}`;
    } catch (error) {
        return "";
    }
}