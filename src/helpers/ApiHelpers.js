const getLoggedInEmployeeToken = () => {
    const token = localStorage.getItem("token");
    if (!token) {
        return null;
    } else {
        return JSON.parse(token);
    }
};

export { getLoggedInEmployeeToken }