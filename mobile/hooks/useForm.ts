import { useState, useCallback } from 'react';

type ValidationRule<T> = (value: T) => string | null;

interface FormField<T> {
  value: T;
  error: string | null;
  touched: boolean;
  rules: ValidationRule<T>[];
}

type FormFields<T> = {
  [K in keyof T]: FormField<T[K]>;
};

interface FormState<T> {
  fields: FormFields<T>;
  isValid: boolean;
  isDirty: boolean;
}

export const useForm = <T extends Record<string, any>>(initialValues: T, validationRules: {
  [K in keyof T]?: ValidationRule<T[K]>[];
}) => {
  const createInitialState = (): FormFields<T> => {
    return Object.keys(initialValues).reduce((acc, key) => {
      const fieldKey = key as keyof T;
      acc[fieldKey] = {
        value: initialValues[fieldKey],
        error: null,
        touched: false,
        rules: validationRules[fieldKey] || [],
      };
      return acc;
    }, {} as FormFields<T>);
  };

  const [state, setState] = useState<FormState<T>>({
    fields: createInitialState(),
    isValid: true,
    isDirty: false,
  });

  const validateField = useCallback((fieldKey: keyof T, value: T[keyof T]): string | null => {
    const field = state.fields[fieldKey];
    for (const rule of field.rules) {
      const error = rule(value);
      if (error) return error;
    }
    return null;
  }, [state.fields]);

  const setFieldValue = useCallback((fieldKey: keyof T, value: T[keyof T]) => {
    setState(prev => {
      const newFields = { ...prev.fields };
      const error = validateField(fieldKey, value);
      
      newFields[fieldKey] = {
        ...newFields[fieldKey],
        value,
        error,
        touched: true,
      };

      const isValid = Object.values(newFields).every(field => !field.error);
      const isDirty = Object.values(newFields).some(
        field => field.value !== initialValues[fieldKey as keyof T]
      );

      return {
        fields: newFields,
        isValid,
        isDirty,
      };
    });
  }, [validateField, initialValues]);

  const setFieldTouched = useCallback((fieldKey: keyof T) => {
    setState(prev => {
      const newFields = { ...prev.fields };
      const field = newFields[fieldKey];
      const error = validateField(fieldKey, field.value);

      newFields[fieldKey] = {
        ...field,
        error,
        touched: true,
      };

      const isValid = Object.values(newFields).every(field => !field.error);

      return {
        ...prev,
        fields: newFields,
        isValid,
      };
    });
  }, [validateField]);

  const resetForm = useCallback(() => {
    setState({
      fields: createInitialState(),
      isValid: true,
      isDirty: false,
    });
  }, []);

  const getFieldProps = useCallback((fieldKey: keyof T) => {
    const field = state.fields[fieldKey];
    return {
      value: field.value,
      error: field.error,
      touched: field.touched,
      onChange: (value: T[keyof T]) => setFieldValue(fieldKey, value),
      onBlur: () => setFieldTouched(fieldKey),
    };
  }, [state.fields, setFieldValue, setFieldTouched]);

  const getValues = useCallback(() => {
    return Object.keys(state.fields).reduce((acc, key) => {
      const fieldKey = key as keyof T;
      acc[fieldKey] = state.fields[fieldKey].value;
      return acc;
    }, {} as T);
  }, [state.fields]);

  return {
    values: getValues(),
    isValid: state.isValid,
    isDirty: state.isDirty,
    setFieldValue,
    setFieldTouched,
    resetForm,
    getFieldProps,
  };
};

export default useForm; 