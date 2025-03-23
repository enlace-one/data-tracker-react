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
import { DataEntry, FormDataType } from "../../types";
import FlexForm from "../../components/FlexForm/FlexForm";
import DateSpan from "../../components/DateSpan/DateSpan";

export default function Entries() {
  const { dataCategories, dataTypes, SETTINGS, setActionMessage } = useData();
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [pageTokens, setPageTokens] = useState<(string | null)[]>([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);

  const dataCategoryOptions = dataCategories.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

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

  useEffect(() => {
    const fetchInitialData = async () => {
      const firstNextToken = await fetchEntries(null);
      if (firstNextToken && !pageTokens.includes(firstNextToken)) {
        setPageTokens([...pageTokens, firstNextToken]);
      }
    };
    fetchInitialData();
  }, []);

  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const handleRightClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSelectedEntry((prev) => (prev === id ? null : id));
  };

  const getType = (formData: FormDataType) => {
    const category = dataCategories.find(
      (dc) => dc.id === formData.dataCategoryId
    );
    if (category) {
      return category.dataType.inputType;
    } else {
      return "text";
    }
  };
  const getUpdateEntryFormField = (entry: DataEntry) => [
    {
      name: "Data Category",
      id: "dataCategoryId",
      type: "select",
      options: dataCategoryOptions,
      required: true,
      default: entry.dataCategoryId,
    },
    {
      name: "Value",
      id: "value",
      default: entry.value ?? "",
      getType: getType,
    },
    { name: "Date", id: "date", type: "date", default: entry.date ?? "" },
    { name: "Note", id: "note", default: entry.note ?? "" },
    { name: "Id", id: "id", default: entry.id ?? "", hidden: true },
  ];

  const handleFormData = async (formData: Record<string, any>) => {
    try {
      await createDataEntry(formData);
      // setActionMessage("Category created successfully.");
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An error occurred.";
      setActionMessage({ message: errorMessage, type: "error" });
    }
  };

  const handleUpdateEntryFormData = async (formData: Record<string, any>) => {
    try {
      await updateDataEntry(formData);
      // setActionMessage("Category created successfully.");
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An error occurred.";
      setActionMessage({ message: errorMessage, type: "error" });
    }
  };

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
                fields={getUpdateEntryFormField({} as DataEntry)}
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
                  fields={getUpdateEntryFormField(item)}
                  handleFormData={handleUpdateEntryFormData}
                >
                  {item.value}
                  <br />
                  <small>
                    {
                      dataCategories.find((dt) => dt.id === item.dataCategoryId)
                        ?.name
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
                <TextButton onClick={() => deleteDataEntry(item.id)}>
                  <span className={styles.small}>❌</span>
                </TextButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
