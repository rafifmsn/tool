export function loadDiffEngine(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Diff engine can only be loaded in the browser."));
      return;
    }
    if ((window as any).Diff) {
      resolve((window as any).Diff);
      return;
    }

    const jsdelivrJS = "https://cdn.jsdelivr.net/npm/diff@5.2.0/dist/diff.min.js";
    const unpkgJS = "https://unpkg.com/diff@5.2.0/dist/diff.min.js";

    const script = document.createElement("script");
    script.src = jsdelivrJS;
    script.defer = true;
    script.onload = () => resolve((window as any).Diff);
    script.onerror = () => {
      const fallbackScript = document.createElement("script");
      fallbackScript.src = unpkgJS;
      fallbackScript.defer = true;
      fallbackScript.onload = () => resolve((window as any).Diff);
      fallbackScript.onerror = (err) => reject(err);
      document.body.appendChild(fallbackScript);
    };
    document.body.appendChild(script);
  });
}
