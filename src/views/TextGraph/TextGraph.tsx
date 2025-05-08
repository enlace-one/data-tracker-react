import { useState, useEffect } from "react";
import { Heading, Divider, Grid } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import styles from "./TextGraph.module.css";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
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
import { getDataPointEntriesForTwoCategories } from "../../util";
import { DataPoint } from "../../types";

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
  const { dataCategories } = useData();

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
  const [y1ValueHandling, setY1ValueHandling] = useState<
    "text" | "output" | "value 1" | "value 2" | "value 3"
  >("text");
  const [y2ValueHandling, setY2ValueHandling] = useState<
    "text" | "output" | "value 1" | "value 2" | "value 3"
  >("text");
  const [y1BlankHandling, setY1BlankHandling] = useState<
    "skip" | "zeroize" | "default" | "previous"
  >("skip");
  const [y2BlankHandling, setY2BlankHandling] = useState<
    "skip" | "zeroize" | "default" | "previous"
  >("skip");

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
  }, [
    startDate,
    endDate,
    selectedCategories,
    y2BlankHandling,
    y2ValueHandling,
    y1BlankHandling,
    y1ValueHandling,
  ]);

  const updateChartData = async () => {
    const { datasets: newDatasets } = await getDataPointEntriesForTwoCategories(
      selectedCategories,
      dataCategories,
      [y1ValueHandling, y2ValueHandling],
      ["default", "default"],
      [y1BlankHandling, y2BlankHandling],
      startDate,
      endDate,
      [cat_1_color, cat_2_color]
    );

    if (newDatasets.length == 1) {
      const category1Data: { [key: string]: number } = {};
      newDatasets[0].dataPoints.map((dp: DataPoint) => {
        const key = String(dp.value);
        category1Data[key] = (category1Data[key] || 0) + 1;
      });
      setData({ category1: category1Data, category2: {} });
    } else if (newDatasets.length == 2) {
      const category1Data: { [key: string]: number } = {};
      newDatasets[0].dataPoints.map((dp: DataPoint) => {
        const key = String(dp.value);
        category1Data[key] = (category1Data[key] || 0) + 1;
      });
      const category2Data: { [key: string]: number } = {};
      newDatasets[1].dataPoints.map((dp: DataPoint) => {
        const key = String(dp.value);
        category2Data[key] = (category2Data[key] || 0) + 1;
      });
      setData({ category1: category1Data, category2: category2Data });
    } else {
      setData({ category1: {}, category2: {} });
    }
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

  const handleY1ValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY1ValueHandling(
      event.target.value as
        | "text"
        | "output"
        | "value 1"
        | "value 2"
        | "value 3"
    );
  };

  const handleY2ValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY2ValueHandling(
      event.target.value as
        | "text"
        | "output"
        | "value 1"
        | "value 2"
        | "value 3"
    );
  };

  const handleY1BlankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY1BlankHandling(
      event.target.value as "skip" | "zeroize" | "default" | "previous"
    );
  };

  const handleY2BlankChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY2BlankHandling(
      event.target.value as "skip" | "zeroize" | "default" | "previous"
    );
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
                    // .filter(
                    //   (item) =>
                    //     item.id !== selectedCategories[index === 0 ? 1 : 0]
                    // )
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
              <select
                className={styles.multiSelect}
                value={y1ValueHandling}
                onChange={handleY1ValueChange}
              >
                <option value="text">Value: Text</option>
                <option value="output">Value: Output</option>
                <option value="value 1">Value: # 1</option>
                <option value="value 2">Value: # 2</option>
                <option value="value 3">Value: # 3</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <select
                className={styles.multiSelect}
                value={y2ValueHandling}
                onChange={handleY2ValueChange}
              >
                <option value="text">Value: Text</option>
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
                value={y1BlankHandling}
                onChange={handleY1BlankChange}
              >
                <option value="skip">Blanks: Skip</option>
                <option value="zeroize">Blanks: 0</option>
                <option value="previous">Blanks: Previous</option>
                <option value="default">Blanks: Default</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <select
                className={styles.multiSelect}
                value={y2BlankHandling}
                onChange={handleY2BlankChange}
              >
                <option value="skip">Blanks: Skip</option>
                <option value="zeroize">Blanks: 0</option>
                <option value="previous">Blanks: Previous</option>
                <option value="default">Blanks: Default</option>
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
