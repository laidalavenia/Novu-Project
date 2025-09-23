import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
// import { Novu } from "@novu/api";

// const novu = new Novu({
//   secretKey: process.env["NOVU_SECRET_KEY"],
// });

// novu.trigger({
//   workflowId: "onboarding-demo-workflow",
//   to: "subscriber-id",
//   payload: {},
// });

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
