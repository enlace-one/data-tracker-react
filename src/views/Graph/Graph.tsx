// import { useState } from "react";
import { Heading, Divider } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import { fetchDataEntriesByCategory } from "../../api";
import styles from "./Graph.module.css";
import { useState, useEffect } from "react";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";
// import HoverText from "../../components/HoverText/HoverText";

export default function Graph() {
  const { dataCategories, screenWidth } = useData();
  // const [selectedCategory, setSelectedCategory] = useState<DataCategory | null>(
  //   null
  // );

  const [loading, setLoading] = useState(true);
  const [labelsToShow, setlabelsToShow] = useState(1);
  const [entryCountMax, setEntryCountMax] = useState(10);
  const [hoveredText, setHoveredText] = useState<string | null>(null);

  const [data, setData] = useState<
    { name: string; value: number; note: string }[]
  >([]);

  useEffect(() => {
    if (dataCategories) {
      setLoading(false);
    }
  }, [dataCategories]);

  const handleCategoryChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newData: { name: string; value: number; note: string }[] = [];
    const selectedOptions = Array.from(event.target.selectedOptions).map(
      (option) => option.value
    );
    console.log("Selected Categories:", selectedOptions);

    for (const catId of selectedOptions) {
      const entries = await fetchDataEntriesByCategory(catId);

      // Reverse the entries and take the last 30
      const reversedEntries = entries.slice(0, entryCountMax).reverse();

      reversedEntries.forEach((entry) => {
        newData.push({
          name: entry.date, // Assuming `entry.date` is accessible
          value:
            entry.value === "true"
              ? 1
              : entry.value === "false"
              ? 0
              : Number(entry.value),
          note: entry.note || "",
        });
      });

      console.log("Data is", newData);

      if (reversedEntries.length >= 50) {
        setlabelsToShow(10);
      } else if (reversedEntries.length >= 30) {
        setlabelsToShow(6);
      } else if (reversedEntries.length >= 20) {
        setlabelsToShow(5);
      } else if (reversedEntries.length >= 15) {
        setlabelsToShow(4);
      } else if (reversedEntries.length >= 10) {
        setlabelsToShow(3);
      } else if (reversedEntries.length > 5) {
        setlabelsToShow(2);
      } else {
        setlabelsToShow(1);
      }

      console.log(
        `Label length ${
          reversedEntries.length
        } and labels to show ${labelsToShow} resulting in ${
          reversedEntries.length / labelsToShow
        }`
      );
    }

    setData(newData);
  };

  const width = Math.max(screenWidth - 600, 400);
  const height = 300;
  const padding = 40;
  // const xAxisLabel = "Time";
  const yAxisLabel = "Value";

  const maxValue = Math.max(...data.map((d) => d.value));
  const scaleX = (index: number) =>
    (index / (data.length - 1)) * (width - padding * 2) + padding;
  const scaleY = (value: number) =>
    height - padding - (value / maxValue) * (height - padding * 2);

  const pathData = data
    .map((d, i) => `${i === 0 ? "M" : "L"} ${scaleX(i)} ${scaleY(d.value)}`)
    .join(" ");

  const handleMouseEnter = (text: string) => {
    setHoveredText(text); // Set the hovered text when mouse enters
  };

  const handleMouseLeave = () => {
    setHoveredText(null); // Clear the hovered text when mouse leaves
  };

  const handleCountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setEntryCountMax(Number(value));
  };

  return (
    <>
      <Heading level={1}>Graph</Heading>
      <Divider />
      {loading && <LoadingSymbol size={50} />}
      {!loading && (
        <div>
          {/* Display hover text */}
          {hoveredText && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)", // Centers the element
                backgroundColor: "rgba(0, 0, 0, 0.8)", // Optional: background for better visibility
                color: "white", // Optional: text color
                padding: "0px 10px", // Optional: padding for a better look
                borderRadius: "4px", // Optional: rounded corners
                zIndex: 1, // Optional: to ensure it appears on top of other content
              }}
            >
              <p style={{ textAlign: "center" }}>
                {hoveredText.split("\n")[0]} <br />
                {hoveredText.split("\n")[1]}
              </p>{" "}
              {/* Custom hover text */}
            </div>
          )}
          <svg width={width} height={height}>
            {/* X and Y axis */}
            <line
              x1={padding}
              y1={height - padding}
              x2={width - padding}
              y2={height - padding}
              stroke="black"
            />
            <line
              x1={padding}
              y1={padding}
              x2={padding}
              y2={height - padding}
              stroke="black"
            />

            {/* X and Y axis labels */}
            {/* <text
              x={width / 2}
              y={height} // Lowered X-axis label even more
              textAnchor="middle"
              fontSize="14"
            >
              {xAxisLabel}
            </text> */}
            <text
              x={padding - 30} // Shifted Y-axis label left
              y={height / 2}
              textAnchor="middle"
              fontSize="14"
              transform={`rotate(-90, ${padding - 30}, ${height / 2})`}
            >
              {yAxisLabel}
            </text>

            {/* Line chart */}
            <path d={pathData} stroke="lightblue" fill="none" strokeWidth="2" />

            {/* Data points */}
            {data.map((d, i) => (
              <g key={i}>
                <circle
                  cx={scaleX(i)}
                  cy={scaleY(d.value)}
                  r="5"
                  fill="lightgreen"
                  onMouseEnter={() =>
                    handleMouseEnter(
                      `Date: ${d.name}. Value: ${d.value}\nNote: ${d.note}`
                    )
                  } // Set hover text
                  onMouseLeave={handleMouseLeave} // Clear hover text
                />
                {/* Labels for data points */}
                <text
                  x={scaleX(i)}
                  y={scaleY(d.value) - (i === 0 ? 20 : 12)} // Move first label higher
                  textAnchor="middle"
                  fontSize="12"
                >
                  {(data.length < 20 && width < 500) ||
                  (data.length < 40 && width < 1000 && width >= 500) ||
                  width >= 1000
                    ? d.value
                    : null}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            {data.map(
              (d, i) =>
                i % labelsToShow == 0 && (
                  <text
                    key={i}
                    x={scaleX(i)}
                    y={height - padding + 25} // Increased padding for better spacing
                    textAnchor="middle"
                    fontSize="12"
                  >
                    {d.name}
                  </text>
                )
            )}
          </svg>
        </div>
      )}

      <div className={styles.formGroup}>
        {/* <label>Category</label> */}
        <select onChange={handleCategoryChange} className={styles.multiSelect}>
          <option className={styles.tableRow}>Choose a Category</option>
          {dataCategories.map(
            (item) =>
              (item.dataType.inputType === "number" ||
                item.dataType.inputType === "boolean") && (
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
      <div className={styles.formGroup}>
        <label>Entry Count to Graph:</label>
        <input
          type="number"
          min={2}
          max={100}
          onChange={handleCountChange}
          defaultValue={entryCountMax}
        ></input>
      </div>
    </>
  );
}
