
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import "./message-handler"; // Initialize message handler for parent communication

  createRoot(document.getElementById("root")!).render(<App />);
  