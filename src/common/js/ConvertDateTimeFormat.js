export const ConvertToISODateTimeFormat = (date) => {
  console.log("Date = ", date);
  const [datePart, timePart] = String(date).split(" ");
  const [day, month, year] = datePart.split("-");
  const [hour, minute] = timePart.split(":");

  // Forming the new date string in yyyy-mm-dd HH:MM format
  const newDateFormat = `${year}-${month}-${day} ${hour}:${minute}:00`;

  return newDateFormat;
};

export const ConvertToDateTimeFormat = (date) => {
  const [datePart, timePart] = String(date).split(" ");
  const [day, month, year] = datePart.split("-");
  const [hour, minute] = timePart.split(":");

  // Forming the new date string in yyyy-mm-dd HH:MM format
  const newDateFormat = `${day}-${month}-${year} ${hour}:${minute}`;

  return newDateFormat;
};


export const ConvertToJSDateFormat = (date) => {
  const [datePart, timePart] = String(date).split(" ");
  const [day, month, year] = datePart.split("-");
  const [hour, minute, seconds] = timePart.split(":");

  // Forming the new date string in yyyy-mm-dd HH:MM format
  const newDateFormat = `${month}-${day}-${year} ${hour}:${minute}:${seconds}`;

  return newDateFormat;
}
