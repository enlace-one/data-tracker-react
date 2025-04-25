import { useState, useEffect } from "react";
import { Heading, Divider, Grid } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import styles from "./TextGraph.module.css";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { fetchDataEntriesByCategory } from "../../api";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function TextGraph() {
  const { dataCategories, screenWidth } = useData();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    category1: { [key: string]: number };
    category2: { [key: string]: number };
  }>({ category1: {}, category2: {} });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "",
    "",
  ]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const cat_1_color = "#00bfbf";
  const cat_2_color = "rgb(123, 182, 209)";

  // Initialize dates and loading state
  useEffect(() => {
    if (dataCategories && !startDate && !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
      setEndDate(today.toISOString().split("T")[0]);
      setLoading(false);
    }
  }, [dataCategories, startDate, endDate]);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    categoryIndex: number
  ) => {
    const newSelectedCategories = [...selectedCategories];
    newSelectedCategories[categoryIndex] = event.target.value;
    setSelectedCategories(newSelectedCategories);
  };

  const handleDateChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "start" | "end"
  ) => {
    if (type === "start") {
      setStartDate(event.target.value);
    } else {
      setEndDate(event.target.value);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      updateChartData();
    }
  }, [startDate, endDate, selectedCategories]);

  const updateChartData = async () => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Fetch data for first category
    let category1Data: { [key: string]: number } = {};
    if (selectedCategories[0]) {
      const category = dataCategories.find(
        (cat) => cat.id === selectedCategories[0]
      );
      if (category) {
        let entries = await fetchDataEntriesByCategory(selectedCategories[0]);
        console.log(
          `Category ${category.name} has ${entries.length} entries returned.`
        );

        entries = entries.filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= start && entryDate <= end;
        });

        for (const entry of entries) {
          const value = Array.isArray(entry.value)
            ? entry.value.join(",") // Handle array values
            : entry.value;
          if (value in category1Data) {
            category1Data[value] += 1;
          } else {
            category1Data[value] = 1;
          }
        }
        console.log(
          `Found ${entries.length} between ${start} and ${end} for category 1`
        );
      }
    }

    // Fetch data for second category
    let category2Data: { [key: string]: number } = {};
    if (selectedCategories[1]) {
      const category = dataCategories.find(
        (cat) => cat.id === selectedCategories[1]
      );
      if (category) {
        let entries = await fetchDataEntriesByCategory(selectedCategories[1]);
        console.log(
          `Category ${category.name} has ${entries.length} entries returned.`
        );

        entries = entries.filter((entry) => {
          const entryDate = new Date(entry.date);
          return entryDate >= start && entryDate <= end;
        });

        for (const entry of entries) {
          const value = Array.isArray(entry.value)
            ? entry.value.join(",") // Handle array values
            : entry.value;
          if (value in category2Data) {
            category2Data[value] += 1;
          } else {
            category2Data[value] = 1;
          }
        }
        console.log(
          `Found ${entries.length} between ${start} and ${end} for category 2`
        );
      }
    }

    setData({ category1: category1Data, category2: category2Data });
  };

  // Prepare data for Chart.js
  const allLabels = Array.from(
    new Set([...Object.keys(data.category1), ...Object.keys(data.category2)])
  );

  const chartData = {
    labels: allLabels,
    datasets: [
      {
        label: selectedCategories[0]
          ? dataCategories.find((cat) => cat.id === selectedCategories[0])
              ?.name ?? "Category 1"
          : "Category 1",
        data: allLabels.map((label) => data.category1[label] ?? 0),
        backgroundColor: cat_1_color,
        borderColor: "darkgrey",
        borderWidth: 1,
      },
      {
        label: selectedCategories[1]
          ? dataCategories.find((cat) => cat.id === selectedCategories[1])
              ?.name ?? "Category 2"
          : "Category 2",
        data: allLabels.map((label) => data.category2[label] ?? 0),
        backgroundColor: cat_2_color,
        borderColor: "darkgrey",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
        text: "Data Points Over Time",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Category Value",
        },
      },
      y: {
        title: {
          display: true,
          text: "Count",
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <>
      <Heading level={1}>Bar Graph</Heading>
      <Divider />
      {loading ? <LoadingSymbol size={50} /> : null}

      {!loading && (
        <>
          {/* Render Bar Chart */}
          <div style={{ height: "350px", maxWidth: "800px", margin: "0 auto" }}>
            <Bar data={chartData} options={chartOptions} />
          </div>
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
                  style={{
                    color: index === 0 ? cat_1_color : cat_2_color,
                    fontWeight: "bold",
                  }}
                >
                  <option value="">Choose Category {index + 1}</option>
                  {[
                    ...dataCategories.filter((item) =>
                      [
                        "select-text-001",
                        "text-001",
                        "select-numeric-001",
                      ].includes(item.dataType.id)
                    ),
                    ...dataCategories.filter(
                      (item) =>
                        ![
                          "select-text-001",
                          "text-001",
                          "select-numeric-001",
                        ].includes(item.dataType.id)
                    ),
                  ]
                    .filter(
                      (item) =>
                        item.id !== selectedCategories[index === 0 ? 1 : 0]
                    )
                    .map((item) => (
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
                onBlur={updateChartData}
                onChange={(e) => handleDateChange(e, "start")}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onBlur={updateChartData}
                onChange={(e) => handleDateChange(e, "end")}
                className={styles.dateInput}
              />
            </div>
          </Grid>
        </>
      )}
    </>
  );
}
