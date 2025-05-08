import { useState, useEffect, useMemo } from "react";
import { Heading, Divider, Grid, Text } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import styles from "./HeatMapGraph.module.css";
import { DataPoint } from "../../types";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
import { getDataPointEntriesForTwoCategories } from "../../util";
import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(LinearScale, PointElement, Tooltip, Legend);

export default function HeatMapGraph() {
  const { dataCategories, screenWidth } = useData();
  const [loading, setLoading] = useState(true);
  // const [allDatesSorted, setAllDatesSorted] = useState<string[]>([]); // N
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [chartData, setChartData] = useState<any>({
    datasets: [],
  });
  const [datasets, setDatasets] = useState<any[]>([]);
  // const [allDatesSorted, setAllDatesSorted] = useState<string[]>([]);
  const [correlation, setCorrelation] = useState<number | null>(null);
  const [y1ValueHandling, setY1ValueHandling] = useState<
    "output" | "value 1" | "value 2" | "value 3"
  >("output");
  const [y2ValueHandling, setY2ValueHandling] = useState<
    "output" | "value 1" | "value 2" | "value 3"
  >("output");
  const [y1BlankHandling, setY1BlankHandling] = useState<
    "skip" | "zeroize" | "default" | "previous"
  >("skip");
  const [y2BlankHandling, setY2BlankHandling] = useState<
    "skip" | "zeroize" | "default" | "previous"
  >("skip");
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
    y1ValueHandling,
    y2ValueHandling,
    y1BlankHandling,
    y2BlankHandling,
    startDate,
    endDate,
  ]);

  const handleCategoryChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
    categoryIndex: number
  ) => {
    const newSelectedCategories = [...selectedCategories];
    newSelectedCategories[categoryIndex] = event.target.value;
    setSelectedCategories(newSelectedCategories.filter(Boolean));
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

  const updateChartData = async (categories: string[]) => {
    if (!startDate || !endDate || categories.length < 2) {
      setChartData({ datasets: [] });
      setCorrelation(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { datasets: newDatasets, allDatesSorted: newAllDatesSorted } =
      await getDataPointEntriesForTwoCategories(
        selectedCategories,
        dataCategories,
        [y1ValueHandling, y2ValueHandling],
        ["default", "default"],
        [y1BlankHandling, y2BlankHandling],
        startDate,
        endDate,
        [cat_1_color, cat_2_color]
      );

    setDatasets(newDatasets);

    // console.debug(alignedDatasets);

    // Create heatmap data
    const heatmapData: {
      x: number;
      y: number;
      date: string;
      note: string;
      count: number;
    }[] = [];
    if (newDatasets.length === 2) {
      const cat1Data = new Map(
        newDatasets[0].dataPoints.map((point: DataPoint) => [point.name, point])
      );
      const cat2Data = new Map(
        newDatasets[1].dataPoints.map((point: DataPoint) => [point.name, point])
      );

      const pairedPoints: {
        x: number;
        y: number;
        date: string;
        note: string;
      }[] = [];
      for (const date of newAllDatesSorted) {
        const cat1Point = cat1Data.get(date) as DataPoint;
        const cat2Point = cat2Data.get(date) as DataPoint;
        if (
          cat1Point &&
          cat2Point &&
          cat1Point.value !== undefined &&
          cat2Point.value !== undefined
        ) {
          pairedPoints.push({
            x: cat2Point.value,
            y: cat1Point.value,
            date,
            note: `${cat1Point.note ? cat1Point.note + "; " : ""}${
              cat2Point.note || ""
            }`,
          });
        }
      }

      // Calculate bins for heatmap
      const xValues = pairedPoints.map((p) => p.x);
      const yValues = pairedPoints.map((p) => p.y);
      const xMin = Math.min(...xValues);
      const xMax = Math.max(...xValues);
      const yMin = Math.min(...yValues);
      const yMax = Math.max(...yValues);

      const numBins = 20; // Number of bins for each axis
      const xBinSize = (xMax - xMin) / numBins || 1;
      const yBinSize = (yMax - yMin) / numBins || 1;

      const bins: Map<
        string,
        {
          x: number;
          y: number;
          count: number;
          dates: string[];
          notes: string[];
        }
      > = new Map();
      for (const point of pairedPoints) {
        const xBin =
          Math.floor((point.x - xMin) / xBinSize) * xBinSize +
          xMin +
          xBinSize / 2;
        const yBin =
          Math.floor((point.y - yMin) / yBinSize) * yBinSize +
          yMin +
          yBinSize / 2;
        const key = `${xBin},${yBin}`;
        const bin = bins.get(key) || {
          x: xBin,
          y: yBin,
          count: 0,
          dates: [],
          notes: [],
        };
        bin.count += 1;
        bin.dates.push(point.date);
        bin.notes.push(point.note);
        bins.set(key, bin);
      }

      bins.forEach((bin) => {
        heatmapData.push({
          x: bin.x,
          y: bin.y,
          date: bin.dates.join(", "),
          note: bin.notes.join("; "),
          count: bin.count,
        });
      });

      // Calculate correlation
      if (pairedPoints.length > 1) {
        let sumX = 0,
          sumY = 0,
          sumXY = 0,
          sumX2 = 0,
          sumY2 = 0,
          n = pairedPoints.length;
        for (const point of pairedPoints) {
          sumX += point.x;
          sumY += point.y;
          sumXY += point.x * point.y;
          sumX2 += point.x * point.x;
          sumY2 += point.y * point.y;
        }
        const numerator = n * sumXY - sumX * sumY;
        const denominator = Math.sqrt(
          (n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY)
        );
        const correlationValue =
          denominator === 0 ? 0 : numerator / denominator;
        setCorrelation(Number(correlationValue.toFixed(3)));
      } else {
        setCorrelation(null);
      }
    }

    // Normalize counts for color intensity
    const maxCount = Math.max(...heatmapData.map((d) => d.count), 1);
    setChartData({
      datasets: [
        {
          label: `${newDatasets[0]?.label || "Category 1"} vs ${
            newDatasets[1]?.label || "Category 2"
          }`,
          data: heatmapData,
          backgroundColor: heatmapData.map(
            (d) => `rgba(0, 191, 191, ${d.count / maxCount})`
          ),
          pointRadius: heatmapData.map((d) => Math.sqrt(d.count) * 10 + 5),
          pointHoverRadius: heatmapData.map((d) => Math.sqrt(d.count) * 12 + 8),
        },
      ],
    });
    setLoading(false);
  };

  console.debug("Cat 1 data");
  console.debug(datasets);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const point = context.raw;
              console.log(
                "point:",
                point.date.split(",")[0].trim(),
                point.date.split(",")[0].trim() === "2025-05-03"
              );
              const p1 = datasets[0]?.dataPoints.find(
                (d: { name: string; value: number }) =>
                  d.name === point.date.split(",")[0].trim()
              );
              const p2 = datasets[1]?.dataPoints.find(
                (d: { name: string; value: number; displayValue: string }) =>
                  d.name === point.date.split(",")[0].trim()
              );
              return [
                `Count: ${point.count}`,
                `Date(s): ${point.date}`,
                `${p1?.label || "Category 1"}: ${p1?.value} (${
                  p1?.displayValue
                })`,
                `${p2?.label || "Category 2"}: ${p2?.value} (${
                  p2?.displayValue
                })`,
                point.note ? `Note: ${point.note}` : "",
              ].filter(Boolean);
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear" as const,
          title: {
            display: true,
            text: datasets[1]?.label || "Category 2 Value",
            color: cat_2_color,
          },
        },
        y: {
          type: "linear" as const,
          title: {
            display: true,
            text: datasets[0]?.label || "Category 1 Value",
            color: cat_1_color,
          },
        },
      },
    }),
    [datasets]
  );

  return (
    <>
      <Heading level={1}>Heatmap</Heading>
      <Divider />
      {loading && <LoadingSymbol size={50} />}
      {!loading && (
        <div
          style={{ height: "400px", width: Math.max(screenWidth - 600, 400) }}
        >
          <Scatter data={chartData} options={options} />
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
              <div key={index} className={styles.formGroup}>
                <select
                  onChange={(e) => handleCategoryChange(e, index)}
                  className={styles.multiSelect}
                  value={selectedCategories[index] || ""}
                  style={
                    index === 0
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
          <div style={{ padding: "50px" }}></div>
        </div>
      )}
    </>
  );
}
