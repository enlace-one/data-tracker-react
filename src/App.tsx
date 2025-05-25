import { useEffect, useRef, useState } from "react";
import { Button, Flex } from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { SETTINGS, useData } from "./DataContext";
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
import { addExampleData } from "./api";
import Popup from "./components/Popup/Popup";
import TextGraph from "./views/TextGraph/TextGraph";
import HeatMapGraph from "./views/HeatMapGraph/HeatMapGraph";
import Calendar from "./views/Calendar/Calendar";
import { UI_IMAGE_PATH } from "./settings.tsx";
import { signOut } from "aws-amplify/auth";
import { ActiveTab } from "./types.tsx";

export default function App() {
  const { authStatus } = useAuthenticator((context) => [context.user]);
  const [loading, setLoading] = useState(true);
  const [addExamplePrompt, setAddExamplePrompt] = useState(false);
  const [loadingText, setLoadingText] = useState("Adding default entries...");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreButtonRef = useRef<HTMLButtonElement>(null); // Ref for More button
  const {
    dataCategories,
    fetchedCats,
    definatelyFetchedCats,
    selectedCategory,
  } = useData();
  const initialized = useRef(false);

  const loadEverything = async () => {
    console.log("Adding defaults with", dataCategories);
    await addDefaults(dataCategories);
    setLoadingText("Setting last entry dates");
    await setLastEntryDates(dataCategories);
    setLoading(false);
  };

  const handleAddExampleData = async () => {
    setAddExamplePrompt(false);
    setLoadingText("Adding Example data...");
    setLoading(true);
    await addExampleData(true);
    setLoading(false);
  };

  useEffect(() => {
    console.log("Initialized.current:", initialized);
    if (!initialized.current && fetchedCats) {
      initialized.current = true;
      loadEverything();
    } else if (dataCategories && fetchedCats) {
      setLoading(false);
    }
    console.log(fetchedCats, dataCategories.length);
    if (definatelyFetchedCats && dataCategories.length === 0) {
      console.log("Adding example prompt");
      setAddExamplePrompt(true);
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

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeTab, selectedCategory]);

  const toggleMoreMenu = () => {
    setIsMoreOpen((prev) => !prev);
  };

  const handleMenuOptionClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMoreOpen(false);
  };

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
        paddingBottom: "6rem",
      }}
    >
      {actionMessage.message !== "" && (
        <Alert setActionMessage={setActionMessage} type={actionMessage.type}>
          {actionMessage.message}
        </Alert>
      )}

      {loading && <LoadingSymbol text={loadingText} />}
      {addExamplePrompt && (
        <Popup>
          <h2>Add example data?</h2>
          <p>
            Would you like to automatically add a few example data categories
            and data entries so you can see how the app works?
          </p>
          <Button onClick={handleAddExampleData}>Add</Button>
        </Popup>
      )}
      {!loading && (
        <>
          {activeTab === "profile" && <Profile signOut={signOut} />}
          {activeTab === "categories" && <Categories />}
          {activeTab === "entries" && <Entries />}
          {activeTab === "graph" && <Graph />}
          {activeTab === "day" && <Day />}
          {activeTab === "macros" && <Macros />}
          {activeTab === "date-graph" && <DateGraph />}
          {activeTab === "text-graph" && <TextGraph />}
          {activeTab === "heat-map-graph" && <HeatMapGraph />}
          {activeTab === "calendar" && <Calendar />}
        </>
      )}

      <div
        style={{
          position: "fixed",
          bottom: "0px",
          left: "0px",
          right: "0px",
          margin: "0px",
          backgroundColor: "rgb(255, 255, 255)",
          padding: "0.5rem 1rem",
          borderTop: "1px solid rgb(204, 204, 204)",
          boxShadow: "rgba(0, 0, 0, 0.1) 0px -2px 4px",
          zIndex: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Flex
          justifyContent="center"
          gap=".5rem"
          style={{
            flexWrap: "wrap",
            position: "relative",
          }}
        >
          <Button
            style={{ border: "none" }}
            onClick={() => setActiveTab("profile")}
          >
            <HoverText onHoverText="Profile">
              <img
                src={UI_IMAGE_PATH + "profile-view.svg"}
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
                src={UI_IMAGE_PATH + "category-view.svg"}
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
                src={UI_IMAGE_PATH + "entries-view.svg"}
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
                src={UI_IMAGE_PATH + "day-view.svg"}
                alt="Day View"
                style={{ width: "1.5rem", height: "1.5rem" }}
              />
            </HoverText>
          </Button>
          <Button
            style={{ border: "none" }}
            onClick={toggleMoreMenu}
            ref={moreButtonRef}
          >
            <HoverText onHoverText="More">
              <img
                src={UI_IMAGE_PATH + "more-icon.svg"}
                alt="More"
                style={{ width: "1.5rem", height: "1.5rem" }}
              />
            </HoverText>
          </Button>
          {isMoreOpen && (
            <Flex
              direction="column"
              gap=".5rem"
              style={{
                position: "fixed",
                left: moreButtonRef.current ? moreButtonRef.current.getBoundingClientRect().left : 0,
                bottom: moreButtonRef.current ? window.innerHeight - moreButtonRef.current.getBoundingClientRect().top + 4 : 0,
                backgroundColor: "rgb(255, 255, 255)",
                padding: "0.5rem",
                border: "1px solid rgb(204, 204, 204)",
                boxShadow: "rgba(0, 0, 0, 0.1) 0px 2px 4px",
                zIndex: 1001,
                width: "80px",
              }}
            >
              <Button
                style={{ border: "none" }}
                onClick={() => handleMenuOptionClick("date-graph")}
              >
                <HoverText onHoverText="Graph">
                  <img
                    src={UI_IMAGE_PATH + "graph-view.svg"}
                    alt="Graph View"
                    style={{ width: "1.5rem", height: "1.5rem" }}
                  />
                </HoverText>
              </Button>
              <Button
                style={{ border: "none" }}
                onClick={() => handleMenuOptionClick("calendar")}
              >
                <HoverText onHoverText="Calendar">
                  <img
                    src={UI_IMAGE_PATH + "calendar-view.svg"}
                    alt="Calendar View"
                    style={{ width: "1.5rem", height: "1.5rem" }}
                  />
                </HoverText>
              </Button>
            </Flex>
          )}
          {SETTINGS.debug && (
            <>
              <Button
                style={{ border: "none" }}
                onClick={() => setActiveTab("types")}
              >
                Types
              </Button>
              <Button style={{ border: "none" }} onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          )}
        </Flex>
      </div>
    </Flex>
  );
}