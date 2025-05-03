import { useState, useEffect } from "react";
import { Heading, Divider, Grid, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import { fetchDataEntriesByCategory } from "../../api";
import styles from "./Calendar.module.css";
import { DataPoint } from "../../types";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { parseEntryToDisplayValue, parseEntryValueToNumber } from "../../util";
import { ResponsiveCalendar } from "@nivo/calendar";

// Define interface for entry
interface DataEntry {
  date: string;
  value: string | number | object;
  note?: string;
}

export default function Calendar() {
  const { dataCategories, screenWidth, setActiveTab } = useData();
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [calendarData, setCalendarData] = useState<
    { day: string; value: number; note?: string }[]
  >([]);
  const [valueHandling, setValueHandling] = useState<
    "output" | "value 1" | "value 2"
  >("output");
  const color = "#00bfbf";

  // Set current month and date range
  useEffect(() => {
    if (dataCategories && !startDate && !endDate) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // Set start of current month
      const monthStart = new Date(currentYear, currentMonth, 1);
      // Set end of current month
      const monthEnd = new Date(currentYear, currentMonth + 1, 0);

      setStartDate(monthStart.toISOString().split("T")[0]);
      setEndDate(monthEnd.toISOString().split("T")[0]);
      setLoading(false);
    }
  }, [dataCategories]);

  useEffect(() => {
    updateCalendarData(selectedCategory);
  }, [selectedCategory, valueHandling, startDate, endDate]);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
  };

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end"
  ) => {
    const newDate = event.target.value;
    if (type === "start") {
      setStartDate(newDate);
    } else {
      setEndDate(newDate);
    }
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValueHandling(event.target.value as "output" | "value 1" | "value 2");
  };

  const updateCalendarData = async (categoryId: string) => {
    if (!startDate || !endDate || !categoryId) {
      setCalendarData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const start = new Date(startDate);
    const end = new Date(endDate);
    const category = dataCategories.find((cat) => cat.id === categoryId);
    if (!category) {
      setCalendarData([]);
      setLoading(false);
      return;
    }

    const entries: DataEntry[] = await fetchDataEntriesByCategory(categoryId);
    const dataPoints: DataPoint[] = entries
      .map((entry) => ({
        name: entry.date,
        displayValue: parseEntryToDisplayValue(entry, category),
        value: parseEntryValueToNumber(entry.value, category, valueHandling),
        note: entry.note || "",
      }))
      .filter((point) => {
        const pointDate = new Date(point.name);
        return pointDate >= start && pointDate <= end;
      });

    // Format data for Nivo calendar
    const calendarData = dataPoints.map((point) => ({
      day: point.name,
      value: point.value !== undefined ? point.value : 0,
      note: point.note,
    }));

    setCalendarData(calendarData);
    setLoading(false);
  };

  // Ensure the calendar displays the current month
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  return (
    <>
      <Heading level={1}>Calendar</Heading>
      <Divider />
      {loading && <LoadingSymbol size={50} />}
      {!loading && (
        <div
          style={{ height: "300px", width: Math.max(screenWidth - 600, 400) }}
        >
          {calendarData.length > 0 && (
            <ResponsiveCalendar
              data={calendarData}
              from={monthStart.toISOString().split("T")[0]}
              to={monthEnd.toISOString().split("T")[0]}
              colors={[color]}
              emptyColor="#d3d3d3"
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
              monthBorderColor="#ffffff"
              dayBorderWidth={2}
              dayBorderColor="#ffffff"
              direction="vertical"
              align="top"
              daySpacing={4}
              tooltip={({ day, value, note }) => (
                <div
                  style={{
                    background: "white",
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  }}
                >
                  <strong>Date:</strong> {day}
                  <br />
                  <strong>Value:</strong>{" "}
                  {value !== 0 ? value.toFixed(2) : "No Entry"}
                  <br />
                  {note && (
                    <>
                      <strong>Note:</strong> {note}
                    </>
                  )}
                </div>
              )}
              theme={{
                textColor: "#333",
                fontSize: 12,
                tooltip: {
                  container: {
                    background: "white",
                    color: "#333",
                    fontSize: "12px",
                  },
                },
              }}
              // Render custom day to show circle and value
              day={({ date, data, size }) => {
                const dayData = data.find(
                  (d: any) => d.day === date.toISOString().split("T")[0]
                );
                const hasEntry = dayData && dayData.value !== 0;
                const value = hasEntry ? dayData.value.toFixed(2) : "";
                return (
                  <g transform={`translate(${size / 2}, ${size / 2})`}>
                    {hasEntry && (
                      <>
                        <circle
                          r={size / 2 - 2}
                          fill="none"
                          stroke={color}
                          strokeWidth={2}
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          style={{
                            fontSize: "10px",
                            fill: "#333",
                          }}
                        >
                          {value}
                        </text>
                      </>
                    )}
                  </g>
                );
              }}
            />
          )}
          <Grid
            margin="1rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            <div className={styles.formGroup}>
              <select
                onChange={handleCategoryChange}
                className={styles.multiSelect}
                value={selectedCategory}
                style={{ color, fontWeight: "bold" }}
              >
                <option value="">Choose Category</option>
                {dataCategories.map(
                  (item) =>
                    (item.dataType.inputType === "number" ||
                      item.dataType.inputType === "boolean-string" ||
                      item.dataType.inputType === "time" ||
                      item.dataType.id === "select-numeric-001" ||
                      item.dataType.isComplex) && (
                      <option
                        className={styles.tableRow}
                        key={item.id}
                        value={item.id}
                      >
                        {item.name}
                      </option>
                    )
                )}
              </select>
            </div>
          </Grid>
          <Grid
            margin="1rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            <div className={styles.formGroup}>
              <select
                className={styles.multiSelect}
                value={valueHandling}
                onChange={handleValueChange}
              >
                <option value="output">Value: Output</option>
                <option value="value 1">Value: # 1</option>
                <option value="value 2">Value: # 2</option>
              </select>
            </div>
          </Grid>
          <Grid
            margin="1rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            <div className={styles.formGroup}>
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateChange(e, "start")}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateChange(e, "end")}
                className={styles.dateInput}
              />
            </div>
          </Grid>
          <Divider style={{ margin: "10px" }} />
          <Grid
            margin="0 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            <Button onClick={() => setActiveTab("text-graph")}>
              Bar Graph
            </Button>
            <Button onClick={() => setActiveTab("graph")}>Legacy Graph</Button>
          </Grid>
          <div style={{ padding: "50px" }}></div>
        </div>
      )}
    </>
  );
}
