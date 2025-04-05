import { useState, ChangeEvent, useEffect, FormEvent, ReactNode } from "react";
import styles from "./FlexForm.module.css";
import { Heading } from "@aws-amplify/ui-react";
import BooleanField from "../BooleanField/BooleanField";
import { FlexFormField } from "../../types";
import { parseStringToBoolean } from "../../util";

interface Props {
  heading: string;
  fields: FlexFormField[];
  handleFormData: (data: Record<string, string | boolean>) => void;
  getSecondaryFields?: (
    data: Record<string, string | boolean>,
    getSecondaryFieldsParams: unknown
  ) => Promise<FlexFormField[]>;
  getSecondaryFieldsParams?: unknown;
  buttonStyle?: string;
  children: ReactNode;
}

const FlexForm = ({
  heading,
  fields,
  handleFormData,
  getSecondaryFields,
  getSecondaryFieldsParams,
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
  const [secondaryFields, setSecondaryFields] = useState<FlexFormField[]>([]);
  const [formData, setFormData] = useState<Record<string, string | boolean>>(
    {}
  );

  const addFieldDefaults = (
    fields: FlexFormField[]
  ): Record<string, string | boolean> => {
    return fields.reduce((acc, field) => {
      acc[field.id] =
        field.default === "" || field.default == null
          ? field.type === "checkbox"
            ? false
            : field.type === "boolean"
            ? false
            : field.type === "boolean-string"
            ? "False"
            : field.type === "date"
            ? new Date().toLocaleDateString("en-CA")
            : ""
          : field.default;
      return acc;
    }, {} as Record<string, string | boolean>);
  };

  // Initialize or reset form data based on stage
  useEffect(() => {
    const fetchSecondaryFields = async () => {
      if (formStage === "secondary" && getSecondaryFields) {
        console.log("Fetching secondary fields with primaryData:", primaryData);
        try {
          const generatedFields = await getSecondaryFields(
            primaryData,
            getSecondaryFieldsParams
          );
          console.log("Secondary fields:", generatedFields);
          setSecondaryFields(generatedFields);
          setFormData(addFieldDefaults(generatedFields));
        } catch (error) {
          console.error("Error fetching secondary fields:", error);
        }
      }
    };

    if (formStage === "primary") {
      setFormData(addFieldDefaults(fields));
    } else if (formStage === "secondary") {
      fetchSecondaryFields();
    }
  }, [
    formStage,
    fields,
    getSecondaryFields,
    primaryData,
    getSecondaryFieldsParams,
  ]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { id, type, value } = e.target;
    const isCheckbox =
      type === "checkbox" && e.target instanceof HTMLInputElement;

    console.log(
      "Form Changed - setting",
      id,
      isCheckbox ? (e.target as HTMLInputElement).checked : value
    );
    setFormData((prev) => ({
      ...prev,
      [id]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleBooleanChange = (id: string, value: boolean | string) => {
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formStage === "primary") {
      setPrimaryData(formData); // No await needed, setPrimaryData is synchronous
      if (getSecondaryFields) {
        setFormStage("secondary");
      } else {
        handleFormData(formData);
        resetForm(); // Reset after final submission
      }
    } else if (formStage === "secondary") {
      const fullFormData = { ...primaryData, ...formData };
      handleFormData(fullFormData);
      resetForm(); // Reset after final submission
    }
  };

  const handleCancel = () => {
    resetForm(); // Reset on cancel
  };

  // Reset form to initial state
  const resetForm = () => {
    setIsOpen(false);
    setFormStage("primary");
    setPrimaryData({});
    setSecondaryFields([]);
    setFormData(addFieldDefaults(fields)); // Reset to primary defaults
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
            <form onSubmit={handleSubmit}>
              {(formStage === "primary" ? fields : secondaryFields).map(
                (field) =>
                  field.hidden ? null : (
                    <div key={field.id} className={styles.formGroup}>
                      <label htmlFor={field.id}>{field.name}:</label>
                      {field.type === "select" && field.options ? (
                        <>
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
                        </>
                      ) : field.type === "boolean" ? (
                        <BooleanField
                          default={formData[field.id] as boolean}
                          onChange={(value) =>
                            handleBooleanChange(field.id, value)
                          }
                          asString={false}
                        />
                      ) : field.type === "boolean-string" ? (
                        <BooleanField
                          default={parseStringToBoolean(
                            formData[field.id] as string
                          )}
                          onChange={(value) =>
                            handleBooleanChange(field.id, value)
                          }
                          asString={true}
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
                            : { value: String(formData[field.id] ?? "") })}
                          required={field.required ?? false}
                        />
                      )}
                      <small>{field.note}</small>
                    </div>
                  )
              )}
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  onClick={handleCancel}
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
