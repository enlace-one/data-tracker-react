import { useState, ChangeEvent, FormEvent } from "react";
import styles from "./Form.module.css";
import { Heading, Button } from "@aws-amplify/ui-react";

export interface Option {
  label: string;
  value: string;
}

export interface Field {
  id: string;
  name: string;
  required?: boolean;
  type?: string; // e.g. "text", "checkbox", "select", etc.
  options?: Option[]; // Only needed for select fields
  default?: string | boolean; // Default value for the field
}

interface Props {
  heading: string;
  fields: Field[];
  buttonText: string;
  handleFormData: (data: Record<string, string | boolean>) => void;
  buttonStyle?: string;
}

const Form = ({
  heading,
  fields,
  handleFormData,
  buttonText,
  buttonStyle = "",
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, string | boolean>>(
    fields.reduce((acc, field) => {
      if (field.type === "date") {
        acc[field.id] = field.default || new Date().toISOString().split("T")[0]; // Default to today
      } else {
        acc[field.id] =
          field.default || (field.type === "checkbox" ? false : "");
      }
      return acc;
    }, {} as Record<string, string | boolean>)
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    handleFormData(formData);
    setIsOpen(false);
  };

  return (
    <>
      <Button className={buttonStyle} onClick={() => setIsOpen(true)}>
        {buttonText}
      </Button>
      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <Heading level={2}>{heading}</Heading>
            <form onSubmit={handleSubmit}>
              {fields.map((field) => (
                <div key={field.id} className={styles.formGroup}>
                  <label htmlFor={field.id}>{field.name}:</label>
                  {field.type === "select" && field.options ? (
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
                  ) : (
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
              ))}
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

export default Form;
