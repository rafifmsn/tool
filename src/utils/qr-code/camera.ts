import { loadJSQR } from "./loader";
import { decodeQRCode } from "./decoder";

export class CameraScanner {
  private video: HTMLVideoElement;
  private canvas: HTMLCanvasElement;
  private stream: MediaStream | null = null;
  private animFrameId: number | null = null;
  private jsQR: any = null;

  constructor(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    this.video = video;
    this.canvas = canvas;
  }

  async start(
    onResult: (text: string) => void,
    onError: (err: any) => void,
  ): Promise<void> {
    try {
      if (!this.jsQR) {
        this.jsQR = await loadJSQR();
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      this.video.srcObject = this.stream;
      this.video.setAttribute("playsinline", "true");
      await this.video.play();

      const tick = () => {
        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
          const ctx = this.canvas.getContext("2d")!;
          this.canvas.width = this.video.videoWidth;
          this.canvas.height = this.video.videoHeight;
          ctx.drawImage(
            this.video,
            0,
            0,
            this.canvas.width,
            this.canvas.height,
          );

          const imgData = ctx.getImageData(
            0,
            0,
            this.canvas.width,
            this.canvas.height,
          );
          const code = decodeQRCode(this.jsQR, imgData);

          if (code && code.data) {
            onResult(code.data);
            this.stop();
            return;
          }
        }
        this.animFrameId = requestAnimationFrame(tick);
      };

      this.animFrameId = requestAnimationFrame(tick);
    } catch (err) {
      this.stop();
      onError(err);
    }
  }

  stop(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    this.video.srcObject = null;
  }

  isActive(): boolean {
    return this.stream !== null;
  }
}
