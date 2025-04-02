// import { useState } from "react";
import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import FlexForm from "../../components/FlexForm/FlexForm";
import { createDataCategory, deleteAllDataCategories } from "../../api";
import CategoryDetail from "../CategoryDetail/CategoryDetail";
import { FlexFormField, FormDataType } from "../../types";
import styles from "./Categories.module.css";
import { useState, useEffect } from "react";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import {
  getAddCategoryFormFields,
  getAddCategorySecondaryFormFields,
} from "../../formFields";

export default function Categories() {
  const {
    dataCategories,
    dataTypes,
    selectedCategory,
    setSelectedCategory,
    setActionMessage,
    SETTINGS,
  } = useData();
  // const [selectedCategory, setSelectedCategory] = useState<DataCategory | null>(
  //   null
  // );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dataCategories) {
      setLoading(false);
    }
  }, [dataCategories]);

  const dataTypeOptions = dataTypes.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

  const handleFormData = async (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    try {
      setLoading(true);
      await createDataCategory(formData);
      setLoading(false);
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

  return (
    <>
      <Heading level={1}>Data Categories</Heading>
      <Divider />
      <FlexForm
        heading="New Category"
        fields={getAddCategoryFormFields(dataTypeOptions)}
        handleFormData={handleFormData}
        getSecondaryFields={getAddCategorySecondaryFormFields}
        getSecondaryFieldsParams={{ dataTypes: dataTypes }}
      >
        <Button className={styles.lightMargin}>Add Category</Button>
      </FlexForm>
      {SETTINGS.debug && (
        <Button
          className={styles.horizontalMargin}
          onClick={() => deleteAllDataCategories(dataCategories)}
        >
          Delete All
        </Button>
      )}

      {loading && <LoadingSymbol size={50} />}
      {!loading && (
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
                    {item.dataType?.name} - {item.note}{" "}
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
      )}
    </>
  );
}
