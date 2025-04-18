import { useEffect, useRef, useState } from "react";
import { Button, Flex } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { SETTINGS, useData } from "./DataContext"; // Import provider
import Profile from "./views/Profile/Profile";
import Categories from "./views/Categories/Categories";
import Entries from "./views/Entries/Entries";
import Alert from "./components/Alert/Alert";
import Graph from "./views/Graph/Graph";
import Day from "./views/Day/Day";
import Macros from "./views/Macros/Macros";
import { addDefaults, setLastEntryDates } from "./util";
import LoadingSymbol from "./components/LoadingSymbol/LoadingSymbol";
import HoverText from "./components/HoverText/HoverText";
import DateGraph from "./views/DateGraph/DateGraph";
// import LoadingSymbol from "./components/LoadingSymbol/LoadingSymbol";

export default function App() {
  const { authStatus, signOut } = useAuthenticator((context) => [context.user]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState("Adding default entries...");
  const { dataCategories, setInitialized, fetchedCats } = useData();
  const initialized = useRef(false);

  const loadEverything = async () => {
    console.log("Adding defaults with", dataCategories);
    await addDefaults(dataCategories);
    setLoadingText("Setting last entry dates");
    await setLastEntryDates(dataCategories);
    setInitialized(true);
    setLoading(false);
  };

  useEffect(() => {
    // This used to be dataCategories.length but that don't owrk if you got no categories!
    // So I added the second condition.
    if (!initialized.current && dataCategories.length) {
      initialized.current = true;
      loadEverything();
    } else if (dataCategories) {
      setLoading(false);
    }
  }, [fetchedCats]);

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
      style={{
        color: "black",
        paddingBottom: "6rem", // Matches HTML's padding-block-end
      }}
    >
      {/* Main Content */}
      <Alert type={actionMessage.type}>{actionMessage.message}</Alert>

      {loading && <LoadingSymbol text={loadingText} />}
      {!loading && (
        <>
          {activeTab === "profile" && <Profile signOut={signOut} />}
          {activeTab === "categories" && <Categories />}
          {activeTab === "entries" && <Entries />}
          {activeTab === "graph" && <Graph />}
          {activeTab === "day" && <Day />}
          {activeTab === "macros" && <Macros />}
          {activeTab === "date-graph" && <DateGraph />}
          {/* <Divider /> */}
        </>
      )}
      {/* Div to give space in case bottom menu covers anything */}
      <div style={{ padding: "50px" }}> </div>

      {/* Fixed Bottom Menu */}
      <div
        style={{
          position: "fixed",
          bottom: "0px",
          left: "0px",
          right: "0px", // Added to span full width like HTML
          margin: "0px",
          backgroundColor: "rgb(255, 255, 255)",
          padding: "0.5rem 1rem",
          borderTop: "1px solid rgb(204, 204, 204)",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px -2px 4px",
          zIndex: 1000,
          display: "flex", // Use display flex to match Flex behavior
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Flex
          justifyContent="center"
          gap=".5rem"
          // width="70%" // Constrain buttons to match content width
          style={{
            flexWrap: "wrap", // Moved to style prop
          }}
        >
          <Button
            style={{ border: "none" }}
            onClick={() => setActiveTab("profile")}
          >
            <HoverText onHoverText="Profile">
              <img
                src="/profile-view.svg"
                alt="Profile View"
                style={{ width: "1.5rem", height: "1.5rem" }}
              />
            </HoverText>
          </Button>
          <Button
            style={{ border: "none" }}
            onClick={() => setActiveTab("categories")}
          >
            <HoverText onHoverText="Categories">
              <img
                src="/category-view.svg"
                alt="Categories"
                style={{ width: "1.5rem", height: "1.5rem" }}
              />
            </HoverText>
          </Button>
          <Button
            style={{ border: "none" }}
            onClick={() => setActiveTab("entries")}
          >
            <HoverText onHoverText="Entries">
              <img
                src="/entries-view.svg"
                alt="Entries"
                style={{ width: "1.5rem", height: "1.5rem" }}
              />
            </HoverText>
          </Button>
          <Button
            style={{ border: "none" }}
            onClick={() => setActiveTab("day")}
          >
            <HoverText onHoverText="Day View">
              <img
                src="/day-view.svg"
                alt="Day View"
                style={{ width: "1.5rem", height: "1.5rem" }}
              />
            </HoverText>
          </Button>
          <Button
            style={{ border: "none" }}
            onClick={() => setActiveTab("date-graph")}
          >
            <HoverText onHoverText="Graph">
              <img
                src="/graph-view.svg"
                alt="Graph View"
                style={{ width: "1.5rem", height: "1.5rem" }}
              />
            </HoverText>
          </Button>
          {SETTINGS.debug && (
            <>
              <Button
                style={{ border: "none" }}
                onClick={() => setActiveTab("types")}
              >
                Types
              </Button>
              <Button style={{ border: "none" }} onClick={signOut}>
                Sign Out
              </Button>
            </>
          )}
        </Flex>
      </div>
    </Flex>
  );
}
