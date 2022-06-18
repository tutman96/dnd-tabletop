declare class PresentationConnectionList {
  connections: Array<PresentationConnection>
}

declare class PresentationConnection {
  public binaryType: "arraybuffer";
  public readonly id: string;
  public readonly state: "connecting" | "connected" | "closed" | "terminated";
  public readonly url: string;

  public onclose: () => void;
  public onconnect: () => void;
  public onmessage: (event: { data: string | ArrayBuffer | Array<string | ArrayBuffer> }) => void;
  public onterminated: () => void;

  send(data: string | ArrayBuffer | Array<string | ArrayBuffer>): void;
  close(): void;
  terminate(): void;
}

declare class PresentationAvailability extends EventTarget {
  public value: boolean;
  public onchange: null | (() => void);
}

declare class PresentationRequest {
  constructor(urls: string | Array<string>)
  public onconnectionavailable: () => void;
  start(): Promise<PresentationConnection>;
  reconnect(presentationId: string): Promise<PresentationConnection>;
  getAvailability(presentationUrls?: Array<string>): Promise<PresentationAvailability>;
}

declare class PresentationReceiver {
  public connectionList: Promise<PresentationConnectionList>;
}

declare class Presentation {
  static defaultRequest: PresentationRequest | null;
  static receiver: PresentationReceiver;
}

interface Navigator {
  presentation: {
    receiver: PresentationReceiver | null,
    defaultRequest: PresentationRequest | null,
  }
}