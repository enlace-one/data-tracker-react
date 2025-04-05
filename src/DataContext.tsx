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
  fetchDataTypes,
  fetchTopics,
} from "./api";

import {
  UserProfile,
  EnrichedDataCategory,
  DataType,
  ActiveTab,
  Topic,
} from "./types";

interface AlertInfo {
  message: string;
  type: string;
}
type SetActionMessageFunction = (alertInfo: AlertInfo) => void;

interface DataContextType {
  actionMessage: AlertInfo;
  setActionMessage: SetActionMessageFunction;
  userProfiles: UserProfile[];
  dataCategories: EnrichedDataCategory[];
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
    }
    loadProfiles();
  }, []);

  useEffect(() => {
    let unsubscribeCategories: (() => void) | null = null;

    async function loadAndSubscribe() {
      const types = await fetchDataTypes();
      setDataTypes(types);

      const topics = await fetchTopics();
      setTopics(topics);

      // Now subscribe using the loaded types
      unsubscribeCategories = subscribeToDataCategories(
        setDataCategories,
        types,
        topics
      );
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
        dataCategories,
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
