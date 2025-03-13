import { Heading, Divider } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import {
  createDataEntry,
  deleteDataEntry,
  updateDataEntry,
  fetchDataEntries,
} from "../../api";
import TextButton from "../../components/TextButton/TextButton";
import Form from "../../components/Form/Form";
import styles from "./Entries.module.css";
import { useState, useEffect } from "react";
import { DataEntry } from "../../types";
import FlexForm from "../../components/FlexForm/FlexForm";
import DateSpan from "../../components/DateSpan/DateSpan";

export default function Entries() {
  const { dataCategories } = useData();
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);

  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entries = await fetchDataEntries(20);
        setDataEntries(entries);
      } catch (error) {
        console.error("Error fetching data entries:", error);
      }
    };

    fetchData();
  }, []);

  const handleRightClick = (e: React.MouseEvent<Element>, id: string) => {
    e.preventDefault(); // Prevent the default context menu from appearing
    console.log("Right click detected", id);
    if (id == selectedEntry) {
      setSelectedEntry(null);
    } else {
      setSelectedEntry(id);
    }
  };

  const getUpdateEntryFormField = (entry: DataEntry) => {
    return [
      { name: "Value", id: "value", default: entry.value ?? "" },
      {
        name: "Data Category",
        id: "dataCategoryId",
        type: "select",
        options: dataCategoryOptions,
        required: true,
        default: entry.dataCategoryId,
      },
      { name: "Date", id: "date", type: "date", default: entry.date ?? "" },
      { name: "Note", id: "note", default: entry.note ?? "" },
      { name: "Id", id: "id", default: entry.id ?? "", hidden: true },
    ];
  };

  const dataCategoryOptions = dataCategories.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

  const formFields = [
    {
      name: "Data Category",
      id: "dataCategoryId",
      type: "select",
      options: dataCategoryOptions,
      required: true,
    },
    { name: "Value", id: "value" },
    { name: "Date", id: "date", type: "date" },
    { name: "Note", id: "note" },
  ];
  const handleFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    createDataEntry(formData); // Handle form data submission
  };

  const handleUpdateEntryFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    // formData.dataCategoryId = category.id;
    // formData.id =
    updateDataEntry(formData); // Handle form data submission
  };

  return (
    <>
      <Heading level={1}>Data Entries</Heading>
      <Divider />
      <Form
        heading="New Entry"
        fields={formFields}
        buttonText="Add New"
        handleFormData={handleFormData}
      />
      <table>
        <tbody>
          {dataEntries.map((item) => (
            <tr
              key={item.id}
              onContextMenu={(e) => handleRightClick(e, item.id)}
            >
              <FlexForm
                heading="Update Entry"
                fields={getUpdateEntryFormField(item)}
                handleFormData={handleUpdateEntryFormData}
              >
                <td className={styles.minWidth}>
                  {item.value} <br />
                  <small>
                    {dataCategories
                      .filter((dt) => dt.id === item.dataCategoryId)
                      .map((dt) => dt.name)
                      .join(", ")}{" "}
                    - {item.date}
                  </small>
                  <br />
                  <small>{item.note} </small>
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
                      <br />
                      <small>
                        Category Note:{" "}
                        {dataCategories
                          .filter((dt) => dt.id === item.dataCategoryId)
                          .map((dt) => dt.note)
                          .join(", ")}{" "}
                      </small>
                    </>
                  )}
                </td>
              </FlexForm>
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
