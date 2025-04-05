import { useEffect, useRef, useState } from "react";
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
import { addDefaults } from "./util";
import LoadingSymbol from "./components/LoadingSymbol/LoadingSymbol";
// import LoadingSymbol from "./components/LoadingSymbol/LoadingSymbol";

export default function App() {
  const { authStatus, signOut } = useAuthenticator((context) => [context.user]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Adding default entries...");
  const { dataCategories } = useData();
  const initialized = useRef(false);

  const loadEverything = async () => {
    console.log("Adding defaults with", dataCategories);
    await addDefaults(dataCategories);
    setLoadingText("");
    setLoading(false);
  };

  useEffect(() => {
    if (!initialized.current && dataCategories.length) {
      initialized.current = true;
      loadEverything();
    }
  }, [dataCategories]);

  const { actionMessage, setActionMessage, activeTab, setActiveTab } =
    useData();

  useEffect(() => {
    const handleAuthCheck = async () => {
      if (authStatus === "unauthenticated") {
        await setActionMessage({ message: "timeout", type: "error" });
        signOut();
      }
    };

    handleAuthCheck();
  }, [authStatus]);

  return (
    <Flex
      className="App"
      justifyContent="center"
      alignItems="center"
      direction="column"
      width="70%"
      margin="0 auto"
      style={{ color: "black" }}
    >
      <Alert type={actionMessage.type}>{actionMessage.message}</Alert>

      {loading && <LoadingSymbol text={loadingText} />}
      {!loading && (
        <>
          {activeTab === "profile" && <Profile signOut={signOut} />}
          {activeTab === "categories" && <Categories />}
          {activeTab === "entries" && <Entries />}
          {activeTab === "types" && <Types />}
          {activeTab === "graph" && <Graph />}
          {activeTab === "day" && <Day />}
          {activeTab === "macros" && <Macros />}

          <Divider />

          <Flex gap="1rem" margin="0.5rem 1rem 0 1rem">
            <Button onClick={() => setActiveTab("profile")}>Profile</Button>
            <Button onClick={() => setActiveTab("categories")}>
              Categories
            </Button>
            <Button onClick={() => setActiveTab("entries")}>Entries</Button>
          </Flex>
          <Flex gap="1rem" margin="0 rem 1rem">
            <Button onClick={() => setActiveTab("day")}>Day</Button>
            <Button onClick={() => setActiveTab("graph")}>Graph</Button>
            {SETTINGS.debug && (
              <>
                <Button onClick={() => setActiveTab("types")}>Types</Button>
                <Button onClick={signOut}>Sign Out</Button>
              </>
            )}
          </Flex>
        </>
      )}
    </Flex>
  );
}
