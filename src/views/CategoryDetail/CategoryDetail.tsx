import { Heading, Divider, Button, Pagination } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import {
  createDataEntry,
  deleteDataEntry,
  updateDataCategory,
  deleteDataCategory,
  updateDataEntry,
  client,
} from "../../api"; // Make sure fetchDataTypes is imported
import TextButton from "../../components/TextButton/TextButton";
import { DataEntry, FormDataType, EnrichedDataCategory } from "../../types";
import FlexForm from "../../components/FlexForm/FlexForm";
import DateSpan from "../../components/DateSpan/DateSpan";
import Popup from "../../components/Popup/Popup";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";

import styles from "./CategoryDetail.module.css";
import { useState, useEffect, ChangeEvent } from "react";

interface Props {
  category: EnrichedDataCategory;
  onBack: () => void;
}

export default function CategoryDetail({ category }: Props) {
  const { dataTypes, setActionMessage, setSelectedCategory } = useData();
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);
  const [fileUpload, setFileUpload] = useState<Boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [pageTokens, setPageTokens] = useState<(string | null)[]>([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [loading, setLoading] = useState(true);

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
      setLoading(true);
      await updateDataCategory(formData);
      await fetchInitialData();
      setLoading(false);
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
      setLoading(true);
      await createDataEntry(formData);
      await fetchInitialData();
      setLoading(false);
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
      setLoading(true);
      await updateDataEntry(formData);
      await fetchInitialData();
      setLoading(false);
      // setActionMessage("Category created successfully.");
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An error occurred.";
      setActionMessage({ message: errorMessage, type: "error" });
    }
  };

  const handleDeleteDataCategory = async (catId: string) => {
    try {
      setLoading(true);
      await deleteDataCategory(catId);
      setSelectedCategory(null);
      setActionMessage({
        message: "Data category deleted successfully.",
        type: "success",
      });
      setLoading(false);
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : "An error occurred.";
      setActionMessage({ message: errorMessage, type: "error" });
    }
  };

  interface ListCategoryEntriesResponse {
    data: DataEntry[]; // Assuming `DataEntry` is the correct type
    nextToken?: string | null;
  }

  const exportToCSV = (entries: DataEntry[], filename = "export.csv") => {
    if (!entries.length) {
      console.warn("No data to export.");
      return;
    }

    // Extract headers dynamically from the first entry
    // Exclude specific fields
    const excludeFields = new Set(["category", "dummy", "owner"]);
    const headers = Object.keys(entries[0]).filter(
      (header) => !excludeFields.has(header)
    );

    // Convert array of objects to CSV rows
    const csvRows = entries.map((entry) =>
      headers
        .map((header) => `"${(entry as Record<string, any>)[header] || ""}"`)
        .join(",")
    );

    // Combine headers and rows
    const csvContent = [headers.join(","), ...csvRows].join("\n");

    // Create a Blob and trigger a download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportToCSV = async (): Promise<void> => {
    try {
      let allEntries: DataEntry[] = [];
      let nextToken: string | null | undefined = undefined;

      do {
        const response: ListCategoryEntriesResponse =
          await client.models.DataEntry.listCategoryEntries(
            { dataCategoryId: category.id },
            {
              sortDirection: "DESC",
              limit: 100,
              nextToken, // Include nextToken for pagination
            }
          );

        // Extract data with proper typing
        const { data: fetchedEntries, nextToken: tempNextToken } = response;

        if (Array.isArray(fetchedEntries)) {
          allEntries.push(...fetchedEntries); // Append fetched entries
        }

        nextToken = tempNextToken ?? null; // Update nextToken
      } while (nextToken); // Continue if there's another page of results

      console.log("Fetched Entries:", allEntries);

      exportToCSV(allEntries, `${category.name}_export.csv`);

      // Now process `allEntries` for CSV export
    } catch (error) {
      console.error("Error fetching entries:", error);
    }
  };

  const importFromCSV = (
    file: File,
    callback: (data: Record<string, any>[]) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) return;

      const text = event.target.result as string;
      const [headerLine, ...rows] = text.split("\n").map((line) => line.trim());

      if (!headerLine) return;

      const headers = headerLine
        .split(",")
        .map((h) => h.replace(/"/g, "").trim());

      const data = rows.map((row) => {
        const values = row
          .split(",")
          .map((value) => value.replace(/"/g, "").trim());
        return headers.reduce((acc, header, index) => {
          acc[header] = values[index] ?? "";
          return acc;
        }, {} as Record<string, any>);
      });

      callback(data);
    };

    reader.readAsText(file);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setLoading(true);
    if (file) {
      importFromCSV(file, async (parsedData) => {
        console.log("Imported Data:", parsedData);

        for (const row of parsedData) {
          console.log("Row", row);
          await createDataEntry(row as FormDataType); // Ensure `row` is the correct type
        }
        setLoading(false);

        // You can now store this data in state or send it to Amplify
      });
    }
    setFileUpload(false);
  };

  const handleImport = () => {
    setFileUpload(true);
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
                onClick={() => handleDeleteDataCategory(category.id)}
              >
                Delete
              </Button>
              <Button
                className={styles.lightMargin}
                onClick={handleExportToCSV}
              >
                Export
              </Button>
              <Button className={styles.lightMargin} onClick={handleImport}>
                Import
              </Button>
              <Popup isOpen={fileUpload}>
                <input type="file" accept=".csv" onChange={handleFileUpload} />
                <Button onClick={() => setFileUpload(false)}>Cancel</Button>
              </Popup>
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

      {loading && <LoadingSymbol size={50} />}
      {!loading && (
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
