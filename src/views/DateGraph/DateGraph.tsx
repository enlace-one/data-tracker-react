import { useState, useEffect, useMemo } from "react";
import { Heading, Divider, Grid, Button, Text } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import { fetchDataEntriesByCategory } from "../../api";
import styles from "./DateGraph.module.css";
import { DataPoint } from "../../types";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import {
  fillAllDates,
  parseEntryToDisplayValue,
  parseEntryValueToNumber,
} from "../../util";
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
  const { dataCategories, screenWidth, setActiveTab } = useData();
  const [loading, setLoading] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [chartData, setChartData] = useState<any>({
    labels: [],
    datasets: [],
  });
  const [datasets, setDatasets] = useState<any[]>([]); // New state for datasets
  const [allDatesSorted, setAllDatesSorted] = useState<string[]>([]); // N
  const [y1MinSetting, setY1MinSetting] = useState<"min-value" | "zeroize">(
    "min-value"
  );
  const [y2MinSetting, setY2MinSetting] = useState<"min-value" | "zeroize">(
    "min-value"
  );
  const [y1BlankHandling, setY1BlankHandling] = useState<
    "skip" | "zeroize" | "default" | "previous"
  >("skip");
  const [y2BlankHandling, setY2BlankHandling] = useState<
    "skip" | "zeroize" | "default" | "previous"
  >("skip");
  const [y1ValueHandling, setY1ValueHandling] = useState<
    "output" | "value 1" | "value 2" | "value 3"
  >("output");
  const [y2ValueHandling, setY2ValueHandling] = useState<
    "output" | "value 1" | "value 2" | "value 3"
  >("output");
  const [y1Average, setY1Average] = useState<string>("");
  const [y2Average, setY2Average] = useState<string>("");
  const [y1StandardDev, setY1StandardDev] = useState<string>("");
  const [y2StandardDev, setY2StandardDev] = useState<string>("");
  const [correlation, setCorrelation] = useState<number | null>(null); // New state for correlation
  const [tension, setTension] = useState<number>(0.2);
  const [lineStyle, setLineStyle] = useState("default");
  const [maxHandling, setMaxHandling] = useState("default");
  const [maxValue, setMaxValue] = useState(-1000);
  const cat_1_color = "#00bfbf";
  const cat_2_color = "rgb(123, 182, 209)";

  useEffect(() => {
    if (dataCategories && !startDate && !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      setEndDate(today.toISOString().split("T")[0]);
      setStartDate(thirtyDaysAgo.toISOString().split("T")[0]);
      setLoading(false);
    }
  }, [dataCategories]);

  useEffect(() => {
    updateChartData(selectedCategories);
  }, [
    selectedCategories,
    y2BlankHandling,
    y1BlankHandling,
    maxHandling,
    y2MinSetting,
    y1MinSetting,
    y1ValueHandling,
    y2ValueHandling,
    tension,
    lineStyle,
  ]);

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

  const handleY1MinChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY1MinSetting(event.target.value as "min-value" | "zeroize");
  };

  const handleY2MinChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY2MinSetting(event.target.value as "min-value" | "zeroize");
  };

  const handleY1ValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY1ValueHandling(
      event.target.value as "output" | "value 1" | "value 2" | "value 3"
    );
  };

  const handleY2ValueChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setY2ValueHandling(
      event.target.value as "output" | "value 1" | "value 2" | "value 3"
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

  const handleTensionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTension(Number(event.target.value));
  };

  const handleLineStyleChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setLineStyle(event.target.value);
  };

  const handleMaxHandlingChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setMaxHandling(event.target.value);
  };

  const updateChartData = async (categories: string[]) => {
    if (startDate && endDate && categories.length > 0) {
      console.log("Updating chart...");
    } else {
      console.log("Missing date or selected cats");
      return;
    }
    if (!startDate || !endDate || categories.length === 0) return;

    setLoading(true);
    const newDatasets: any[] = [];
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
          value: parseEntryValueToNumber(
            entry.value,
            category,
            index === 0 ? y1ValueHandling : y2ValueHandling
          ),
          note: entry.note || "",
        }))

        .filter((point) => {
          const pointDate = new Date(point.name);
          return pointDate >= start && pointDate <= end;
        });

      dataPoints.forEach((point) => allDates.add(point.name));

      newDatasets.push({
        label: category.name,
        dataPoints: dataPoints,
        category,
        borderColor: index === 0 ? cat_1_color : cat_2_color,
        backgroundColor:
          index === 0 ? "rgba(0, 191, 191, 0.2)" : "rgba(154, 206, 230, 0.2)",
        // tension: tension,
        fill: false,
        yAxisID: index === 0 ? "y1" : "y2",
      });
    }

    const sortedDates = Array.from(allDates).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    const newAllDatesSorted = fillAllDates(sortedDates);
    setAllDatesSorted(newAllDatesSorted); // Set state
    setDatasets(newDatasets); // Set state

    const alignedDatasets = newDatasets.map((dataset, index) => {
      const dataMap = new Map(
        dataset.dataPoints.map((point: DataPoint) => [point.name, point.value])
      );
      const blankHandling = index === 0 ? y1BlankHandling : y2BlankHandling;

      const data = newAllDatesSorted.map((date) => {
        const value = dataMap.get(date);
        if (value !== undefined) return value;

        switch (blankHandling) {
          case "zeroize":
            return 0;
          case "previous":
            const prevIndex = newAllDatesSorted.indexOf(date) - 1;
            return prevIndex >= 0 &&
              dataMap.get(newAllDatesSorted[prevIndex]) !== undefined
              ? dataMap.get(newAllDatesSorted[prevIndex])
              : 0;
          case "default":
            return parseEntryValueToNumber(
              dataset.category.defaultValue ?? "0",
              dataset.category,
              index === 0 ? y1ValueHandling : y2ValueHandling
            );
          case "skip":
          default:
            return undefined;
        }
      });

      return {
        label: dataset.label,
        data,
        borderColor: dataset.borderColor,
        backgroundColor: dataset.backgroundColor,
        tension: tension,
        stepped: lineStyle == "stepped" ? true : false,
        fill: false,
        yAxisID: dataset.yAxisID,
        spanGaps: true,
      };
    });

    if (alignedDatasets.length >= 1) {
      const x = alignedDatasets[0].data;
      const y = alignedDatasets.length === 2 ? alignedDatasets[1].data : null;
      let sumX = 0,
        sumY = 0,
        sumXY = 0,
        sumX2 = 0,
        sumY2 = 0,
        localMax = -1000,
        nX = 0,
        nY = 0,
        nPairs = 0;

      for (let i = 0; i < newAllDatesSorted.length; i++) {
        const xVal = x[i] ?? null;
        const yVal = y?.[i] ?? null;

        if (xVal !== null) {
          sumX += xVal;
          sumX2 += xVal * xVal;
          nX++;
          localMax = Math.max(localMax, xVal);
        }
        if (yVal !== null) {
          sumY += yVal;
          sumY2 += yVal * yVal;
          nY++;
          localMax = Math.max(localMax, yVal);
        }
        if (xVal !== null && yVal !== null) {
          sumXY += xVal * yVal;
          nPairs++;
        }
      }

      setY1Average(nX > 0 ? (sumX / nX).toFixed(3) : "");
      setY1StandardDev(
        nX > 0
          ? Math.sqrt(nX > 1 ? sumX2 / nX - (sumX / nX) ** 2 : 0).toFixed(3)
          : ""
      );
      setY2Average(nY > 0 ? (sumY / nY).toFixed(3) : "");
      setY2StandardDev(
        nY > 0
          ? Math.sqrt(nY > 1 ? sumY2 / nY - (sumY / nY) ** 2 : 0).toFixed(3)
          : ""
      );

      setCorrelation(
        alignedDatasets.length === 2 && nPairs >= 2
          ? Number(
              (
                (nPairs * sumXY - sumX * sumY) /
                  Math.sqrt(
                    (nPairs * sumX2 - sumX * sumX) *
                      (nPairs * sumY2 - sumY * sumY)
                  ) || 0
              ).toFixed(3)
            )
          : null
      );
      console.log("Setting max value to ", localMax);
      setMaxValue(localMax);
    } else {
      setY1Average("");
      setY2Average("");
      setY1StandardDev("");
      setY2StandardDev("");
      setCorrelation(null);
      setMaxValue(-1000);
    }

    setChartData({
      labels: newAllDatesSorted,
      datasets: alignedDatasets,
    });
    setLoading(false);
  };

  const options = useMemo(
    () => ({
      responsive: true,
      useTension: tension,
      // useTension: 0.4,
      // cubicInterpolationMode: "monotone",
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
              const index = context.dataIndex;
              const datasetIndex = context.datasetIndex;
              const dataPoint = datasets[datasetIndex]?.dataPoints.find(
                (dp: DataPoint) => dp.name === allDatesSorted[index]
              );
              const note = dataPoint?.note ? ` - ${dataPoint.note}` : "";
              return value !== null && value !== undefined
                ? `${datasetLabel}: ${value} (${dataPoint.displayValue})${note}`
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
            color: cat_1_color,
          },
          grid: {
            drawOnChartArea: false,
          },
          min: y1MinSetting === "zeroize" ? 0 : undefined,
          max:
            maxHandling === "default"
              ? undefined
              : maxHandling === "match"
              ? maxValue
              : parseInt(maxHandling, 10),
        },
        y2: {
          type: "linear" as const,
          position: "right" as const,
          title: {
            display: true,
            text: "Category 2 Value",
            color: cat_2_color,
          },
          min: y2MinSetting === "zeroize" ? 0 : undefined,
          max:
            maxHandling === "default"
              ? undefined
              : maxHandling === "match"
              ? maxValue
              : parseInt(maxHandling, 10),
        },
      },
    }),
    [y1MinSetting, y2MinSetting, datasets, allDatesSorted] // Added dependencies
  );

  return (
    <>
      <Heading level={1}>Line Graph</Heading>
      <Divider />
      {loading && <LoadingSymbol size={50} />}
      {!loading && (
        <div
          style={{ height: "400px", width: Math.max(screenWidth - 600, 400) }}
        >
          <Line data={chartData} options={options} />
          {correlation !== null && (
            <Text textAlign="center" margin="1rem 0">
              Correlation Coefficient: {correlation}
            </Text>
          )}
          <Grid
            margin="1rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            {[0, 1].map((index) => (
              <Text key={`Average${index}`}>
                {(index == 0 ? y1Average : y2Average) != ""
                  ? index == 0
                    ? `Average: ${y1Average}`
                    : `Average: ${y2Average}`
                  : ""}
              </Text>
            ))}
          </Grid>
          <Grid
            margin="1rem 0"
            autoFlow="column"
            justifyContent="center"
            gap="1rem"
            alignContent="center"
          >
            {[0, 1].map((index) => (
              <Text key={`SD${index}`}>
                {(index == 0 ? y1StandardDev : y2StandardDev) != ""
                  ? index == 0
                    ? `SD: ${y1StandardDev}`
                    : `SD: ${y2StandardDev}`
                  : ""}
              </Text>
            ))}
          </Grid>
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
                  style={
                    index == 0
                      ? { color: cat_1_color, fontWeight: "bold" }
                      : { color: cat_2_color, fontWeight: "bold" }
                  }
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
              <select
                className={styles.multiSelect}
                value={y1MinSetting}
                onChange={handleY1MinChange}
              >
                <option value="min-value">Min: Auto</option>
                <option value="zeroize">Min: 0</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <select
                className={styles.multiSelect}
                value={y2MinSetting}
                onChange={handleY2MinChange}
              >
                <option value="min-value">Min: Auto</option>
                <option value="zeroize">Min: 0</option>
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
              <select
                className={styles.multiSelect}
                value={y1ValueHandling}
                onChange={handleY1ValueChange}
              >
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
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onBlur={() => updateChartData(selectedCategories)}
                onChange={(e) => handleDateChange(e, "start")}
                className={styles.dateInput}
              />
            </div>
            <div className={styles.formGroup}>
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onBlur={() => updateChartData(selectedCategories)}
                onChange={(e) => handleDateChange(e, "end")}
                className={styles.dateInput}
              />
            </div>
          </Grid>
          <Divider style={{ margin: "10px" }} />
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
                value={lineStyle}
                onChange={handleLineStyleChange}
              >
                <option value="default">Default</option>
                <option value="stepped">Stepped</option>
                {/* <option value="filled">Filled</option> */}
              </select>
            </div>
            <div className={styles.formGroup}>
              <select
                className={styles.multiSelect}
                value={tension}
                onChange={handleTensionChange}
              >
                <option value="0.1">Tension: 0.1</option>
                <option value="0.2">Tension: 0.2</option>
                <option value="0.3">Tension: 0.3</option>
                <option value="0.4">Tension: 0.4</option>
                <option value="0.5">Tension: 0.5</option>
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
                value={maxHandling}
                onChange={handleMaxHandlingChange}
              >
                <option value="default">Max: Default</option>
                <option value="match">Max: Match</option>
                <option value="1">Max: 1</option>
                <option value="2">Max: 2</option>
                <option value="10">Max: 10</option>
                <option value="100">Max: 100</option>
                <option value="1000">Max: 1000</option>
                <option value="10000">Max: 10000</option>
                {/* <option value="filled">Filled</option> */}
              </select>
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
              Bar Chart
            </Button>
            <Button onClick={() => setActiveTab("heat-map-graph")}>
              Heatmap
            </Button>
            <Button onClick={() => setActiveTab("graph")}>Legacy Graph</Button>
          </Grid>
          <div style={{ padding: "50px" }}> </div>
        </div>
      )}
    </>
  );
}
