import { useState, ChangeEvent, useEffect, FormEvent, ReactNode } from "react";
import styles from "./FlexForm.module.css";
import { Heading } from "@aws-amplify/ui-react";
import BooleanField from "../BooleanField/BooleanField";

export interface Option {
  label: string;
  value: string;
}

export interface Field {
  id: string;
  name: string;
  hidden?: boolean;
  required?: boolean;
  type?: string; // e.g. "text", "checkbox", "select", etc.
  options?: Option[]; // Only needed for select fields
  default?: string | boolean; // Default value for the field
  getType?: (formData: Record<string, any>) => string; // Function to determine the field type
  getNote?: (formData: Record<string, any>) => string;
  note?: string | null;
}
interface Props {
  heading: string;
  fields: Field[];
  handleFormData: (data: Record<string, string | boolean>) => void;
  buttonStyle?: string;
  children: ReactNode; // Accepts a child component to be used as the button
}

const FlexForm = ({
  heading,
  fields,
  handleFormData,
  buttonStyle = "",
  children,
}: Props) => {
  // console.log("Fields:", fields);

  const [dynamicFields, setDynamicFields] = useState<Field[]>(() =>
    fields.map((field) => ({
      ...field,
      type: field.getType ? field.getType(fields) : field.type,
      note: field.getNote ? field.getNote(fields) : field.note,
    }))
  );

  const setDynamicFieldType = (fieldId: string, inputType: string) => {
    // console.log(`Setting field ${fieldId} type to ${inputType}`);
    setDynamicFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, type: inputType } : field
      )
    );
  };

  const setDynamicFieldNote = (fieldId: string, note: string) => {
    // console.log(`Setting field ${fieldId} note to ${note}`);
    setDynamicFields((prevFields) =>
      prevFields.map((field) =>
        field.id === fieldId ? { ...field, note: note } : field
      )
    );
  };

  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string | boolean>>(
    () => {
      return dynamicFields.reduce((acc, field) => {
        if (field.type === "date") {
          acc[field.id] =
            field.default || new Date().toISOString().split("T")[0]; // Default to today
        } else {
          acc[field.id] =
            field.default ?? (field.type === "checkbox" ? false : "");
        }

        return acc;
      }, {} as Record<string, string | boolean>);
    }
  );
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, type, value } = e.target;
    const isCheckbox =
      e.target instanceof HTMLInputElement && type === "checkbox";

    setFormData((prev) => ({
      ...prev,
      [id]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // React to changes in formData after it updates
  useEffect(() => {
    dynamicFields.forEach((field) => {
      if (field.getType) {
        const newType = field.getType(formData);
        if (newType !== field.type) {
          setDynamicFieldType(field.id, newType);
        }
      }
      if (field.getNote) {
        const newNote = field.getNote(formData);
        if (newNote !== field.note) {
          setDynamicFieldNote(field.id, newNote);
        }
      }
    });
  }, [formData]); // This ensures it runs only when formData updates

  const handleBooleanChange = (id: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    handleFormData(formData);
    setIsOpen(false);
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className={buttonStyle}>
        {children}
      </div>
      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <Heading level={2}>{heading}</Heading>
            {console.log(
              "FormData:",
              formData,
              "DynamicFields:",
              dynamicFields
            ) ??
              (true && <br />)}
            <form onSubmit={handleSubmit}>
              {dynamicFields.map((field) =>
                field.hidden ? null : ( // Check if the field is hidden
                  <div key={field.id} className={styles.formGroup}>
                    <small>{field.note}</small>
                    <label htmlFor={field.id}>{field.name}:</label>
                    {field.type === "select" && field.options ? (
                      //
                      // Handle Select Fields
                      //
                      <select
                        id={field.id}
                        name={field.id}
                        value={(formData[field.id] as string) || ""}
                        onChange={handleChange}
                        required={field.required ?? false}
                      >
                        <option value="">Select an option</option>
                        {field.options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "boolean" ? (
                      //
                      // Handle custom boolean field
                      //
                      <BooleanField
                        default={!!formData[field.id]}
                        onChange={(value) =>
                          handleBooleanChange(field.id, value)
                        }
                      />
                    ) : (
                      //
                      // Handle Other Field Types
                      //

                      <input
                        type={field.type || "text"}
                        id={field.id}
                        name={field.id}
                        onChange={handleChange}
                        {...(field.type === "checkbox"
                          ? { checked: !!formData[field.id] } // Ensuring boolean type
                          : {
                              value:
                                field.type === "date"
                                  ? (formData[field.id] as string) ||
                                    new Date().toISOString().split("T")[0] // Default to today’s date
                                  : String(formData[field.id] ?? ""),
                            })}
                        required={
                          field.type !== "checkbox" && (field.required ?? false)
                        }
                      />
                    )}
                  </div>
                )
              )}
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className={`${styles.button} ${styles.cancelButton}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${styles.button} ${styles.submitButton}`}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default FlexForm;
