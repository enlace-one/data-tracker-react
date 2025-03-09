import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import Form from "../../components/Form/Form";
import {
  createDataEntry,
  deleteDataEntry,
  updateDataCategory,
  deleteDataCategory,
} from "../../api"; // Make sure fetchDataTypes is imported
import TextButton from "../../components/TextButton/TextButton";
import { DataCategory } from "../../types";

import styles from "./CategoryDetail.module.css";

interface Props {
  category: DataCategory;
  onBack: () => void;
}

export default function CategoryDetail({ category, onBack }: Props) {
  const { dataCategories, dataTypes, dataEntries } = useData();

  const addEntryFormFields = [
    // Category added in handleFormData
    { name: "Value", id: "value" },
    { name: "Date", id: "date", type: "date" },
    { name: "Note", id: "note" },
  ];

  const updateCategoryFormFields = [
    { name: "Name", id: "name", required: true, default: category.name ?? "" },
    { name: "Note", id: "note", default: category.note ?? "" },
    {
      name: "Add Default",
      id: "addDefault",
      type: "checkbox",
      default: category.addDefault ?? false,
    },
    {
      name: "Default Value",
      id: "defaultValue",
      default: category.defaultValue ?? "",
    },
  ];

  const handleCategoryFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    // Add fields that cannot be edited.
    formData.dataTypeId = category.dataTypeId;
    formData.id = category.id;
    updateDataCategory(formData); // Handle form data submission
  };

  const handleEntryFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    formData.dataCategoryId = category.id;
    createDataEntry(formData); // Handle form data submission
  };

  return (
    <>
      <Button onClick={onBack}>⬅ Back</Button>
      <Heading level={1}>{category.name}</Heading>
      <table>
        <tbody>
          <tr>
            <td>
              Type:{" "}
              {dataTypes
                .filter((dt) => dt.id === category.dataTypeId)
                .map((dt) => dt.name)
                .join(", ")}
              <br />
              Note: {category.note}
              <br />
              Add Default: {category.addDefault ? "True" : "False"}
              <br />
              Default Value: {category.defaultValue}
            </td>
            <td>
              <Form
                heading="Update Category"
                fields={updateCategoryFormFields}
                buttonText="Update"
                handleFormData={handleCategoryFormData}
                buttonStyle={styles.lightMargin}
              />
              <br />
              <Button
                className={styles.lightMargin}
                onClick={() => deleteDataCategory(category.id)}
              >
                Delete
              </Button>
            </td>
          </tr>
        </tbody>
      </table>

      <Divider />
      <Form
        heading="New Entry"
        fields={addEntryFormFields}
        buttonText="Add Entry"
        handleFormData={handleEntryFormData}
      />
      <table>
        <tbody>
          {dataEntries
            .filter((de) => de.dataCategoryId === category.id)
            .map((item) => (
              <tr key={item.id}>
                <td>
                  <b>{item.value}</b> | {item.date}
                  <br />
                  <small>{item.note} </small>
                </td>
                {/* <td>{item.value}</td> */}
                <td>
                  <TextButton onClick={() => deleteDataEntry(item.id)}>
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
