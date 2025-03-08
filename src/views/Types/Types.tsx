import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import Form from "../../components/Form/Form";
import TextButton from "../../components/TextButton/TextButton";
import { createDataType, deleteAllDataTypes, deleteDataType } from "../../api"; // Make sure fetchDataTypes is imported
import styles from "./Types.module.css";

export default function Types() {
  const { dataTypes } = useData();

  // Define fields for the form, including the generic select field
  const formFields = [
    { name: "Name", id: "name", required: true },
    { name: "Note", id: "note" },
    { name: "Is Complex", id: "isComplex", type: "checkbox" },
  ];

  const handleFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    createDataType(formData); // Handle form data submission
  };

  return (
    <>
      <Heading level={1}>Data Types</Heading>
      <Divider />
      <div>
        <Form
          heading="New Type"
          fields={formFields}
          buttonText="Add New"
          handleFormData={handleFormData}
          buttonStyle={styles.horizontalMargin}
        />
        <Button
          className={styles.horizontalMargin}
          onClick={deleteAllDataTypes}
        >
          Delete All
        </Button>
      </div>

      <table>
        <tbody>
          {dataTypes.map((item) => (
            <tr key={item.id}>
              <td>
                {item.name} <small>{item.isComplex && "(Complex)"}</small>
                <br />
                <small>{item.note}</small>
              </td>
              <td>
                <TextButton onClick={() => deleteDataType(item.id)}>
                  ❌
                </TextButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
