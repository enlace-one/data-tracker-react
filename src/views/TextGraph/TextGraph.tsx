import { useState, useEffect } from "react";
import { Heading, Divider, Grid } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import styles from "./TextGraph.module.css";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { DataPoint } from "../../types";
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
import { parseEntryToDisplayValue } from "../../util";

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
  const [data, setData] = useState<{ [key: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState("");
  const thirty_days_ago = new Date();
  thirty_days_ago.setDate(new Date().getDate() - 30);
  const [startDate, setStartDate] = useState(
    thirty_days_ago.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    if (dataCategories) {
      setLoading(false);
    }
  }, [dataCategories]);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedCategory(event.target.value);
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
    updateChartData();
  }, [startDate, endDate, selectedCategory]);

  const updateChartData = async () => {
    if (!selectedCategory) return;
    const category = dataCategories.find((cat) => cat.id === selectedCategory);
    if (!category) return;

    let entries = await fetchDataEntriesByCategory(selectedCategory);
    console.log(
      `Category ${category.name} has ${entries.length} entries returned.`
    );

    const start = new Date(startDate);
    const end = new Date(endDate);

    entries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });

    const dataPoints: { [key: string]: number } = {};
    for (const entry of entries) {
      if (entry.value in dataPoints) {
        dataPoints[entry.value] += 1;
      } else {
        dataPoints[entry.value] = 1;
      }
    }

    console.log(`Found ${entries.length} between ${start} and ${end}`);
    setData(dataPoints); // Update state with filtered data
  };

  // Prepare data for Chart.js
  const chartData = {
    labels: Object.keys(data), // Values (e.g., text or numeric) for x-axis
    datasets: [
      {
        label: selectedCategory
          ? dataCategories.find((cat) => cat.id === selectedCategory)?.name
          : "Value",
        data: Object.values(data), // Counts for y-axis
        backgroundColor: "rgba(75, 192, 192, 0.6)", // Bar color
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
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
          stepSize: 1, // Ensure integer steps for counts
        },
      },
    },
  };

  return (
    <>
      <Heading level={1}>Graph</Heading>
      <Divider />
      {loading ? <LoadingSymbol size={50} /> : null}

      {!loading && (
        <>
          {/* Render Bar Chart */}
          {Object.keys(data).length > 0 && selectedCategory && (
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
              <Bar data={chartData} options={chartOptions} />
            </div>
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
                onChange={(e) => handleCategoryChange(e)}
                className={styles.multiSelect}
                value={selectedCategory || ""}
              >
                <option value="">Choose Category</option>
                {dataCategories
                  .filter((item) =>
                    [
                      "select-text-001",
                      "text-001",
                      "select-numeric-001",
                    ].includes(item.dataType.id)
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
          </Grid>
        </>
      )}

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
  );
}
