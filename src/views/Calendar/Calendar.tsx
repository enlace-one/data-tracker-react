import { useState, useEffect } from "react";
import { Heading, Divider, Grid } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import Calendar from "react-calendar";
import styles from "./Calendar.module.css";
import {
  BlankHandling,
  DataPoint,
  ValueHandling,
  ZeroHandling,
} from "../../types";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { getDataPointsForSingleCategory } from "../../util";
import type { OnArgs } from "react-calendar";

export default function CalendarComponent() {
  const { dataCategories, screenWidth } = useData();
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [calendarData, setCalendarData] = useState<
    { day: string; value: number; note?: string }[]
  >([]);
  const [valueHandling, setValueHandling] = useState<ValueHandling>("output");
  const [blankHandling, setBlankHandling] = useState<BlankHandling>("skip");
  const [zeroHandling, setZeroHandling] = useState<ZeroHandling>("default");
  const color = "#00bfbf";

  // Set current month and date range
  useEffect(() => {
    if (dataCategories && !startDate && !endDate) {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      // Set start of current month
      const monthStart = new Date(currentYear, currentMonth, 1);

      setDateRange(monthStart);
      setLoading(false);
    }
  }, [dataCategories]);

  useEffect(() => {
    updateCalendarData(selectedCategory);
  }, [selectedCategory, valueHandling, blankHandling, zeroHandling]);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValueHandling(
      event.target.value as "output" | "value 1" | "value 2" | "value 3"
    );
  };

  const handleZeroChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setZeroHandling(event.target.value as ZeroHandling);
  };

  const updateCalendarData = async (categoryId: string) => {
    if (!startDate || !endDate || !categoryId) {
      setCalendarData([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const category = dataCategories.find((cat) => cat.id === categoryId);
    if (!category) {
      setCalendarData([]);
      setLoading(false);
      return;
    }

    const alignedDataPoints: DataPoint[] = await getDataPointsForSingleCategory(
      category,
      valueHandling,
      zeroHandling,
      blankHandling
    );

    // Format data for calendar
    const calendarData = alignedDataPoints.map((point) => ({
      day: point.name,
      value: point.value !== undefined ? point.value : 0,
      note: point.note,
    }));

    setCalendarData(calendarData);
    setLoading(false);
  };

  const setDateRange = (date: Date) => {
    // Start of the calendar grid (may include days from the previous month)
    const visibleStart = new Date(date);
    visibleStart.setDate(1);
    const startDayOfWeek = visibleStart.getDay(); // Sunday = 0
    visibleStart.setDate(visibleStart.getDate() - startDayOfWeek);

    // End of the calendar grid (includes trailing days from next month)
    const visibleEnd = new Date(date);
    visibleEnd.setMonth(visibleEnd.getMonth() + 1);
    visibleEnd.setDate(0); // last day of target month
    const endDayOfWeek = visibleEnd.getDay();
    visibleEnd.setDate(visibleEnd.getDate() + (6 - endDayOfWeek));

    const startStr = visibleStart.toISOString().split("T")[0];
    const endStr = visibleEnd.toISOString().split("T")[0];

    console.log("Visible calendar range:", startStr, "to", endStr);

    setStartDate(startStr);
    setEndDate(endStr);
  };

  const handleActiveDateChange = ({ activeStartDate, view }: OnArgs) => {
    if (!(activeStartDate instanceof Date) || view !== "month") return;
    setDateRange(activeStartDate);
  };

  // Customize tile content to display values
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return null;

    const dateStr = date.toISOString().split("T")[0];
    const dataPoint = calendarData.find((data) => data.day === dateStr);

    if (!dataPoint) return null;

    return (
      <div className={styles.tileValue}>
        {dataPoint.value}
        {selectedDate &&
          date.toDateString() === selectedDate.toDateString() && <span></span>}
      </div>
    );
  };

  // Customize tile class for styling
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== "month") return "";

    const dateStr = date.toISOString().split("T")[0];
    const dataPoint = calendarData.find((data) => data.day === dateStr);
    const isToday =
      date.getDate() === new Date().getDate() &&
      date.getMonth() === new Date().getMonth() &&
      date.getFullYear() === new Date().getFullYear();

    return [dataPoint ? styles.hasData : "", isToday ? styles.today : ""]
      .filter(Boolean)
      .join(" ");
  };

  // Set maxDate to end of current month to prevent future navigation
  const today = new Date();
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  const handleClickDay = (value: Date) => {
    setSelectedDate(value);
  };

  const handleBlankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setBlankHandling(event.target.value as BlankHandling);
  };

  return (
    <>
      <Heading level={1}>Calendar</Heading>
      <Divider />
      {loading && <LoadingSymbol size={50} />}
      {!loading && (
        <div
          style={{ width: Math.max(screenWidth - 600, 400), padding: "1rem" }}
        >
          <div className={styles.calendar}>
            <Calendar
              tileContent={tileContent}
              tileClassName={tileClassName}
              defaultView="month"
              maxDetail="month"
              minDetail="month"
              onClickDay={handleClickDay}
              value={new Date()}
              maxDate={maxDate}
              prev2Label={null}
              next2Label={null}
              onActiveStartDateChange={handleActiveDateChange}
            />
          </div>
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
                {dataCategories.map((item) => (
                  <option
                    className={styles.tableRow}
                    key={item.id}
                    value={item.id}
                  >
                    {item.name}
                  </option>
                ))}
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
                <option value="value 3">Value: # 3</option>
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
                value={zeroHandling}
                onChange={handleZeroChange}
              >
                <option value="default">Show 0 as 0</option>
                <option value="treat-as-blank">Show 0 as blank</option>
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
                value={blankHandling}
                onChange={handleBlankChange}
              >
                <option value="skip">Blanks: Skip</option>
                <option value="zeroize">Blanks: 0</option>
                <option value="previous">Blanks: Previous</option>
                <option value="default">Blanks: Default</option>
              </select>
            </div>
          </Grid>
          <Divider style={{ margin: "10px" }} />
        </div>
      )}
    </>
  );
}
