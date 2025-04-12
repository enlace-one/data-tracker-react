import { useState, useEffect } from "react";
import { Heading, Divider, Button, Grid } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import FlexForm from "../../components/FlexForm/FlexForm";
import { createDataCategory, deleteAllDataCategories } from "../../api";
import CategoryDetail from "../CategoryDetail/CategoryDetail";
import styles from "./Categories.module.css";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { EnrichedDataCategory } from "../../types";
import {
  getAddCategoryFormFields,
  getAddCategorySecondaryFormFields,
} from "../../formFields";
import { getPrettyNameForDate } from "../../util";
import { TOPIC_IMAGE_PATH } from "../../settings";

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

  const [loading, setLoading] = useState(true);
  const [sortedDataCategories, setSortedDataCategories] = useState<
    EnrichedDataCategory[]
  >([]);

  // Sync sortedDataCategories with dataCategories and apply initial sorting
  useEffect(() => {
    if (dataCategories) {
      setLoading(false);
      // Initially sort by name
      setSortedDataCategories(
        [...dataCategories].sort((a, b) => a.name.localeCompare(b.name))
      );
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

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const sortBy = event.target.value;
    console.log("Sorting by", sortBy);

    // Create a new sorted array to trigger re-render
    let sortedArray = [...dataCategories];

    if (sortBy === "name") {
      sortedArray.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "type") {
      sortedArray.sort((a, b) =>
        a.dataType.name.localeCompare(b.dataType.name)
      );
    } else if (sortBy === "topic") {
      sortedArray.sort((a, b) => a.topic.name.localeCompare(b.topic.name));
    } else if (sortBy === "lastEntry") {
      sortedArray.sort((a, b) => {
        const dateA = new Date(a.lastEntryDate || "1999-01-01");
        const dateB = new Date(b.lastEntryDate || "1999-01-01");
        return dateB.getTime() - dateA.getTime();
      });
    } else if (sortBy === "entryCount") {
      sortedArray.sort((a, b) => (b.entryCount ?? 0) - (a.entryCount ?? 0));
    }

    console.log("Sorted array:", sortedArray);
    setSortedDataCategories(sortedArray); // Update state with new array reference
  };

  return (
    <>
      <Heading level={1}>Categories</Heading>
      <Divider />
      <Grid
        margin="0 0"
        autoFlow="column"
        justifyContent="center"
        gap="2rem"
        alignContent="center"
      >
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
        {/* className={styles.multiSelect} */}
        <select onChange={handleSortChange}>
          <option className={styles.tableRow} value="name">
            Name
          </option>
          <option className={styles.tableRow} value="topic">
            Topic
          </option>
          <option className={styles.tableRow} value="type">
            Type
          </option>
          <option className={styles.tableRow} value="lastEntry">
            Last Entry
          </option>
          <option className={styles.tableRow} value="entryCount">
            Entry Count
          </option>
        </select>
      </Grid>

      {loading && <LoadingSymbol size={50} />}
      {!loading && (
        <table className={styles.table}>
          <tbody>
            {sortedDataCategories.map((item) => (
              <tr className={styles.tableRow} key={item.id}>
                <td>
                  {item.topic?.imageLink && (
                    <img
                      src={TOPIC_IMAGE_PATH + item.topic.imageLink}
                      alt={item.topic?.name}
                      style={{
                        width: "3rem",
                        margin: "1rem 1rem 1rem 0rem",
                        height: "3rem",
                        padding: "2px",
                        border: "1px solid #007bff",
                        borderRadius: "50%",
                      }}
                    />
                  )}
                </td>
                <td
                  onClick={() => setSelectedCategory(item)}
                  style={{
                    padding: "2px",
                    cursor: "pointer",
                  }}
                  className={styles.minWidth}
                >
                  {item.name}
                  <br />
                  <small>
                    {item.dataType?.name}{" "}
                    {item.lastEntryDate && (
                      <>- {getPrettyNameForDate(item.lastEntryDate)} </>
                    )}
                  </small>
                  <br />
                  <small>{item.note}</small>
                </td>
                <td className={styles.paddingLeft}>{item.entryCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
