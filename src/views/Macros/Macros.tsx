// import { useState } from "react";
import { Heading, Divider } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import FlexForm from "../../components/FlexForm/FlexForm";
import {
  createDataEntry,
  fetchEnrichedDataEntriesByDate,
  fetchMacros,
  updateDataEntry,
} from "../../api";
import { EnrichedDataCategory, EnrichedDataEntry, Macro } from "../../types";
import BooleanField from "../../components/BooleanField/BooleanField";
import styles from "./Macros.module.css";
import { useState, useEffect, ChangeEvent } from "react";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { parseNumberToTime, parseTimeToNumber } from "../../util";
import { getAddUpdateDataEntryFormFields } from "../../formFields";
export default function Macros() {
  const { dataCategories, setActionMessage } = useData();
  const [macros, setMacros] = useState<Macro[]>([]);
  // const [selectedCategory, setSelectedCategory] = useState<DataCategory | null>(
  //   null
  // );

  const [loading, setLoading] = useState(true);

  function standardWrapper<T extends (...args: any[]) => Promise<any>>(
    fn: T
  ): T {
    return async function (...args: Parameters<T>) {
      try {
        setLoading(true);
        const result = await fn(...args); // Await the result of the function
        setLoading(false);
        return result;
      } catch (e) {
        const errorMessage =
          e instanceof Error ? e.message : "An error occurred.";
        setActionMessage({ message: errorMessage, type: "error" });
        setLoading(false); // Ensure loading is stopped even if there's an error
      }
    } as T;
  }

  const _fetchAndSetMacros = async () => {
    const newMacros = await fetchMacros();
    await setMacros(newMacros);
  };

  const fetchAndSetMacros = standardWrapper(_fetchAndSetMacros);

  useEffect(() => {
    fetchAndSetMacros();
  }, []);

  return (
    <>
      <Heading level={1}>Macros</Heading>
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
            {macros.map((macro) => (
              <tr key={macro.name}>
                <td>{macro.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
