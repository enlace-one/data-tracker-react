// import { useState } from "react";
import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import moment from "moment";
import { useData } from "../../DataContext";
import FlexForm from "../../components/FlexForm/FlexForm";
import { createDataCategory, deleteAllDataCategories } from "../../api";
import CategoryDetail from "../CategoryDetail/CategoryDetail";
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
    topics,
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
      <Heading level={1}>Categories</Heading>
      <Divider />
      <FlexForm
        heading="New Category"
        fields={getAddCategoryFormFields(dataTypeOptions)}
        handleFormData={handleFormData}
        getSecondaryFields={getAddCategorySecondaryFormFields}
        getSecondaryFieldsParams={{ dataTypes: dataTypes, topics: topics }}
      >
        <Button className={styles.lightMargin}>Add</Button>
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
                <td>
                  {item.topic?.imageLink && (
                    <img
                      src={"/" + item.topic?.imageLink}
                      alt={item.topic?.name}
                      style={{
                        width: "3rem",
                        margin: "1rem",
                        height: "3rem",
                        padding: "2px",
                        border: "1px solid #007bff",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </td>
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
                    {item.dataType?.name}{" "}
                    {item.lastEntryDate && (
                      <>- {moment(item.lastEntryDate).fromNow()} </>
                    )}
                  </small>
                  <br />
                  <small>{item.note}</small>
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
