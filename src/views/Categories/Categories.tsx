import { useState } from "react";
import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import Form from "../../components/Form/Form";
import FlexForm from "../../components/FlexForm/FlexForm";
import { createDataCategory, deleteDataCategory } from "../../api";
import TextButton from "../../components/TextButton/TextButton";
import CategoryDetail from "../CategoryDetail/CategoryDetail";
import { DataCategory, FormDataType } from "../../types";
import styles from "./Categories.module.css";

export default function Categories() {
  const {
    dataCategories,
    dataTypes,
    selectedCategory,
    setSelectedCategory,
    setActionMessage,
  } = useData();
  // const [selectedCategory, setSelectedCategory] = useState<DataCategory | null>(
  //   null
  // );

  const dataTypeOptions = dataTypes.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

  const handleFormData = async (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    try {
      await createDataCategory(formData);
      // setActionMessage("Category created successfully.");
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An error occurred.";
      setActionMessage({ message: errorMessage, type: "error" });
    }
  };
  if (selectedCategory) {
    return (
      <CategoryDetail
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  const getType = (formData: FormDataType) => {
    const dataType = dataTypes.find((dt) => dt.id === formData.dataTypeId);
    if (dataType) {
      return dataType.inputType;
    } else {
      return "text";
    }
  };

  return (
    <>
      <Heading level={1}>Data Categories</Heading>
      <Divider />
      <FlexForm
        heading="New Category"
        fields={[
          { name: "Name", id: "name", required: true },
          {
            name: "Data Type",
            id: "dataTypeId",
            type: "select",
            options: dataTypeOptions,
            required: true,
          },
          { name: "Note", id: "note" },
          { name: "Add Default", id: "addDefault", type: "boolean" },
          { name: "Default Value", id: "defaultValue", getType: getType },
        ]}
        handleFormData={handleFormData}
      >
        <Button className={styles.lightMargin}>Add Category</Button>
      </FlexForm>

      <table className={styles.table}>
        <tbody>
          {dataCategories.map((item) => (
            <tr className={styles.tableRow} key={item.id}>
              <td className={styles.minWidth}>
                <span
                  onClick={() => setSelectedCategory(item)}
                  style={{
                    padding: "2px",
                    cursor: "pointer",
                  }}
                >
                  {item.name}
                </span>
                <br />
                <small>
                  {/* {dataTypes.find((dt) => dt.id === item.dataTypeId)?.name ||
                    "Unknown"}{" "} */}
                  {item.dataType.name} - {item.note}{" "}
                </small>
              </td>
              {/* <td>
                <small>
                  
                  {dataTypes.find((dt) => dt.id === item.dataTypeId)?.name ||
                    "Unknown"}
                </small>
              </td> */}
              <td className={styles.paddingLeft}>{item.entryCount}</td>
              {/* <td>
                <TextButton onClick={() => deleteDataCategory(item.id)}>
                  ❌
                </TextButton>
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
