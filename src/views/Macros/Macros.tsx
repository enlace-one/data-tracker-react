// import { useState } from "react";
import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import FlexForm from "../../components/FlexForm/FlexForm";
import {
  createDataEntry,
  createMacro,
  fetchDataEntriesByCategory,
  fetchEnrichedDataEntriesByDate,
  fetchMacros,
  updateDataCategory,
  updateDataEntry,
  updateMacro,
} from "../../api";
import { EnrichedDataCategory, EnrichedDataEntry, Macro } from "../../types";
import BooleanField from "../../components/BooleanField/BooleanField";
import styles from "./Macros.module.css";
import { useState, useEffect, ChangeEvent } from "react";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { parseNumberToTime, parseTimeToNumber, runMacros } from "../../util";
import {
  getAddUpdateDataEntryFormFields,
  getAddUpdateMacroFormFields,
} from "../../formFields";
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

  const _handleFormData = async (formData: Record<string, any>) => {
    console.log("Add Macro Form Data:", formData);
    await createMacro(formData);
    await fetchAndSetMacros();
  };
  const handleFormData = standardWrapper(_handleFormData);

  const _handleUpdateMacroFormData = async (formData: Record<string, any>) => {
    console.log("Update Macro Form Data:", formData);
    await updateMacro(formData);
    await fetchAndSetMacros();
  };
  const handleUpdateMacroFormData = standardWrapper(_handleUpdateMacroFormData);

  const _runMacrosAndUpdate = async () => {
    await runMacros(
      macros,
      new Date().toLocaleDateString("en-CA"),
      dataCategories,
      fetchDataEntriesByCategory,
      updateDataCategory,
      updateMacro
    );
    await fetchAndSetMacros();
  };

  const runMacrosAndUpdate = standardWrapper(_runMacrosAndUpdate);

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
      <FlexForm
        heading="New Macro"
        fields={getAddUpdateMacroFormFields({} as Macro, dataCategories)}
        handleFormData={handleFormData}
      >
        <Button className={styles.lightMargin}>Add Macro</Button>
      </FlexForm>
      <Button className={styles.lightMargin} onClick={runMacrosAndUpdate}>
        Run Macros
      </Button>

      {loading && <LoadingSymbol size={50} />}
      {!loading && (
        <table className={styles.table}>
          <tbody>
            {macros.map((macro) => (
              <tr key={macro.name}>
                <td>
                  <FlexForm
                    heading="Update Macro"
                    fields={getAddUpdateMacroFormFields(macro, dataCategories)}
                    handleFormData={handleUpdateMacroFormData}
                  >
                    {macro.name}
                    <br />
                    <small>Note: {macro.note}</small>
                    <br />
                    <small>Formula: {macro.formula}</small>
                    <br />
                    <small>Schedule: {macro.schedule}</small>
                    <br />
                    <small>
                      Last Run:
                      <br />({macro.lastRunDate}) {macro.lastRunOutput}
                    </small>
                    <br />
                    <small></small>
                    <br />
                  </FlexForm>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
