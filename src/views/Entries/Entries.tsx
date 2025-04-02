import { Heading, Divider, Button, Pagination } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import {
  createDataEntry,
  deleteDataEntry,
  updateDataEntry,
  deleteAllDataEntries,
  client,
} from "../../api";
import TextButton from "../../components/TextButton/TextButton";
import styles from "./Entries.module.css";
import { useState, useEffect } from "react";
import { DataEntry } from "../../types";
import FlexForm from "../../components/FlexForm/FlexForm";
import DateSpan from "../../components/DateSpan/DateSpan";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import {
  getAddUpdateDataEntrySecondaryFormFields,
  getAddUpdateDataEntryFormFields,
} from "../../formFields";

export default function Entries() {
  const { dataCategories, dataTypes, SETTINGS, setActionMessage } = useData();
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [pageTokens, setPageTokens] = useState<(string | null)[]>([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);

  const [loading, setLoading] = useState(true);

  const fetchEntries = async (token: string | null) => {
    const { data: fetchedEntries, nextToken } =
      await client.models.DataEntry.listByDate(
        { dummy: 0 },
        {
          sortDirection: "DESC",
          limit: 10,
          nextToken: token,
        }
      );
    setDataEntries(fetchedEntries);
    return nextToken;
  };

  const handlePageChange = async (action: "next" | "previous" | number) => {
    let targetPageIndex = currentPageIndex;

    if (action === "next" && hasMorePages) {
      targetPageIndex += 1;
    } else if (action === "previous" && currentPageIndex > 0) {
      targetPageIndex -= 1;
    } else if (typeof action === "number") {
      targetPageIndex = action;
    }
    console.log("Action:", action);
    console.log("targetPageIndex:", targetPageIndex);
    console.log("currentPageIndex:", currentPageIndex);
    console.log("pageTokens:", pageTokens);
    console.log("hasMorePages:", hasMorePages);
    console.log("dataEntries:", dataEntries);

    // Only fetch if data for this page isn't already loaded
    if (targetPageIndex + 1 >= pageTokens.length) {
      const token = pageTokens[pageTokens.length - 1];
      const nextToken = await fetchEntries(token);

      if (nextToken && !pageTokens.includes(nextToken)) {
        console.log("Setting Page Tokens:", [pageTokens, nextToken]);
        setPageTokens((prev) => [...prev, nextToken]);
        setHasMorePages(true);
      } else {
        setHasMorePages(false);
      }
    } else {
      const token = pageTokens[targetPageIndex];
      await fetchEntries(token); // Load existing page data
      setHasMorePages(true);
    }

    setCurrentPageIndex(targetPageIndex);
  };

  const fetchInitialData = async () => {
    const firstNextToken = await fetchEntries(null);
    if (firstNextToken && !pageTokens.includes(firstNextToken)) {
      setPageTokens([...pageTokens, firstNextToken]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const handleRightClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedEntry((prev) => (prev === id ? null : id));
  };

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
        console.log(e instanceof Error ? e.stack : "No stack available"); // Log the error
        setLoading(false); // Ensure loading is stopped even if there's an error
      }
    } as T;
  }

  const _handleFormData = async (formData: Record<string, any>) => {
    console.log("Add Entry Form Data:", formData);
    await createDataEntry(formData);
    await fetchInitialData();
  };
  const handleFormData = standardWrapper(_handleFormData);

  const _handleUpdateEntryFormData = async (formData: Record<string, any>) => {
    await updateDataEntry(formData);
    await fetchInitialData();
  };

  const handleUpdateEntryFormData = standardWrapper(_handleUpdateEntryFormData);

  const _handleDeleteDataEntry = async (entryId: string) => {
    await deleteDataEntry(entryId);
    await fetchInitialData();
  };

  const handleDeleteDataEntry = standardWrapper(_handleDeleteDataEntry);

  const addTestEntries = () => {
    let numberDataTypeId = dataTypes.find((dt) => dt.name === "Number")?.id;
    if (!numberDataTypeId) return;

    const today = new Date();
    dataCategories
      .filter((cat) => cat.dataTypeId === numberDataTypeId)
      .forEach((cat) => {
        for (let x = 1; x < 50; x++) {
          const day = new Date();
          day.setDate(today.getDate() - x);
          createDataEntry({
            dataCategoryId: cat.id,
            value: `${x}`,
            date: day.toISOString().split("T")[0],
            note: "",
          });
        }
      });
  };

  return (
    <>
      <Heading level={1}>Data Entries</Heading>
      <Divider />
      <table>
        <tbody>
          <tr>
            <td>
              {/* <Form
                heading="New Entry"
                fields={getUpdateEntryFormField({} as DataEntry)}
                buttonText="Add New"
                handleFormData={handleFormData}
              /> */}
              <FlexForm
                heading="New Entry"
                fields={getAddUpdateDataEntryFormFields(
                  {} as DataEntry,
                  dataCategories
                )}
                getSecondaryFields={getAddUpdateDataEntrySecondaryFormFields}
                getSecondaryFieldsParams={{
                  dataCategories: dataCategories,
                  entry: {} as DataEntry,
                }}
                handleFormData={handleFormData}
              >
                <Button className={styles.lightMargin}>Add Entry</Button>
              </FlexForm>
            </td>
            {SETTINGS.debug && (
              <td>
                <Button onClick={addTestEntries}>Add Test Entries</Button>
              </td>
            )}
            {SETTINGS.debug && (
              <td>
                <Button onClick={deleteAllDataEntries}>
                  Delete All Entries
                </Button>
              </td>
            )}
          </tr>
        </tbody>
      </table>

      {loading && <LoadingSymbol size={50} />}
      {!loading && (
        <table>
          <tbody>
            {dataEntries.map((item) => (
              <tr
                key={item.id}
                onContextMenu={(e) => handleRightClick(e, item.id)}
              >
                <td className={styles.minWidth}>
                  <FlexForm
                    heading="Update Entry"
                    fields={getAddUpdateDataEntryFormFields(
                      item,
                      dataCategories
                    )}
                    handleFormData={handleUpdateEntryFormData}
                    getSecondaryFields={
                      getAddUpdateDataEntrySecondaryFormFields
                    }
                    getSecondaryFieldsParams={{
                      dataCategories: dataCategories,
                      entry: item,
                    }}
                  >
                    {item.value}
                    <br />
                    <small>
                      {
                        dataCategories.find(
                          (dt) => dt.id === item.dataCategoryId
                        )?.name
                      }{" "}
                      - {item.date}
                    </small>
                    <br />
                    <small>{item.note}</small>
                    {item.id == selectedEntry && (
                      <>
                        <br />
                        <small>
                          Created at: <DateSpan date={item.createdAt} />
                        </small>
                        <br />
                        <small>
                          Updated at: <DateSpan date={item.updatedAt} />
                        </small>
                        <br />
                        <small>ID: {item.id}</small>
                      </>
                    )}
                  </FlexForm>
                </td>
                <td>
                  <TextButton onClick={() => handleDeleteDataEntry(item.id)}>
                    <span className={styles.small}>❌</span>
                  </TextButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Pagination
        currentPage={currentPageIndex + 1}
        totalPages={pageTokens.length}
        onNext={() => handlePageChange("next")}
        onPrevious={() => handlePageChange("previous")}
        onChange={(pageIndex) => {
          if (
            typeof pageIndex === "number" &&
            pageIndex >= 1 &&
            pageIndex <= pageTokens.length
          ) {
            handlePageChange(pageIndex - 1); // Adjust for zero-indexing
          }
        }}
      />
    </>
  );
}
