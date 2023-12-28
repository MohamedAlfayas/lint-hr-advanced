export const ConvertSecondsToTime = (sec) => {
    // const hours = (Math.floor(sec / 3600) < 10) ? "0" + Math.floor(sec / 3600) : Math.floor(sec / 3600);
    const hours = String(Math.floor(sec / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
    const formatted_time = sec > 0 ? `${hours}:${minutes} Hr` : "-";
    return formatted_time
}