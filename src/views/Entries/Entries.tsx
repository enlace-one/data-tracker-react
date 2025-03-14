import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import {
  createDataEntry,
  deleteDataEntry,
  updateDataEntry,
  fetchDataEntries,
  deleteAllDataEntries,
  client,
} from "../../api";
import TextButton from "../../components/TextButton/TextButton";
import Form from "../../components/Form/Form";
import styles from "./Entries.module.css";
import { useState, useEffect } from "react";
import { DataEntry, FormDataType } from "../../types";
import FlexForm from "../../components/FlexForm/FlexForm";
import DateSpan from "../../components/DateSpan/DateSpan";
import { Pagination } from "@aws-amplify/ui-react";

export default function Entries() {
  const { dataCategories, dataTypes, SETTINGS } = useData();
  const [dataEntries, setDataEntries] = useState<DataEntry[]>([]);

  const [pageTokens, setPageTokens] = useState([null]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(true);

  const handleNextPage = async () => {
    if (hasMorePages && currentPageIndex === pageTokens.length) {
      const {
        data: dataEntries,
        nextToken,
        errors,
      } = await client.models.DataEntry.listByDate(
        { dummy: 0 },
        {
          sortDirection: "DESC",
          limit: 20,
          nextToken: pageTokens[pageTokens.length - 1],
        }
      );
      setDataEntries(dataEntries);

      if (!nextToken) {
        setHasMorePages(false);
      }

      setPageTokens([...pageTokens, nextToken]);
    }

    setCurrentPageIndex(currentPageIndex + 1);
  };

  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const entries = await fetchDataEntries(20);
        setDataEntries(entries);
      } catch (error) {
        console.error("Error fetching data entries:", error);
      }
    };

    fetchData();
  }, []);

  const handleRightClick = (e: React.MouseEvent<Element>, id: string) => {
    e.preventDefault(); // Prevent the default context menu from appearing
    console.log("Right click detected", id);
    if (id == selectedEntry) {
      setSelectedEntry(null);
    } else {
      setSelectedEntry(id);
    }
  };

  const getUpdateEntryFormField = (entry: DataEntry) => {
    return [
      { name: "Value", id: "value", default: entry.value ?? "" },
      {
        name: "Data Category",
        id: "dataCategoryId",
        type: "select",
        options: dataCategoryOptions,
        required: true,
        default: entry.dataCategoryId,
      },
      { name: "Date", id: "date", type: "date", default: entry.date ?? "" },
      { name: "Note", id: "note", default: entry.note ?? "" },
      { name: "Id", id: "id", default: entry.id ?? "", hidden: true },
    ];
  };

  const dataCategoryOptions = dataCategories.map((dt) => ({
    label: dt.name,
    value: dt.id,
  }));

  const formFields = [
    {
      name: "Data Category",
      id: "dataCategoryId",
      type: "select",
      options: dataCategoryOptions,
      required: true,
    },
    { name: "Value", id: "value" },
    { name: "Date", id: "date", type: "date" },
    { name: "Note", id: "note" },
  ];
  const handleFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    createDataEntry(formData); // Handle form data submission
  };

  const handleUpdateEntryFormData = (formData: Record<string, any>) => {
    console.log("Received form data:", formData);
    // formData.dataCategoryId = category.id;
    // formData.id =
    updateDataEntry(formData); // Handle form data submission
  };

  const addTestEntries = () => {
    console.log("Adding test entries.");
    let numberDataTypeId = "";
    dataTypes.forEach((dt) => {
      if (dt.name == "Number") {
        numberDataTypeId = dt.id;
      }
    });
    const today = new Date();
    dataCategories.forEach((cat) => {
      if (cat.dataTypeId == numberDataTypeId) {
        for (let x = 1; x < 50; x++) {
          const day = new Date();
          day.setDate(today.getDate() - x);
          const entry = {
            dataCategoryId: cat.id,
            value: `${x}`,
            date: day.toISOString().split("T")[0],
            note: "",
          };
          createDataEntry(entry);
          // You can use 'day' here for further logic
        }
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
              <Form
                heading="New Entry"
                fields={formFields}
                buttonText="Add New"
                handleFormData={handleFormData}
              />
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
                  {item.value} <br />
                  <small>
                    {dataCategories
                      .filter((dt) => dt.id === item.dataCategoryId)
                      .map((dt) => dt.name)
                      .join(", ")}{" "}
                    - {item.date}
                  </small>
                  <br />
                  <small>{item.note} </small>
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
                      <br />
                      <small>
                        Category Note:{" "}
                        {dataCategories
                          .filter((dt) => dt.id === item.dataCategoryId)
                          .map((dt) => dt.note)
                          .join(", ")}{" "}
                      </small>
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
        currentPage={currentPageIndex}
        totalPages={pageTokens.length}
        hasMorePages={hasMorePages}
        onNext={handleNextPage}
        onPrevious={() => setCurrentPageIndex(currentPageIndex - 1)}
        onChange={(pageIndex) => setCurrentPageIndex(pageIndex)}
      />
    </>
  );
}
