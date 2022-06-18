import { v4 } from 'uuid';
import { Packet, Request, Response } from '../protos/external';

export enum ChannelState {
  CONNECTING, CONNECTED, DISCONNECTING, DISCONNECTED
}

type RequestHandler = (request: Request) => Promise<Partial<Response> | null>

export default abstract class AbstractChannel {
  private _responseListeners = new Map<string, (message: Packet) => void>();

  abstract get state(): ChannelState;

  abstract connect(): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract sendOutgoingPacket(packet: Packet): Promise<void>;
  
  private connectionStateHandlers = new Array<(state: ChannelState) => void>();
  public addConnectionStateChangeHandler(handler: (state: ChannelState) => void) {
    this.connectionStateHandlers.push(handler);
    return () => {
      this.connectionStateHandlers.splice(this.connectionStateHandlers.indexOf(handler), 1)
    };
  }

  protected notifyConnectionStateChange() {
    console.debug('Channel connection state changed to ' + ChannelState[this.state]);
    for (const handler of this.connectionStateHandlers) {
      handler(this.state);
    }
  }

  private requestHandlers = new Array<RequestHandler>(async (req) => {
    if (req.helloRequest) {
      return {
        ackResponse: {}
      }
    }
    return null;
  });
  public addRequestHandler(handler: RequestHandler) {
    this.requestHandlers.push(handler);
    return () => {
      this.requestHandlers.splice(this.requestHandlers.indexOf(handler), 1)
    };
  }

  private async handleRequest(request: Request): Promise<Response> {
    for (const handler of this.requestHandlers) {
      const response = await handler(request);
      if (response === null) continue;
      return Response.fromPartial(response);
    }
    console.warn("Got request that wasn't implemented", request);
    throw new Error('Unimplemented');
  }

  public async request(request: Partial<Request>): Promise<Response> {
    const requestId = v4();

    const responsePromise = new Promise<Packet>((res) => {
      this._responseListeners.set(requestId, res)
    })

    await this.sendOutgoingPacket({
      requestId,
      request: Request.fromPartial(request),
      response: undefined
    })

    const responsePacket = await responsePromise;
    return responsePacket.response!!;
  }

  protected async processIncomingPacket(packet: Packet) {
    if (packet.response && this._responseListeners.has(packet.requestId)) {
      // console.debug(`Received Response (${packet.requestId})`, packet.response)
      this._responseListeners.get(packet.requestId)!(packet);
      this._responseListeners.delete(packet.requestId);
    }
    else if (packet.request) {
      // console.debug(`Received Request (${packet.requestId})`, packet.request)
      const requestId = packet.requestId;
      const response = await this.handleRequest(packet.request);
      await this.sendOutgoingPacket({
        requestId,
        request: undefined,
        response,
      });
    }
  };
}