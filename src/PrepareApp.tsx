import { useEffect, useState } from "react";
import { Flex } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import LoadingSymbol from "./components/LoadingSymbol/LoadingSymbol";
import { initializeDataTypes } from "./api";
import App from "./App";

export default function PrepareApp() {
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Initilaizing Data Types...");

  const loadEverything = async () => {
    await initializeDataTypes();
    setLoadingText("");
    // await initializeTopics();
    setLoading(false);
  };

  useEffect(() => {
    loadEverything();
  }, []);

  if (loading) {
    return (
      <Flex
        className="App"
        justifyContent="center"
        alignItems="center"
        direction="column"
        width="100%"
        margin="0 auto"
        style={{ color: "black", minWidth: "300px" }}
      >
        <LoadingSymbol text={loadingText} />
      </Flex>
    );
  } else {
    return <App />;
  }
}
