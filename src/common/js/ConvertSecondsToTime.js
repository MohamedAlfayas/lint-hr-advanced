export const ConvertSecondsToTime = (sec) => {
    let time = sec === 0 ? "0" : new Date(sec * 1000)
        .toISOString()
        .slice(11, 16)


    const hours = (Math.floor(sec / 3600) < 10) ? "0" + Math.floor(sec / 3600) : Math.floor(sec / 3600);
    const minutes = (Math.floor((sec % 3600) / 60) < 10) ? "0" + Math.floor((sec % 3600) / 60) : Math.floor((sec % 3600) / 60);

    const formatted_time = `${hours}:${minutes}`;

    return formatted_time

}