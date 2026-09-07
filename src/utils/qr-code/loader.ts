export function loadQRCodeGenerator(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("QRCode generator can only be loaded in the browser."));
      return;
    }
    if ((window as any).QRCode) {
      resolve((window as any).QRCode);
      return;
    }

    const cdnjsJS = "https://cdnjs.cloudflare.com/ajax/libs/qrcode/1.5.1/qrcode.min.js";
    const jsdelivrJS = "https://cdn.jsdelivr.net/npm/qrcode@1.5.1/lib/browser.min.js";
    const unpkgJS = "https://unpkg.com/qrcode@1.5.1/lib/browser.min.js";

    const script = document.createElement("script");
    script.src = cdnjsJS;
    script.defer = true;
    script.onload = () => resolve((window as any).QRCode);
    script.onerror = () => {
      const fallbackScript = document.createElement("script");
      fallbackScript.src = jsdelivrJS;
      fallbackScript.defer = true;
      fallbackScript.onload = () => resolve((window as any).QRCode);
      fallbackScript.onerror = () => {
        const fallbackScript2 = document.createElement("script");
        fallbackScript2.src = unpkgJS;
        fallbackScript2.defer = true;
        fallbackScript2.onload = () => resolve((window as any).QRCode);
        fallbackScript2.onerror = (err) => reject(err);
        document.body.appendChild(fallbackScript2);
      };
      document.body.appendChild(fallbackScript);
    };
    document.body.appendChild(script);
  });
}

export function loadJSQR(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("jsQR can only be loaded in the browser."));
      return;
    }
    if ((window as any).jsQR) {
      resolve((window as any).jsQR);
      return;
    }

    const jsdelivrJS = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js";
    const unpkgJS = "https://unpkg.com/jsqr@1.4.0/dist/jsQR.min.js";

    const script = document.createElement("script");
    script.src = jsdelivrJS;
    script.defer = true;
    script.onload = () => resolve((window as any).jsQR);
    script.onerror = () => {
      const fallbackScript = document.createElement("script");
      fallbackScript.src = unpkgJS;
      fallbackScript.defer = true;
      fallbackScript.onload = () => resolve((window as any).jsQR);
      fallbackScript.onerror = (err) => reject(err);
      document.body.appendChild(fallbackScript);
    };
    document.body.appendChild(script);
  });
}
