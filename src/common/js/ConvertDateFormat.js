export const ConvertDateFormat = (inputDate) =>{
    // Assuming inputDate is in the 'dd-mm-yyyy' format
    const parts = inputDate.split('-');
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
}