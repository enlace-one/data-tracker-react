// import { useState } from "react";
import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import FlexForm from "../../components/FlexForm/FlexForm";
import {
  createDataCategory,
  deleteAllDataCategories,
  fetchEnrichedDataEntriesByDate,
} from "../../api";
import CategoryDetail from "../CategoryDetail/CategoryDetail";
import {
  EnrichedDataCategory,
  FormDataType,
  EnrichedDataEntry,
  DataEntry,
} from "../../types";
import styles from "./Day.module.css";
import { useState, useEffect } from "react";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";

export default function Day() {
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
  const [dataEntries, setDataEntries] = useState<EnrichedDataEntry[]>([]);
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  });
  const [categoriesToShow, setcategoriesToShow] = useState<
    EnrichedDataCategory[]
  >([]);

  useEffect(() => {
    if (dataCategories) {
      setLoading(false);
    }
  }, [dataCategories]);

  const fetchEntries = async () => {
    const fetchedEntries = await fetchEnrichedDataEntriesByDate(date);
    setDataEntries(fetchedEntries);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setDate(value);
    fetchEntries();
  };

  const addDataFields = [];

  return (
    <>
      <Heading level={1}>Day</Heading>
      <Divider />
      {/* <FlexForm
        heading="Add Data"
        fields={addDataFields}
        handleFormData={console.log("l")}
      >
        <Button className={styles.lightMargin}>Add Category</Button>
      </FlexForm> */}

      {loading && <LoadingSymbol size={50} />}
      {!loading && (
        <table className={styles.table}>
          <tbody>
            {dataEntries.map((entry) => (
              <tr className={styles.tableRow} key={entry.id}>
                <td className={styles.minWidth}>
                  <span
                    // onClick={() => setSelectedCategory(item)}
                    style={{
                      padding: "2px",
                      cursor: "pointer",
                    }}
                  >
                    {entry.dataCategory.name}
                    {entry.value}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className={styles.formGroup}>
        <span className={styles.symbols}>{"<"}</span>
        <input
          type="date"
          onChange={handleDateChange}
          defaultValue={date}
        ></input>
        <span className={styles.symbols}>{">"}</span>
      </div>
    </>
  );
}
