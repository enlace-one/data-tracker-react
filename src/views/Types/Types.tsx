import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import Form from "../../components/Form/Form";
import FlexForm from "../../components/FlexForm/FlexForm";
import TextButton from "../../components/TextButton/TextButton";
import {
  createDataType,
  deleteAllDataTypes,
  deleteDataType,
  updateDataType,
} from "../../api"; // Make sure fetchDataTypes is imported
import styles from "./Types.module.css";
import { DataType } from "../../types";

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
    console.log(createDataType(formData)); // Handle form data submission
  };

  const getUpdateTypeFormField = (dataType: DataType) => [
    { name: "Name", id: "name", required: true, default: dataType.name ?? "" },
    { name: "Note", id: "note", default: dataType.note ?? "" },
    {
      name: "Is Complex",
      id: "isComplex",
      type: "checkbox",
      default: dataType.isComplex ?? "",
    },
    { name: "Input Type", id: "inputType", default: dataType.inputType ?? "" },
    { name: "Id", id: "id", default: dataType.id ?? "", hidden: true },
  ];

  const handleUpdateTypeFormData = (formData: Record<string, any>) => {
    updateDataType(formData);
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
                <FlexForm
                  heading="Update Type"
                  fields={getUpdateTypeFormField(item)}
                  handleFormData={handleUpdateTypeFormData}
                >
                  {item.name} <small>{item.isComplex && "(Complex)"}</small>
                  <br />
                  <small>
                    {item.inputType} - {item.note}
                  </small>
                </FlexForm>
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
