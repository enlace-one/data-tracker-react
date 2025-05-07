import { useState, useEffect } from "react";
import { Heading, Divider, Button, Grid } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import FlexForm from "../../components/FlexForm/FlexForm";
import {
  createDataCategory,
  deleteAllDataCategories,
  fetchUserProfiles,
  saveCustomOrder,
} from "../../api";
import CategoryDetail from "../CategoryDetail/CategoryDetail";
import styles from "./Categories.module.css";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { EnrichedDataCategory } from "../../types";
import {
  getAddCategoryFormFields,
  getAddCategorySecondaryFormFields,
} from "../../formFields";
import { getPrettyNameForDate, sortCategories } from "../../util";
import { TOPIC_IMAGE_PATH, UI_IMAGE_PATH } from "../../settings";

export default function Categories() {
  const {
    dataCategories,
    dataTypes,
    selectedCategory,
    setSelectedCategory,
    setActionMessage,
    SETTINGS,
    topics,
    userProfiles,
    setUserProfiles,
  } = useData();

  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("name");
  const [editSort, setEditSort] = useState(false);
  const [sortedDataCategories, setSortedDataCategories] = useState<
    EnrichedDataCategory[]
  >([]);

  // Sync sortedDataCategories with dataCategories and apply initial sorting
  useEffect(() => {
    if (dataCategories) {
      setLoading(false);
      // Initially sort by name
      // setSortedDataCategories(
      //   [...dataCategories].sort((a, b) => a.name.localeCompare(b.name))
      // );
      setSortBy(userProfiles[0].categorySortPreference ?? "name");

      if (!userProfiles[0].customCategoryOrder) {
        userProfiles[0].customCategoryOrder = [];
      }
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

  const sortCategoryList = (customList: string[] | null = null) => {
    setSortedDataCategories(sortCategories(sortBy, customList, dataCategories));
  };

  useEffect(() => {
    sortCategoryList(
      (userProfiles[0]?.customCategoryOrder as string[]) ?? ([] as string[])
    );
  }, [sortBy]);

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(event.target.value);
  };

  const toggleEditSort = async () => {
    if (editSort) {
      setEditSort(false);
      await saveCustomOrder(
        // (userProfiles[0]?.customCategoryOrder ?? []).filter(
        //   (id): id is string => id !== null
        // ),
        sortedDataCategories.map((cat) => cat.id),
        userProfiles
      );
      const profiles = await fetchUserProfiles();
      setUserProfiles(profiles);
    } else {
      setEditSort(true);
    }
  };

  const handleMoveCategory = (id: string, direction: "up" | "down") => {
    console.log("Updating order...");
    const currentOrder = sortedDataCategories.map((cat) => cat.id);

    const index = currentOrder.indexOf(id);

    if (index === -1) {
      console.log("Error, ID not found i sorting. ", id, currentOrder);
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= currentOrder.length) return; // out of bounds

    // Swap positions
    [currentOrder[index], currentOrder[newIndex]] = [
      currentOrder[newIndex],
      currentOrder[index],
    ];

    sortCategoryList(currentOrder);
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
        <select onChange={handleSortChange} value={sortBy}>
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
          <option className={styles.tableRow} value="custom">
            Custom
          </option>
        </select>
        {sortBy === "custom" && <Button onClick={toggleEditSort}>Sort</Button>}
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
                {editSort && (
                  <td className={styles.paddingLeft}>
                    <Grid
                      margin="0 0 0 0" // 👈 more vertical space between groups
                      autoFlow="row"
                      justifyContent="center"
                      gap="0"
                      alignContent="center"
                    >
                      <Button onClick={() => handleMoveCategory(item.id, "up")}>
                        <img
                          src={UI_IMAGE_PATH + "up-arrow.svg"}
                          alt="Up"
                          style={{ width: "1rem", height: ".7rem" }}
                        />
                      </Button>
                      <Button
                        onClick={() => handleMoveCategory(item.id, "down")}
                      >
                        <img
                          src={UI_IMAGE_PATH + "down-arrow.svg"}
                          alt="Down"
                          style={{ width: "1rem", height: ".6rem" }}
                        />
                      </Button>
                    </Grid>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
