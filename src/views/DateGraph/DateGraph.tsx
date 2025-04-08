import { useState, useEffect } from "react";
import { Heading, Divider, Grid } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import { fetchDataEntriesByCategory } from "../../api";
import styles from "./DateGraph.module.css";
import { DataPoint, EnrichedDataCategory } from "../../types";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { parseEntryToDisplayValue, parseEntryToNumber } from "../../util";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DateGraph() {
  const { dataCategories, screenWidth } = useData();
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (dataCategories && !startDate && !endDate) {
      // Set default date range to last 30 days
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setEndDate(today.toISOString().split("T")[0]);
      setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
      setLoading(false);
    }
  }, [dataCategories]);

  useEffect(() => {
    if (startDate && endDate && selectedCategories.length > 0) {
      updateChartData(selectedCategories);
    }
  }, [startDate, endDate, selectedCategories]);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    categoryIndex: number
  ) => {
    const newSelectedCategories = [...selectedCategories];
    newSelectedCategories[categoryIndex] = event.target.value;
    setSelectedCategories(newSelectedCategories.filter(Boolean));
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

  const updateChartData = async (categories: string[]) => {
    if (!startDate || !endDate || categories.length === 0) return;

    setLoading(true);
    const datasets: any[] = [];
    const allDates = new Set<string>();
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const [index, catId] of categories.entries()) {
      if (!catId) continue;

      const entries = await fetchDataEntriesByCategory(catId);
      const category = dataCategories.find((cat) => cat.id === catId);
      if (!category) continue;

      const dataPoints: DataPoint[] = entries
        .map((entry) => ({
          name: entry.date,
          displayValue: parseEntryToDisplayValue(entry, category),
          value: parseEntryToNumber(entry, category),
          note: entry.note || "",
        }))
        .filter((point) => {
          const pointDate = new Date(point.name);
          return pointDate >= start && pointDate <= end;
        });

      dataPoints.forEach((point) => allDates.add(point.name));

      datasets.push({
        label: category.name,
        dataPoints: dataPoints,
        borderColor: index === 0 ? "#00bfbf" : "#9acee6",
        backgroundColor:
          index === 0 ? "rgba(0, 191, 191, 0.2)" : "rgba(154, 206, 230, 0.2)",
        tension: 0.1,
        fill: false,
        yAxisID: index === 0 ? "y1" : "y2",
      });
    }

    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const alignedDatasets = datasets.map((dataset) => {
      const dataMap = new Map(
        dataset.dataPoints.map((point: DataPoint) => [point.name, point.value])
      );
      return {
        label: dataset.label,
        data: sortedDates.map((date) => dataMap.get(date)),
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
        tension: dataset.tension,
        fill: dataset.fill,
        yAxisID: dataset.yAxisID,
        spanGaps: true,
      };
    });

    setChartData({
      labels: sortedDates,
      datasets: alignedDatasets,
    });
    setLoading(false);
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: function (context: any) {
            const datasetLabel = context.dataset.label || "";
            const value = context.parsed.y;
            return value !== null && value !== undefined
              ? `${datasetLabel}: ${value}`
              : `${datasetLabel}: No data`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y1: {
        type: "linear" as const,
        position: "left" as const,
        title: {
          display: true,
          text: "Category 1 Value",
          color: "#00bfbf",
        },
        grid: {
          drawOnChartArea: false,
        },
      },
      y2: {
        type: "linear" as const,
        position: "right" as const,
        title: {
          display: true,
          text: "Category 2 Value",
          color: "#9acee6",
        },
      },
    },
  };

  return (
    <>
      <Heading level={1}>Date Graph</Heading>
      <Divider />
      {loading && <LoadingSymbol size={50} />}
      {!loading && (
        <div
          style={{ height: "400px", width: Math.max(screenWidth - 600, 400) }}
        >
          <Line data={chartData} options={options} />
          <Grid
            margin="1rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            {[0, 1].map((index) => (
              <div key={index} className={styles.formGroup}>
                <select
                  onChange={(e) => handleCategoryChange(e, index)}
                  className={styles.multiSelect}
                  value={selectedCategories[index] || ""}
                >
                  <option value="">Choose Category {index + 1}</option>
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
            ))}
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
        </div>
      )}
    </>
  );
}
