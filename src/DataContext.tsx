import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  fetchUserProfiles,
  subscribeToDataCategories,
  // fetchTopics,
} from "./api";

import {
  UserProfile,
  EnrichedDataCategory,
  DataType,
  ActiveTab,
  Topic,
} from "./types";
import { DEFAULT_DATA_TYPES, DEFAULT_TOPICS } from "./settings";

interface AlertInfo {
  message: string;
  type: string;
}
type SetActionMessageFunction = (alertInfo: AlertInfo) => void;

interface DataContextType {
  actionMessage: AlertInfo;
  setActionMessage: SetActionMessageFunction;
  userProfiles: UserProfile[];
  setUserProfiles: React.Dispatch<React.SetStateAction<UserProfile[]>>;
  dataCategories: EnrichedDataCategory[];
  setDataCategories: React.Dispatch<
    React.SetStateAction<EnrichedDataCategory[]>
  >;
  dataTypes: DataType[];
  topics: Topic[];
  SETTINGS: { debug: boolean };
  selectedCategory: EnrichedDataCategory | null;
  setSelectedCategory: React.Dispatch<
    React.SetStateAction<EnrichedDataCategory | null>
  >;
  screenWidth: number;
  activeTab: ActiveTab;
  setActiveTab: (state: ActiveTab) => void;
  fetchedCats: boolean;
  definatelyFetchedCats: boolean;
  setFetchedCats: (state: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

const urlParams = new URLSearchParams(window.location.search);
const isDebugMode = urlParams.get("debug") === "true";
const SETTINGS = { debug: isDebugMode };

export function DataProvider({ children }: DataProviderProps) {
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [dataCategories, setDataCategories] = useState<EnrichedDataCategory[]>(
    []
  );
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [fetchedCats, setFetchedCats] = useState<boolean>(false);
  const [definatelyFetchedCats, setDefinatelyFetchedCats] =
    useState<boolean>(false);
  const [actionMessage, _setActionMessage] = useState<AlertInfo>({
    message: "",
    type: "",
  });
  const [selectedCategory, setSelectedCategory] =
    useState<EnrichedDataCategory | null>(null);
  const [activeTab, _setActiveTab] = useState<ActiveTab>("day");
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  const setActiveTab = (state: ActiveTab) => {
    _setActiveTab(state);
    setSelectedCategory(null);
  };

  // This is a dupe since I manually set data types below
  // useEffect(() => {
  //   const sub = client.models.DataType.observeQuery().subscribe({
  //     next: ({ items }) => setDataTypes([...items]),
  //   });
  //   return () => sub.unsubscribe();
  // }, []);

  const setActionMessage = (alertInfo: AlertInfo) => {
    _setActionMessage(alertInfo);
    setTimeout(() => _setActionMessage({ message: "", type: "" }), 10000);
  };

  useEffect(() => {
    async function loadProfiles() {
      const profiles = await fetchUserProfiles();
      setUserProfiles(profiles);
      const topicColorPreference = profiles[0].topicColorPreference ?? "none";

      const sortedTopics = DEFAULT_TOPICS.sort((a, b) => {
        if (topicColorPreference == "none") {
          return a.name.localeCompare(b.name);
        }
        const aIsColorful = a.name.toLowerCase().includes(topicColorPreference);
        const bIsColorful = b.name.toLowerCase().includes(topicColorPreference);

        if (aIsColorful && !bIsColorful) return -1;
        if (!aIsColorful && bIsColorful) return 1;
        return a.name.localeCompare(b.name);
      });

      // Put colorful ones first (they contain colorful) but otherwise alphabetic
      setTopics(sortedTopics);
    }
    loadProfiles();
  }, []);

  useEffect(() => {
    let unsubscribeCategories: (() => void) | null = null;

    async function loadAndSubscribe() {
      const types = DEFAULT_DATA_TYPES;
      setDataTypes(types);

      const topics = DEFAULT_TOPICS;
      setTopics(topics);

      // Now subscribe using the loaded types
      unsubscribeCategories = subscribeToDataCategories(
        setDataCategories,
        types,
        topics
      );

      setTimeout(() => {
        setFetchedCats(true);
      }, 1000);

      setTimeout(() => {
        setDefinatelyFetchedCats(true);
      }, 3000);
    }

    loadAndSubscribe();

    return () => {
      if (unsubscribeCategories) unsubscribeCategories();
    };
  }, []);

  useEffect(() => {
    window.addEventListener("resize", () => setScreenWidth(window.innerWidth));
    return () =>
      window.removeEventListener("resize", () =>
        setScreenWidth(window.innerWidth)
      );
  }, []);

  return (
    <DataContext.Provider
      value={{
        userProfiles,
        setUserProfiles,
        dataCategories,
        setDataCategories,
        actionMessage,
        setActionMessage,
        dataTypes,
        topics,
        SETTINGS,
        selectedCategory,
        setSelectedCategory,
        screenWidth,
        activeTab,
        setActiveTab,
        fetchedCats,
        definatelyFetchedCats,
        setFetchedCats,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}

export { SETTINGS };
