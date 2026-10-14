import { useFormState, useWatch } from "react-hook-form";

/**
 * Lets the legacy `LocationSearch` map widget (which expects a whole-object
 * setter plus a Formik instance) read and write a React Hook Form form.
 */
const useLocationSearchBridge = ({ control, setValue, setError, trigger }) => {
  const locationObj = useWatch({ control });
  const { errors, touchedFields } = useFormState({ control });

  const setLocationObj = (next) => {
    Object.keys(next || {}).forEach((key) => {
      if (next[key] === locationObj?.[key]) return;
      setValue(key, next[key], {
        shouldDirty: true,
        shouldValidate: !!errors[key] || !!touchedFields[key],
      });
    });
  };

  const LocationFormikForm = {
    errors: Object.fromEntries(
      Object.entries(errors).map(([key, err]) => [key, err?.message]),
    ),
    touched: touchedFields,
    setFieldValue: (name, value) =>
      setValue(name, value, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      }),
    setFieldTouched: () => {},
    setFieldError: (name, message) =>
      message ? setError(name, { type: "manual", message }) : trigger(name),
  };

  return { locationObj, setLocationObj, LocationFormikForm };
};

export default useLocationSearchBridge;
