// import { useState } from "react";
import { Heading, Divider, Button } from "@aws-amplify/ui-react";
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
import styles from "./Day.module.css";
import { useState, useEffect, ChangeEvent } from "react";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { parseNumberToTime, parseTimeToNumber, runMacros } from "../../util";
import { getAddUpdateDataEntryFormFields } from "../../formFields";
import TimeDifferenceField from "../../components/TimeDifferenceField/TimeDifferenceField";
export default function Day() {
  const { dataCategories, setActionMessage } = useData();
  const [macros, setMacros] = useState<Macro[]>([]);
  // const [selectedCategory, setSelectedCategory] = useState<DataCategory | null>(
  //   null
  // );

  const [loading, setLoading] = useState(true);
  const [dataEntries, setDataEntries] = useState<EnrichedDataEntry[]>([]);
  const [date, setDate] = useState<string>(() => {
    const today = new Date();
    return today.toLocaleDateString("en-CA"); // Format as YYYY-MM-DD
  });
  const [categoriesToShow, setCategoriesToShow] = useState<
    EnrichedDataCategory[]
  >([]);

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

  const fetchAndSetMacros = async () => {
    const newMacros = await fetchMacros();
    await setMacros(newMacros);
  };

  useEffect(() => {
    fetchAndSetMacros();
  }, []);

  const _fetchEntries = async () => {
    const fetchedEntries = await fetchEnrichedDataEntriesByDate(date);

    setDataEntries(
      fetchedEntries.sort((a, b) =>
        a.dataCategory.name.localeCompare(b.dataCategory.name)
      )
    );

    const entryCategoryIds = new Set(
      fetchedEntries.map((entry) => entry.dataCategoryId)
    );

    setCategoriesToShow(
      dataCategories
        .filter((category) => !entryCategoryIds.has(category.id))
        .sort((a, b) => a.name.localeCompare(b.name)) // Use localeCompare for string sorting
    );
  };

  const runMacrosAndUpdate = async () => {
    await runMacros(macros, date, dataCategories);
    fetchEntries();
  };

  const fetchEntries = standardWrapper(_fetchEntries);

  const _handleUpdateEntryFormData = async (formData: Record<string, any>) => {
    console.log("Updating entry form and fetching entries");
    await updateDataEntry(formData);
    await fetchEntries();
  };

  const handleUpdateEntryFormData = standardWrapper(_handleUpdateEntryFormData);

  useEffect(() => {
    fetchEntries();
  }, []);

  // Trigger fetchEntries when `date` updates
  useEffect(() => {
    fetchEntries();
  }, [date]);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    console.log("changed");
    setDate(value);
  };

  const modifyCurrentDay = async (modification: number) => {
    const [year, month, day] = date.split("-").map(Number);
    const newDate = new Date(year, month - 1, day); // month is 0-based in JS
    newDate.setDate(newDate.getDate() + modification); // Correctly modify the day

    const newDateFormatted = newDate.toLocaleDateString("en-CA"); // Format as YYYY-MM-DD
    console.log("Setting date to ", newDateFormatted);

    await setDate(newDateFormatted); // Update state first

    Array.from(document.getElementsByClassName(styles.DateInput)).forEach(
      (element) => {
        if (element instanceof HTMLInputElement) {
          element.value = newDateFormatted; // Update input field
        }
      }
    );
  };

  const modifyCurrentValue = async (
    incrementDirection: string,
    entry: EnrichedDataEntry
  ) => {
    let value = null;
    // const { data: dt } = await entry.dataCategory.dataType();
    const inputType = entry.dataCategory?.dataType?.inputType;

    // Parse Value
    if (inputType === "number") {
      value = Number(entry.value);
    } else if (inputType === "time") {
      value = parseTimeToNumber(entry.value);
    } else {
      console.error("ERROR - Unaccounted for entry type.");
      return;
    }

    // Modify Value
    if (incrementDirection === "+") {
      value += entry.dataCategory?.positiveIncrement ?? 1;
    } else {
      value -= entry.dataCategory?.negativeIncrement ?? 1;
    }

    // Stringify Value
    if (inputType === "number") {
      value = String(value);
    } else if (inputType === "time") {
      value = parseNumberToTime(value);
    } else {
      console.error("ERROR - Unaccounted for entry type.");
      return;
    }

    console.log("Setting value to:", value);

    Array.from(
      document.getElementsByClassName("ValueInput" + entry.id)
    ).forEach((element) => {
      if (element instanceof HTMLInputElement) {
        element.value = value; // Update input field
      }
    });

    updateDataEntryValue(entry, value);
  };

  const updateDataEntryValue = async (
    entry: EnrichedDataEntry,
    value: string
  ) => {
    // Update the state to trigger a re-render
    setDataEntries((prevEntries) =>
      prevEntries.map((e) => (e.id === entry.id ? { ...e, value } : e))
    );
    await updateDataEntry({
      id: entry.id,
      date: entry.date, // Ensure a default empty string if missing
      note: entry.note || "", // Default empty string
      value: value,
      dataCategoryId: entry.dataCategoryId,
    });
  };

  const handleValueInputChange = (
    entry: EnrichedDataEntry,
    e: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    console.log("Value input changed, saving...");
    const { value } = e.target;
    updateDataEntryValue(entry, String(value));
  };

  const handleValueBooleanChange = (
    entry: EnrichedDataEntry,
    value: boolean | string
  ) => {
    console.log("Boolean value input changed, saving...");
    updateDataEntryValue(entry, String(value));
  };

  const handleAddCategory = async (
    e: ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLSelectElement>
  ) => {
    console.log("Adding cat");

    const value = e.target.value;

    console.log("Value", value);

    const category = dataCategories.find((category) => category.id === value);

    if (category) {
      try {
        await createDataEntry({
          dataCategoryId: value,
          date: date,
          value: category.defaultValue ?? "", // Ensure a valid default value is set
        });
        console.log("Category added successfully");
        // await fetchEntries(); // Refresh entries after adding a new one
      } catch (error) {
        console.error("Error adding category:", error);
      }
    }
  };
  return (
    <>
      <Heading level={1}>Day</Heading>
      <Divider />
      {macros.length > 0 && (
        <Button className={styles.lightMargin} onClick={runMacrosAndUpdate}>
          Run Macros
        </Button>
      )}
      {/* <FlexForm
        heading="Add Data"
        fields={addDataFields}
        handleFormData={console.log("l")}
      >
        <Button className={styles.lightMargin}>Add Category</Button>
      </FlexForm> */}

      {loading && <LoadingSymbol size={50} text="Loading Entries..." />}
      {!loading && (
        <table className={styles.table}>
          <tbody>
            {dataEntries.map((entry) => (
              <tr className={styles.tableRow} key={entry.id}>
                <td className={styles.minWidth}>
                  <FlexForm
                    heading="Update Entry"
                    fields={getAddUpdateDataEntryFormFields(
                      entry,
                      dataCategories
                    )}
                    handleFormData={handleUpdateEntryFormData}
                  >
                    <small>{entry.dataCategory?.name}</small>
                  </FlexForm>

                  {/* <br /> */}

                  {/* NEED TO ADD SUPPORT FOR BOOLEAN FIELDS */}
                  <div className={styles.flexContainer}>
                    {entry.dataCategory?.dataType?.inputType ===
                      "boolean-string" && (
                      <BooleanField
                        default={entry.value == "true" ? true : false}
                        onChange={(value) =>
                          handleValueBooleanChange(entry, value)
                        }
                        asString={true}
                      ></BooleanField>
                    )}
                    {entry.dataCategory?.dataType?.inputType == "select" && (
                      <select
                        id={entry.id}
                        name={entry.id}
                        value={entry.value}
                        onChange={(event) =>
                          handleValueInputChange(entry, event)
                        }
                      >
                        <option value="">Select an option</option>
                        {entry.dataCategory?.options?.map((option) => (
                          <option key={option} value={option ?? ""}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {entry.dataCategory?.dataType?.inputType ==
                      "time-difference" && (
                      <TimeDifferenceField
                        onBlur={(value) =>
                          handleValueBooleanChange(entry, value)
                        }
                        defaultValue={entry.value}
                      />
                    )}
                    {entry.dataCategory?.dataType?.inputType !=
                      "boolean-string" &&
                      entry.dataCategory?.dataType?.inputType !=
                        "time-difference" &&
                      entry.dataCategory?.dataType?.inputType != "select" && (
                        <input
                          type={entry.dataCategory?.dataType?.inputType}
                          className={"ValueInput" + entry.id}
                          defaultValue={entry.value}
                          style={{ maxWidth: "9rem" }}
                          onBlur={(event) =>
                            handleValueInputChange(entry, event)
                          }
                        ></input>
                      )}
                    {/* className={styles.ButtonHolder} */}

                    {(entry.dataCategory?.dataType?.inputType === "number" ||
                      entry.dataCategory?.dataType?.inputType === "time") && (
                      <>
                        <button
                          onClick={() => modifyCurrentValue("+", entry)}
                          className={styles.PlusSymbolButton}
                        >
                          {"+"}
                        </button>
                        <button
                          onClick={() => modifyCurrentValue("-", entry)}
                          className={styles.MinusSymbolButton}
                        >
                          {"-"}
                        </button>
                      </>
                    )}
                  </div>

                  {/* <span
                    // onClick={() => setSelectedCategory(item)}
                    style={{
                      padding: "2px",
                      cursor: "pointer",
                    }}
                  >
                    {entry.dataCategory?.name}
                    {entry.value}
                  </span> */}
                </td>
              </tr>
            ))}
            <tr className={styles.tableRow} key="new">
              <td className={styles.minWidth}>
                {/* <small>Add Entry for Another Category</small>
                <br /> */}

                <select
                  onChange={handleAddCategory}
                  className={styles.CategorySelect}
                >
                  <option key="default" value="">
                    Pick a Category
                  </option>
                  {categoriesToShow.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      )}
      <div className={styles.formGroup}>
        <button
          onClick={() => modifyCurrentDay(-1)}
          className={styles.SymbolButton}
        >
          {"<"}
        </button>
        <input
          type="date"
          className={styles.DateInput}
          onChange={handleDateChange}
          defaultValue={date}
        ></input>
        <button
          onClick={() => modifyCurrentDay(1)}
          className={styles.SymbolButton}
        >
          {">"}
        </button>
      </div>
    </>
  );
}
