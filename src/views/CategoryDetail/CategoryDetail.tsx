import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import Form from "../../components/Form/Form";
import {
  createDataEntry,
  deleteDataEntry,
  updateDataCategory,
  fetchDataEntriesByCategory,
  deleteDataCategory,
  updateDataEntry,
} from "../../api"; // Make sure fetchDataTypes is imported
import TextButton from "../../components/TextButton/TextButton";
import { DataCategory, DataEntry } from "../../types";
import FlexForm from "../../components/FlexForm/FlexForm";
import DateSpan from "../../components/DateSpan/DateSpan";

import styles from "./CategoryDetail.module.css";
import { useState, useEffect } from "react";

interface Props {
  category: DataCategory;
  onBack: () => void;
}

export default function CategoryDetail({ category, onBack }: Props) {
  const { dataCategories, dataTypes } = useData();
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entries = await fetchDataEntriesByCategory(category.id);
        setDataEntries(entries);
      } catch (error) {
        console.error("Error fetching data entries:", error);
      }
    };

    fetchData();
  }, [category.id]);

  const handleRightClick = (e: React.MouseEvent<Element>, id: string) => {
    e.preventDefault(); // Prevent the default context menu from appearing
    console.log("Right click detected", id);
    if (id == selectedEntry) {
      setSelectedEntry(null);
    } else {
      setSelectedEntry(id);
    }

    // Add your right-click logic here
  };

  const addEntryFormFields = [
    // Category added in handleFormData
    { name: "Value", id: "value" },
    { name: "Date", id: "date", type: "date" },
    { name: "Note", id: "note" },
  ];
  const getUpdateEntryFormField = (entry: DataEntry) => {
    return [
      { name: "Value", id: "value", default: entry.value ?? "" },
      { name: "Date", id: "date", type: "date", default: entry.date ?? "" },
      { name: "Note", id: "note", default: entry.note ?? "" },
      { name: "Id", id: "id", default: entry.id ?? "", hidden: true },
    ];
  };
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

  const handleUpdateCategoryFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    // Add fields that cannot be edited.
    formData.dataTypeId = category.dataTypeId;
    formData.id = category.id;
    updateDataCategory(formData); // Handle form data submission
  };

  const handleNewEntryFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    formData.dataCategoryId = category.id;
    createDataEntry(formData); // Handle form data submission
  };

  const handleUpdateEntryFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    formData.dataCategoryId = category.id;
    // formData.id =
    updateDataEntry(formData); // Handle form data submission
  };

  return (
    <>
      {/* <Button onClick={onBack}>⬅ Back</Button> */}
      <Heading level={1}>{category.name}</Heading>
      <table>
        <tbody>
          <tr>
            <td className={styles.minWidth}>
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
              <Button
                className={styles.lightMargin}
                onClick={() => deleteDataCategory(category.id)}
              >
                Delete
              </Button>
              <Form
                heading="Update Category"
                fields={updateCategoryFormFields}
                buttonText="Update"
                handleFormData={handleUpdateCategoryFormData}
                buttonStyle={styles.lightMargin}
              />

              <Form
                heading="New Entry"
                fields={addEntryFormFields}
                buttonText="Add Entry"
                handleFormData={handleNewEntryFormData}
                buttonStyle={styles.lightMargin}
              />
            </td>
          </tr>
        </tbody>
      </table>

      <Divider />

      <table>
        <tbody>
          {dataEntries
            .filter((de) => de.dataCategoryId === category.id)
            .map((item) => (
              <tr key={item.id}>
                <td
                  className={styles.minWidth}
                  onContextMenu={(e) => handleRightClick(e, item.id)}
                >
                  <FlexForm
                    heading="Update Entry"
                    fields={getUpdateEntryFormField(item)}
                    handleFormData={handleUpdateEntryFormData}
                  >
                    <b>{item.value}</b>
                    <br />
                    <small>
                      {item.date} {item.note ? "- " + item.note : ""}
                    </small>
                    {item.id == selectedEntry && (
                      <>
                        <br />
                        <small>
                          Created at: <DateSpan date={item.createdAt} />
                        </small>
                        <br />
                        <small>
                          Updated at: <DateSpan date={item.updatedAt} />
                        </small>
                        <br />
                        <small>ID: {item.id}</small>
                      </>
                    )}
                  </FlexForm>
                </td>
                {/* <td>{item.value}</td> */}
                <td>
                  <TextButton onClick={() => deleteDataEntry(item.id)}>
                    <span className={styles.small}>❌</span>
                  </TextButton>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
