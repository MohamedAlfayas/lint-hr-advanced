export const validate = (values) => {
    const errors = {}

    if (!values.email) {
        errors.email = ''
    } else if (
        !/^(?!.*\.\.)([a-zA-Z0-9]+([._+-][a-zA-Z0-9]+)*)@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,13}$/.test(values.email)) {
        errors.email = 'Enter a valid email address'
    }

    return errors
}