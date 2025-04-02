import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import FlexForm from "../../components/FlexForm/FlexForm";
import TextButton from "../../components/TextButton/TextButton";
import {
  createDataType,
  deleteAllDataTypes,
  deleteDataType,
  updateDataType,
} from "../../api"; // Make sure fetchDataTypes is imported
import styles from "./Types.module.css";
import {
  getNewDataTypeFormFields,
  getUpdateDataTypeFormFields,
} from "../../formFields";

export default function Types() {
  const { dataTypes } = useData();

  console.log(dataTypes);

  const handleFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    console.log(createDataType(formData)); // Handle form data submission
  };

  const handleUpdateTypeFormData = (formData: Record<string, any>) => {
    updateDataType(formData);
  };

  return (
    <>
      <Heading level={1}>Data Types</Heading>
      <Divider />
      <div>
        <FlexForm
          heading="New Type"
          fields={getNewDataTypeFormFields()}
          handleFormData={handleFormData}
        >
          <Button className={styles.horizontalMargin}>Add New</Button>
        </FlexForm>

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
                  fields={getUpdateDataTypeFormFields(item)}
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
