// import { useState } from "react";
import { Heading, Divider, Button, Grid } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import FlexForm from "../../components/FlexForm/FlexForm";
import { createMacro, deleteMacro, fetchMacros, updateMacro } from "../../api";
import { Macro } from "../../types";
import styles from "./Macros.module.css";
import { useState, useEffect } from "react";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { runMacros } from "../../util";
import { getAddUpdateMacroFormFields } from "../../formFields";
import TextButton from "../../components/TextButton/TextButton";
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
      dataCategories
    );
    await fetchAndSetMacros();
  };

  const runMacrosAndUpdate = standardWrapper(_runMacrosAndUpdate);

  const _handleDeleteMacro = async (id: string) => {
    await deleteMacro(id);
    await fetchAndSetMacros();
  };

  const handleDeleteMacro = standardWrapper(_handleDeleteMacro);

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
      <Grid
        margin="0 0"
        autoFlow="column"
        justifyContent="center"
        gap="2rem"
        alignContent="center"
      >
        <FlexForm
          heading="New Macro"
          fields={getAddUpdateMacroFormFields({} as Macro, dataCategories)}
          handleFormData={handleFormData}
        >
          <Button className={styles.lightMargin}>Add</Button>
        </FlexForm>
        <Button className={styles.lightMargin} onClick={runMacrosAndUpdate}>
          Run
        </Button>
      </Grid>

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
                    {macro.priority} - {macro.name}
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
                <td>
                  <TextButton onClick={() => handleDeleteMacro(macro.id)}>
                    <span className={styles.small}>❌</span>
                  </TextButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
