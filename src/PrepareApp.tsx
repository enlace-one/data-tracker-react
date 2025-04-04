import { useEffect, useState } from "react";
import { Button, Flex, Divider } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { SETTINGS, useData } from "./DataContext"; // Import provider
import Profile from "./views/Profile/Profile";
import Categories from "./views/Categories/Categories";
import Entries from "./views/Entries/Entries";
import Types from "./views/Types/Types";
import Alert from "./components/Alert/Alert";
import Graph from "./views/Graph/Graph";
import Day from "./views/Day/Day";
import Macros from "./views/Macros/Macros";
import LoadingSymbol from "./components/LoadingSymbol/LoadingSymbol";
import { initializeDataTypes } from "./api";
import App from "./App";

export default function PrepareApp() {
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Initilaizing Data Types...");

  const loadEverything = async () => {
    await initializeDataTypes();
    setLoadingText("Adding Defaults...");
    // TODO
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
