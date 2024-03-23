import dayjs from "dayjs";

export const ConvertDateFormat = (inputDate) => {
  // Assuming inputDate is in the 'dd-mm-yyyy' format
  const parts = inputDate.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    // Create a new Date object using the parts and format it to 'yyyy-mm-dd'
    const convertedDate = `${day}-${month}-${year}`;
    // Use toISOString() to get the date in 'yyyy-mm-dd' format
    return convertedDate;
  } else {
    // If the input format is invalid, return the original string
    return inputDate;
  }
};
export const convertHolidayDateFormat = (dateString) => {
  const [year, month, day] = dateString.split("-");
  return `${day}-${month}-${year}`;
};

export const ConvertDayNameFromISO = (start) => {
  const date = new Date(start);
  const days = { weekday: "long" };
  const daysName = date.toLocaleDateString("en-US", days);
  return daysName;
};

export const ConvertISODateFormat = (dateString) => {
  const originalDate = new Date(String(dateString));

  

  // Get the components of the date
  const year = originalDate.getFullYear();
  const month = (originalDate.getMonth() + 1).toString().padStart(2, "0"); // Adding 1 because months are zero-indexed
  const day = originalDate.getDate().toString().padStart(2, "0");

  // Format the date in the "yyyy-mm-dd" format
  const formattedDate = `${year}-${month}-${day}`;

  return formattedDate;
};

export const convertDate = (inputDateString) => {
  const inputDate = new Date(inputDateString);

  const day = inputDate.getDate().toString().padStart(2, "0");
  const month = (inputDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
  const year = inputDate.getFullYear();

  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
};
export const convertTime = (inputTimeString) => {
  const [hours, minutes] = inputTimeString.match(/\d+/g);

  const formattedTime = `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;

  return formattedTime;
};

export const convertFromToDateFormat = (originalDate) => {
  const [datePart, timePart] = originalDate.split(" ");
  const [year, month, day] = datePart.split("-");
  const formattedDate = `${day}-${month}-${year} ${timePart}`;
  return formattedDate;
};
export const previousDateFormat = (dateString) => {
  // Create a Date object from the provided dateString
  const originalDate = new Date(dateString);
  
  // Subtract 18 years from the original date
  const newDate = new Date(originalDate.getFullYear() - 18, originalDate.getMonth(), originalDate.getDate());

  // Convert the new date to the desired format (assuming ISO format for now)
  const isoDate = newDate.toISOString().split('T')[0]; // Extracting date portion

  return isoDate;
};
// export const convertDateTimeFormat = (originalDate) => {
//   const dateObject = new Date(originalDate);

//   const day = String(dateObject.getDate()).padStart(2, "0");
//   const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are zero-based
//   const year = dateObject.getFullYear();

//   const hours = String(dateObject.getHours()).padStart(2, "0");
//   const minutes = String(dateObject.getMinutes()).padStart(2, "0");

//   const formattedDate = `${day}-${month}-${year} ${hours}:${minutes}`;
//   return formattedDate;
// };

export const timeConvert = (decimalHours) => {
  const hours = Math.floor(decimalHours);
  const minutes = (decimalHours - hours) * 60;
  const formattedTime = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
  return formattedTime;
};

export const DateFormated = (inputDate) => {
  // Assuming inputDate is in the format "yyyy-mm-dd"
  const [year, month, day] = inputDate.split("-");

  // Format the date as "dd-mm-yyyy"
  const formattedDate = `${day}-${month}-${year}`;

  return formattedDate;
};
