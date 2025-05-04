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
    <Authenticator
      components={{
        Header() {
          return (
            <div style={{ textAlign: "center", padding: "1rem" }}>
              <img
                src="https://raw.githubusercontent.com/A-Management/common_static/main/app_icons/dataTracker.svg"
                alt="Data Tracker Logo"
                style={{ maxWidth: "60px" }}
              />
              <h2 style={{ marginTop: "1rem", color: "black" }}>
                Welcome to Data Tracker
              </h2>
            </div>
          );
        },
      }}
    >
      <DataProvider>
        <PrepareApp />
      </DataProvider>
    </Authenticator>
  </React.StrictMode>
);
