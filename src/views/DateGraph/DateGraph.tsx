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
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });

  useEffect(() => {
    if (dataCategories) {
      setLoading(false);
    }
  }, [dataCategories]);

  const handleCategoryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
    categoryIndex: number
  ) => {
    const newSelectedCategories = [...selectedCategories];
    newSelectedCategories[categoryIndex] = event.target.value;
    setSelectedCategories(newSelectedCategories.filter(Boolean));

    const datasets: any[] = [];
    const allDates = new Set<string>();

    for (const [index, catId] of newSelectedCategories.entries()) {
      if (!catId) continue;

      const entries = await fetchDataEntriesByCategory(catId);
      const category = dataCategories.find((cat) => cat.id === catId);
      if (!category) continue;

      const dataPoints: DataPoint[] = entries.map((entry) => ({
        name: entry.date,
        displayValue: parseEntryToDisplayValue(entry, category),
        value: parseEntryToNumber(entry, category),
        note: entry.note || "",
      }));

      dataPoints.forEach((point) => allDates.add(point.name));

      datasets.push({
        label: category.name,
        dataPoints: dataPoints,
        borderColor: index === 0 ? "#00bfbf" : "#9acee6", // Category 1: #00bfbf, Category 2: #9acee6
        backgroundColor:
          index === 0 ? "rgba(0, 191, 191, 0.2)" : "rgba(154, 206, 230, 0.2)",
        tension: 0.1,
        fill: false,
        yAxisID: index === 0 ? "y1" : "y2", // Assign different Y-axis IDs
      });
    }

    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const alignedDatasets = datasets.map((dataset) => ({
      label: dataset.label,
      data: sortedDates.map((date) => {
        const point = dataset.dataPoints.find(
          (p: DataPoint) => p.name === date
        );
        return point ? point.value : null;
      }),
      borderColor: dataset.borderColor,
      backgroundColor: dataset.backgroundColor,
      tension: dataset.tension,
      fill: dataset.fill,
      yAxisID: dataset.yAxisID,
    }));

    setChartData({
      labels: sortedDates,
      datasets: alignedDatasets,
    });
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
        // Left Y-axis for Category 1
        type: "linear" as const,
        position: "left" as const,
        title: {
          display: true,
          text: "Category 1 Value",
          color: "#00bfbf",
        },
        grid: {
          drawOnChartArea: false, // Only show grid for right axis
        },
      },
      y2: {
        // Right Y-axis for Category 2
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
        </div>
      )}
    </>
  );
}
