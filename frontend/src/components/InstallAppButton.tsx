import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallAppButton() {
  const [promptEvent, setPromptEvent] = useState<InstallPromptEvent | null>(null);
  const [iosHelp, setIosHelp] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)");
    const updateInstalled = () => setIsInstalled(standalone.matches || (navigator as Navigator & { standalone?: boolean }).standalone === true);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as InstallPromptEvent);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setPromptEvent(null);
    };

    updateInstalled();
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    standalone.addEventListener("change", updateInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      standalone.removeEventListener("change", updateInstalled);
    };
  }, []);

  if (isInstalled) return null;
  const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as Window & { MSStream?: unknown }).MSStream;
  if (!promptEvent && !isIos) return null;

  async function install() {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const choice = await promptEvent.userChoice;
    if (choice.outcome === "accepted") setPromptEvent(null);
  }

  return <>
    <button className="install-app-button" onClick={promptEvent ? install : () => setIosHelp(true)} aria-label="Install World Connector">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v11m0 0 4-4m-4 4-4-4M5 15v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" /></svg>
      <span>Install</span>
    </button>
    {iosHelp && <div className="install-dialog-backdrop" onClick={() => setIosHelp(false)} role="presentation">
      <section className="install-dialog" role="dialog" aria-modal="true" aria-labelledby="install-title" onClick={(event) => event.stopPropagation()}>
        <button className="install-dialog-close" onClick={() => setIosHelp(false)} aria-label="Close">×</button>
        <img src="/world-connector.svg" alt="" />
        <p className="eyebrow">TAKE YOUR WORLDS WITH YOU</p>
        <h2 id="install-title">Add to Home Screen</h2>
        <p>In Safari, tap <span className="share-glyph">↑</span> Share, then choose <strong>Add to Home Screen</strong>.</p>
      </section>
    </div>}
  </>;
}
