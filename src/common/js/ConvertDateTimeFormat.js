export const ConvertToISODateTimeFormat = (date) => {
  if (!date) return null; // return null if input is invalid

  const parts = String(date).split(" ");
  if (parts.length < 2) return null; // ensure we have date + time

  const [datePart, timePart] = parts;
  const [day, month, year] = datePart.split("-");
  const [hour, minute] = timePart.split(":");

  // Forming the new date string in yyyy-mm-dd HH:MM:ss format
  return `${year}-${month}-${day} ${hour}:${minute}:00`;
};

export const ConvertToDateTimeFormat = (date) => {
  if (!date) return null; // if date is null/undefined/empty, stop here

  const parts = String(date).split(" ");
  if (parts.length < 2) return null; // must have "date time"

  const [datePart, timePart] = parts;

  // validate both date & time
  if (!datePart || !timePart) return null;

  const [day, month, year] = datePart.split("-");
  const [hour = "00", minute = "00"] = timePart.split(":"); // default values

  // return in dd-mm-yyyy HH:mm format
  return `${day}-${month}-${year} ${hour}:${minute}`;
};



export const ConvertToJSDateFormat = (date) => {
  const [datePart, timePart] = String(date).split(" ");
  const [day, month, year] = datePart.split("-");
  const [hour, minute, seconds] = timePart.split(":");

  // Forming the new date string in yyyy-mm-dd HH:MM format
  const newDateFormat = `${month}-${day}-${year} ${hour}:${minute}:${seconds}`;

  return newDateFormat;
}
