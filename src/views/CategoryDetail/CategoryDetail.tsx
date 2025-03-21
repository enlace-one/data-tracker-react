import { Heading, Divider, Button, Pagination } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import Form from "../../components/Form/Form";
import {
  createDataEntry,
  deleteDataEntry,
  updateDataCategory,
  fetchDataEntriesByCategory,
  deleteDataCategory,
  updateDataEntry,
  client,
} from "../../api"; // Make sure fetchDataTypes is imported
import TextButton from "../../components/TextButton/TextButton";
import { DataCategory, DataEntry, EnrichedDataCategory } from "../../types";
import FlexForm from "../../components/FlexForm/FlexForm";
import DateSpan from "../../components/DateSpan/DateSpan";

import styles from "./CategoryDetail.module.css";
import { useState, useEffect } from "react";

interface Props {
  category: EnrichedDataCategory;
  onBack: () => void;
}

export default function CategoryDetail({ category, onBack }: Props) {
  const { dataCategories, dataTypes, setActionMessage } = useData();
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [pageTokens, setPageTokens] = useState<(string | null)[]>([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);

  const fetchEntries = async (token: string | null) => {
    const { data: fetchedEntries, nextToken } =
      await client.models.DataEntry.listCategoryEntries(
        { dataCategoryId: category.id },
        {
          sortDirection: "DESC",
          limit: 20,
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

  const handleRightClick = (e: React.MouseEvent<Element>, id: string) => {
    e.preventDefault(); // Prevent the default context menu from appearing
    console.log("Right click detected", id);
    if (id == selectedEntry) {
      setSelectedEntry(null);
    } else {
      setSelectedEntry(id);
    }

    // Add your right-click logic here
  };

  const addEntryFormFields = [
    // Category added in handleFormData
    { name: "Value", id: "value", type: category.dataType.inputType },
    { name: "Date", id: "date", type: "date" },
    { name: "Note", id: "note" },
  ];

  const getUpdateEntryFormField = (entry: DataEntry) => {
    return [
      {
        name: "Value",
        id: "value",
        default: entry.value ?? "",
        type: category.dataType.inputType,
      },
      { name: "Date", id: "date", type: "date", default: entry.date ?? "" },
      { name: "Note", id: "note", default: entry.note ?? "" },
      { name: "Id", id: "id", default: entry.id ?? "", hidden: true },
    ];
  };
  const updateCategoryFormFields = [
    { name: "Name", id: "name", required: true, default: category.name ?? "" },
    { name: "Note", id: "note", default: category.note ?? "" },
    {
      name: "Add Default",
      id: "addDefault",
      type: "boolean",
      default: category.addDefault ?? false,
    },
    {
      name: "Default Value",
      id: "defaultValue",
      type: category.dataType.inputType,
      default: category.defaultValue ?? "",
    },
  ];

  const handleUpdateCategoryFormData = async (
    formData: Record<string, any>
  ) => {
    console.log("Received form data:", formData);
    // Add fields that cannot be edited.
    formData.dataTypeId = category.dataTypeId;
    formData.id = category.id;
    // Handle form data submission
    try {
      await updateDataCategory(formData);
      // setActionMessage("Category created successfully.");
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An error occurred.";
      setActionMessage({ message: errorMessage, type: "error" });
    }
  };

  const handleNewEntryFormData = async (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    formData.dataCategoryId = category.id;
    // Handle form data submission
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
    console.log("Received form data:", formData);
    formData.dataCategoryId = category.id; // Handle form data submission
    // formData.id =
    try {
      await updateDataEntry(formData);
      // setActionMessage("Category created successfully.");
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An error occurred.";
      setActionMessage({ message: errorMessage, type: "error" });
    }
  };

  return (
    <>
      {/* <Button onClick={onBack}>⬅ Back</Button> */}
      <Heading level={1}>{category.name}</Heading>
      <table>
        <tbody>
          <tr>
            <td className={styles.minWidth}>
              Type:{" "}
              {dataTypes
                .filter((dt) => dt.id === category.dataTypeId)
                .map((dt) => dt.name)
                .join(", ")}
              <br />
              Note: {category.note}
              <br />
              Add Default: {category.addDefault ? "True" : "False"}
              <br />
              Default Value: {category.defaultValue}
            </td>
            <td>
              <Button
                className={styles.lightMargin}
                onClick={() => deleteDataCategory(category.id)}
              >
                Delete
              </Button>
              <FlexForm
                heading="Update Category"
                fields={updateCategoryFormFields}
                handleFormData={handleUpdateCategoryFormData}
              >
                <Button className={styles.lightMargin}>Update</Button>
              </FlexForm>

              {/* <Form
                heading="New Entry"
                fields={addEntryFormFields}
                buttonText="Add Entry"
                handleFormData={handleNewEntryFormData}
                buttonStyle={styles.lightMargin}
              /> */}
              <FlexForm
                heading="New Entry"
                fields={addEntryFormFields}
                handleFormData={handleNewEntryFormData}
              >
                <Button className={styles.lightMargin}>Add Entry</Button>
              </FlexForm>
            </td>
          </tr>
        </tbody>
      </table>

      <Divider />

      <table>
        <tbody>
          {dataEntries
            .filter((de) => de.dataCategoryId === category.id)
            .map((item) => (
              <tr key={item.id}>
                <td
                  className={styles.minWidth}
                  onContextMenu={(e) => handleRightClick(e, item.id)}
                >
                  <FlexForm
                    heading="Update Entry"
                    fields={getUpdateEntryFormField(item)}
                    handleFormData={handleUpdateEntryFormData}
                  >
                    <b>{item.value}</b>
                    <br />
                    <small>
                      {item.date} {item.note ? "- " + item.note : ""}
                    </small>
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
                {/* <td>{item.value}</td> */}
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
