///<reference path="./presentationApi.d.ts"/>

import { Packet } from "../protos/external";
import AbstractChannel, { ChannelState } from "./abstractChannel";

export default class PresentationApiChannel extends AbstractChannel {
  private _presentationConnection: PresentationConnection | null = null;
  private _connected = false;

  get state(): ChannelState {
    if (!this._presentationConnection) {
      return ChannelState.DISCONNECTED;
    }

    if (this._connected) {
      return ChannelState.CONNECTED;
    }

    if (this._presentationConnection.state === "connecting" || this._presentationConnection.state === "connected") {
      if (this._connected) return ChannelState.CONNECTED;
      else return ChannelState.CONNECTING;
    }
    else {
      return ChannelState.DISCONNECTED;
    }
  }

  async connect() {
    this.notifyConnectionStateChange();
    await this.disconnect();
    if (navigator.presentation.receiver) {
      const { connections } = await navigator.presentation.receiver.connectionList;
      if (connections.length) {
        this._presentationConnection = connections[0]!;
      }
      else {
        window.close();
        throw new Error('There was a presentation.receiver without any connections');
      }
    }
    else {
      const request = new PresentationRequest(window.location.pathname + '#/table/presentation');
      const availability = await request.getAvailability();
      if (!availability.value) {
        await Promise.race([
          new Promise<void>((res) => {
            availability.onchange = () => {
              if (availability.value) {
                res()
                availability.onchange = null;
              }
            }
          }),
          new Promise((_res, rej) => setTimeout(() => rej('Could not get Presentation Request availability'), 5000))
        ])
      }

      this._presentationConnection = await request.start();
    }

    this._presentationConnection.onconnect = () => {
      // console.log('onconnect', this._presentationConnection?.state)
      this.notifyConnectionStateChange()
    };
    this._presentationConnection.onclose = () => {
      // console.log('onclose', this._presentationConnection?.state)
      this.notifyConnectionStateChange();
    }
    this._presentationConnection.onterminated = () => {
      // console.log('onterminated', this._presentationConnection?.state)
      this.notifyConnectionStateChange()
    };
    this.notifyConnectionStateChange();

    this._presentationConnection.onmessage = async (event) => {
      if (!(event.data instanceof ArrayBuffer)) {
        console.warn("Got a message that wasn't a ArrayBuffer", event);
        return;
      }
      if (!this._connected) {
        this._connected = true;
        this.notifyConnectionStateChange();
      }
      const packet = Packet.decode(new Uint8Array(event.data));
      await this.processIncomingPacket(packet);
    }

    this.request({ helloRequest: {} })

    window.addEventListener('beforeunload', () => {
      this.disconnect();
    })
  }

  async disconnect() {
    if (!this._presentationConnection) return;
    this._connected = false;
    this._presentationConnection.terminate();
    this._presentationConnection.close();
    this.notifyConnectionStateChange();
  }

  async sendOutgoingPacket(packet: Packet) {
    if (!this._presentationConnection) {
      throw new Error('Not connected');
    };
    const encodedPacket = Packet.encode(packet).finish();
    const buffer = encodedPacket.buffer.slice(encodedPacket.byteOffset, encodedPacket.byteOffset + encodedPacket.byteLength)
    this._presentationConnection.send(buffer)
  }
}
