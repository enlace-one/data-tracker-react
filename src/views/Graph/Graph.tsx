// import { useState } from "react";
import { Heading, Divider, Button } from "@aws-amplify/ui-react";
import { useData } from "../../DataContext";
import { createDataCategory } from "../../api";
import CategoryDetail from "../CategoryDetail/CategoryDetail";
import { FormDataType } from "../../types";
import styles from "./Graph.module.css";
import { useState, useEffect } from "react";
import LoadingSymbol from "../../components/LoadingSymbol/LoadingSymbol";

export default function Graph() {
  const {
    dataCategories,
    dataTypes,
    selectedCategory,
    setSelectedCategory,
    setActionMessage,
  } = useData();
  // const [selectedCategory, setSelectedCategory] = useState<DataCategory | null>(
  //   null
  // );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dataCategories) {
      setLoading(false);
    }
  }, [dataCategories]);

  return (
    <>
      <Heading level={1}>Graph</Heading>
      <Divider />
      {loading && <LoadingSymbol size={50} />}
      {!loading && <div>GRAPH HERE</div>}

      <select multiple>
        {dataCategories.map((item) => (
          <option className={styles.tableRow} key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
    </>
  );
}
