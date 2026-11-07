import Home from "./pages/Home";
import Admin from "./pages/Admin";
import { useEffect, useState } from "react";

function OpeningSequence() {
  const [visible, setVisible] = useState(true);
  const [appMode, setAppMode] = useState(false);

  useEffect(() => {
    setAppMode(window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const timer = window.setTimeout(() => setVisible(false), 2300);
    return () => window.clearTimeout(timer);
  }, []);

  return visible ? (
    <div className="opening-sequence" data-app-mode={appMode ? "installed" : "browser"} aria-hidden="true">
      <div className="opening-orbit opening-orbit-one" />
      <div className="opening-orbit opening-orbit-two" />
      <div className="opening-mark"><span>W</span></div>
      <div className="opening-wordmark">WORLD CONNECTOR</div>
      <div className="opening-caption">A space between worlds</div>
    </div>
  ) : null;
}

// Phase 1: a single route. Admin.tsx (Phase 5) and real routing will be
// added once the spatial experience and admin panel exist.
export default function App() {
  return <>
    {window.location.pathname.startsWith("/admin") ? <Admin /> : <Home />}
    <OpeningSequence />
  </>;
}
