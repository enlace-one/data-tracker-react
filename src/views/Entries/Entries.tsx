import { Heading, Divider } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import { createDataEntry, deleteDataEntry } from "../../api";
import TextButton from "../../components/TextButton/TextButton";
import Form from "../../components/Form/Form";
import styles from "./Entries.module.css";

export default function Entries() {
  const { dataEntries, dataCategories } = useData();

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
            <tr key={item.id}>
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
              </td>
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
