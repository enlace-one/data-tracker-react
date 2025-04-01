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
  pattern?: string | null;
}

interface Props {
  heading: string;
  fields: Field[];
  handleFormData: (data: Record<string, string | boolean>) => void;
  getSecondaryFields?: (data: Record<string, string | boolean>) => Field[];
  buttonStyle?: string;
  children: ReactNode;
}

const FlexForm = ({
  heading,
  fields,
  handleFormData,
  getSecondaryFields,
  buttonStyle = "",
  children,
}: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formStage, setFormStage] = useState<"primary" | "secondary">(
    "primary"
  );
  const [primaryData, setPrimaryData] = useState<
    Record<string, string | boolean>
  >({});
  const [secondaryFields, setSecondaryFields] = useState<Field[]>([]);
  const [formData, setFormData] = useState<Record<string, string | boolean>>(
    {}
  );

  useEffect(() => {
    const fetchSecondaryFields = async () => {
      if (formStage === "secondary" && getSecondaryFields) {
        console.log("Fetching secondary fields with primaryData:", primaryData); // Debugging
        try {
          const generatedFields = await getSecondaryFields(primaryData);
          setSecondaryFields(generatedFields);
          setFormData(
            generatedFields.reduce((acc, field) => {
              acc[field.id] =
                field.default ?? (field.type === "checkbox" ? false : "");
              return acc;
            }, {} as Record<string, string | boolean>)
          );
        } catch (error) {
          console.error("Error fetching secondary fields:", error);
        }
      }
    };

    if (formStage === "primary") {
      setFormData(
        fields.reduce((acc, field) => {
          acc[field.id] =
            field.default ?? (field.type === "checkbox" ? false : "");
          return acc;
        }, {} as Record<string, string | boolean>)
      );
    } else if (formStage === "secondary") {
      fetchSecondaryFields();
    }
  }, [formStage, fields, getSecondaryFields, primaryData]);

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

  const handleBooleanChange = (id: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formStage === "primary") {
      await setPrimaryData(await formData);
      if (getSecondaryFields) {
        setFormStage("secondary");
      } else {
        handleFormData(formData);
        setIsOpen(false);
      }
    } else if (formStage === "secondary") {
      const fullFormData = { ...primaryData, ...formData };
      handleFormData(fullFormData);
      setIsOpen(false);
      setFormStage("primary"); // Reset for next time
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className={buttonStyle}>
        {children}
      </div>
      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <Heading level={2}>
              {formStage === "primary" ? heading : "Additional Information"}
            </Heading>
            <form onSubmit={handleSubmit}>
              {(formStage === "primary" ? fields : secondaryFields).map(
                (field) =>
                  field.hidden ? null : (
                    <div key={field.id} className={styles.formGroup}>
                      <small>{field.note}</small>
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
                      ) : field.type === "boolean" ? (
                        <BooleanField
                          default={!!formData[field.id]}
                          onChange={(value) =>
                            handleBooleanChange(field.id, value)
                          }
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          id={field.id}
                          name={field.id}
                          onChange={handleChange}
                          pattern={field.pattern ?? ".*"}
                          {...(field.type === "checkbox"
                            ? { checked: !!formData[field.id] }
                            : {
                                value:
                                  field.type === "date"
                                    ? (formData[field.id] as string) ||
                                      new Date().toLocaleDateString("en-CA")
                                    : String(formData[field.id] ?? ""),
                              })}
                          required={field.required ?? false}
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
                  {formStage === "primary" && getSecondaryFields
                    ? "Next"
                    : "Submit"}
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
