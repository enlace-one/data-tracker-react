import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Authenticator } from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { DataProvider } from "./DataContext"; // Import provider
import PrepareApp from "./PrepareApp.js";

Amplify.configure(outputs);

// Can use ReactNative instead of ReactDOM for mobile devices.
// I add the null assertion (!) since I'm sure it's never null.
const root = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <Authenticator>
      <DataProvider>
        <PrepareApp />
      </DataProvider>
    </Authenticator>
  </React.StrictMode>
);
