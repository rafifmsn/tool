export function loadKaTeX(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("KaTeX can only be loaded in the browser."));
      return;
    }

    if ((window as any).katex) {
      resolve((window as any).katex);
      return;
    }

    // Check if the script is already in the document
    const existingScript = document.querySelector('script[src*="katex"]');
    if (existingScript) {
      const handleLoad = () => resolve((window as any).katex);
      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const jsdelivrCSS = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css";
    const jsdelivrJS = "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js";
    const cdnjsCSS = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.css";
    const cdnjsJS = "https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.16.9/katex.min.js";

    // Inject CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = jsdelivrCSS;
    link.onerror = () => {
      link.href = cdnjsCSS;
    };
    document.head.appendChild(link);

    // Inject JS
    const script = document.createElement("script");
    script.src = jsdelivrJS;
    script.defer = true;
    script.onload = () => {
      resolve((window as any).katex);
    };
    script.onerror = () => {
      // Fallback JS loading
      const fallbackScript = document.createElement("script");
      fallbackScript.src = cdnjsJS;
      fallbackScript.defer = true;
      fallbackScript.onload = () => {
        resolve((window as any).katex);
      };
      fallbackScript.onerror = (err) => reject(err);
      document.body.appendChild(fallbackScript);
    };
    document.body.appendChild(script);
  });
}
