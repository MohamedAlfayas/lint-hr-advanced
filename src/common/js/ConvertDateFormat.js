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
