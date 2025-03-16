import { useState } from "react";
import {
  Button,
  Heading,
  Flex,
  View,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import { useAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { SETTINGS, useData } from "./DataContext"; // Import provider
import Profile from "./views/Profile/Profile";
import Categories from "./views/Categories/Categories";
import Entries from "./views/Entries/Entries";
import Types from "./views/Types/Types";
import Alert from "./components/Alert/Alert";

export default function App() {
  const [activeTab, _setActiveTab] = useState<
    "profile" | "categories" | "entries" | "types"
  >("profile");

  const { signOut } = useAuthenticator((context) => [context.user]);

  const { setSelectedCategory, actionMessage } = useData();

  // Define setActiveTab as a function expression
  const setActiveTab = (
    state: "profile" | "categories" | "entries" | "types"
  ) => {
    _setActiveTab(state);
    setSelectedCategory(null);
  };

  return (
    <Flex
      className="App"
      justifyContent="center"
      alignItems="center"
      direction="column"
      width="70%"
      margin="0 auto"
    >
      <Alert type={actionMessage.type}>{actionMessage.message}</Alert>

      {activeTab === "profile" && <Profile signOut={signOut} />}
      {activeTab === "categories" && <Categories />}
      {activeTab === "entries" && <Entries />}
      {activeTab === "types" && <Types />}

      <Divider />

      <Flex gap="1rem" margin="1rem">
        <Button onClick={() => setActiveTab("profile")}>Profile</Button>
        <Button onClick={() => setActiveTab("categories")}>Categories</Button>
        <Button onClick={() => setActiveTab("entries")}>Entries</Button>
        {SETTINGS.debug && (
          <>
            <Button onClick={() => setActiveTab("types")}>Types</Button>
            <Button onClick={signOut}>Sign Out</Button>
          </>
        )}
      </Flex>
    </Flex>
  );
}
