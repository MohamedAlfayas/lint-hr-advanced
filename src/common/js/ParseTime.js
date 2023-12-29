import { parse, format } from "date-fns";

export const ParseTime = (time) => {
    return parse(time, "dd-MM-yyyy HH:mm:ss", new Date());
};