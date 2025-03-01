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
import { DataProvider } from "./DataContext"; // Import provider
import Profile from "./views/Profile/Profile";
import Categories from "./views/Categories/Categories";
import Entries from "./views/Entries/Entries";

export default function App() {
  const [activeTab, setActiveTab] = useState<
    "profile" | "categories" | "entries"
  >("profile");
  const { signOut } = useAuthenticator((context) => [context.user]);

  return (
    <DataProvider>
      <Flex
        className="App"
        justifyContent="center"
        alignItems="center"
        direction="column"
        width="70%"
        margin="0 auto"
      >
        {activeTab === "profile" && <Profile signOut={signOut} />}
        {activeTab === "categories" && <Categories />}
        {activeTab === "entries" && <Entries />}

        <Divider />

        <Flex gap="1rem" margin="1rem">
          <Button onClick={() => setActiveTab("profile")}>Profile</Button>
          <Button onClick={() => setActiveTab("categories")}>Categories</Button>
          <Button onClick={() => setActiveTab("entries")}>Entries</Button>
        </Flex>
      </Flex>
    </DataProvider>
  );
}
