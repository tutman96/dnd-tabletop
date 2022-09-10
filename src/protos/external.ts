/* eslint-disable */
import Long from "long";
import * as _m0 from "protobufjs/minimal";
import { Scene } from "./scene";

export const protobufPackage = "";

export interface Packet {
  requestId: string;
  request: Request | undefined;
  response: Response | undefined;
}

export interface Request {
  /** Respond with AckResponse */
  helloRequest: HelloRequest | undefined;
  /** Respond with AckResponse */
  displaySceneRequest: DisplaySceneRequest | undefined;
  /** Respond with GetAssetResponse */
  getAssetRequest: GetAssetRequest | undefined;
  /** Respond with GetTableConfigurationResponse */
  getTableConfigurationRequest: GetTableConfigurationRequest | undefined;
}

export interface Response {
  ackResponse: AckResponse | undefined;
  getAssetResponse: GetAssetResponse | undefined;
  getTableConfigurationResponse: GetTableConfigurationResponse | undefined;
}

export interface HelloRequest {}

export interface AckResponse {}

export interface DisplaySceneRequest {
  scene: Scene | undefined;
}

export interface GetAssetRequest {
  id: string;
}

export interface GetAssetResponse {
  id: string;
  payload: Uint8Array;
}

export interface GetTableConfigurationRequest {}

export interface GetTableConfigurationResponse {
  resolution: GetTableConfigurationResponse_Resolution | undefined;
  size: number;
  playAudioOnTable: boolean;
}

export interface GetTableConfigurationResponse_Resolution {
  width: number;
  height: number;
}

function createBasePacket(): Packet {
  return { requestId: "", request: undefined, response: undefined };
}

export const Packet = {
  encode(
    message: Packet,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.requestId !== "") {
      writer.uint32(10).string(message.requestId);
    }
    if (message.request !== undefined) {
      Request.encode(message.request, writer.uint32(82).fork()).ldelim();
    }
    if (message.response !== undefined) {
      Response.encode(message.response, writer.uint32(90).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Packet {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBasePacket();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.requestId = reader.string();
          break;
        case 10:
          message.request = Request.decode(reader, reader.uint32());
          break;
        case 11:
          message.response = Response.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Packet {
    return {
      requestId: isSet(object.requestId) ? String(object.requestId) : "",
      request: isSet(object.request)
        ? Request.fromJSON(object.request)
        : undefined,
      response: isSet(object.response)
        ? Response.fromJSON(object.response)
        : undefined,
    };
  },

  toJSON(message: Packet): unknown {
    const obj: any = {};
    message.requestId !== undefined && (obj.requestId = message.requestId);
    message.request !== undefined &&
      (obj.request = message.request
        ? Request.toJSON(message.request)
        : undefined);
    message.response !== undefined &&
      (obj.response = message.response
        ? Response.toJSON(message.response)
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Packet>, I>>(object: I): Packet {
    const message = createBasePacket();
    message.requestId = object.requestId ?? "";
    message.request =
      object.request !== undefined && object.request !== null
        ? Request.fromPartial(object.request)
        : undefined;
    message.response =
      object.response !== undefined && object.response !== null
        ? Response.fromPartial(object.response)
        : undefined;
    return message;
  },
};

function createBaseRequest(): Request {
  return {
    helloRequest: undefined,
    displaySceneRequest: undefined,
    getAssetRequest: undefined,
    getTableConfigurationRequest: undefined,
  };
}

export const Request = {
  encode(
    message: Request,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.helloRequest !== undefined) {
      HelloRequest.encode(
        message.helloRequest,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.displaySceneRequest !== undefined) {
      DisplaySceneRequest.encode(
        message.displaySceneRequest,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.getAssetRequest !== undefined) {
      GetAssetRequest.encode(
        message.getAssetRequest,
        writer.uint32(26).fork()
      ).ldelim();
    }
    if (message.getTableConfigurationRequest !== undefined) {
      GetTableConfigurationRequest.encode(
        message.getTableConfigurationRequest,
        writer.uint32(34).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Request {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.helloRequest = HelloRequest.decode(reader, reader.uint32());
          break;
        case 2:
          message.displaySceneRequest = DisplaySceneRequest.decode(
            reader,
            reader.uint32()
          );
          break;
        case 3:
          message.getAssetRequest = GetAssetRequest.decode(
            reader,
            reader.uint32()
          );
          break;
        case 4:
          message.getTableConfigurationRequest =
            GetTableConfigurationRequest.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Request {
    return {
      helloRequest: isSet(object.helloRequest)
        ? HelloRequest.fromJSON(object.helloRequest)
        : undefined,
      displaySceneRequest: isSet(object.displaySceneRequest)
        ? DisplaySceneRequest.fromJSON(object.displaySceneRequest)
        : undefined,
      getAssetRequest: isSet(object.getAssetRequest)
        ? GetAssetRequest.fromJSON(object.getAssetRequest)
        : undefined,
      getTableConfigurationRequest: isSet(object.getTableConfigurationRequest)
        ? GetTableConfigurationRequest.fromJSON(
            object.getTableConfigurationRequest
          )
        : undefined,
    };
  },

  toJSON(message: Request): unknown {
    const obj: any = {};
    message.helloRequest !== undefined &&
      (obj.helloRequest = message.helloRequest
        ? HelloRequest.toJSON(message.helloRequest)
        : undefined);
    message.displaySceneRequest !== undefined &&
      (obj.displaySceneRequest = message.displaySceneRequest
        ? DisplaySceneRequest.toJSON(message.displaySceneRequest)
        : undefined);
    message.getAssetRequest !== undefined &&
      (obj.getAssetRequest = message.getAssetRequest
        ? GetAssetRequest.toJSON(message.getAssetRequest)
        : undefined);
    message.getTableConfigurationRequest !== undefined &&
      (obj.getTableConfigurationRequest = message.getTableConfigurationRequest
        ? GetTableConfigurationRequest.toJSON(
            message.getTableConfigurationRequest
          )
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Request>, I>>(object: I): Request {
    const message = createBaseRequest();
    message.helloRequest =
      object.helloRequest !== undefined && object.helloRequest !== null
        ? HelloRequest.fromPartial(object.helloRequest)
        : undefined;
    message.displaySceneRequest =
      object.displaySceneRequest !== undefined &&
      object.displaySceneRequest !== null
        ? DisplaySceneRequest.fromPartial(object.displaySceneRequest)
        : undefined;
    message.getAssetRequest =
      object.getAssetRequest !== undefined && object.getAssetRequest !== null
        ? GetAssetRequest.fromPartial(object.getAssetRequest)
        : undefined;
    message.getTableConfigurationRequest =
      object.getTableConfigurationRequest !== undefined &&
      object.getTableConfigurationRequest !== null
        ? GetTableConfigurationRequest.fromPartial(
            object.getTableConfigurationRequest
          )
        : undefined;
    return message;
  },
};

function createBaseResponse(): Response {
  return {
    ackResponse: undefined,
    getAssetResponse: undefined,
    getTableConfigurationResponse: undefined,
  };
}

export const Response = {
  encode(
    message: Response,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.ackResponse !== undefined) {
      AckResponse.encode(
        message.ackResponse,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.getAssetResponse !== undefined) {
      GetAssetResponse.encode(
        message.getAssetResponse,
        writer.uint32(18).fork()
      ).ldelim();
    }
    if (message.getTableConfigurationResponse !== undefined) {
      GetTableConfigurationResponse.encode(
        message.getTableConfigurationResponse,
        writer.uint32(26).fork()
      ).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): Response {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.ackResponse = AckResponse.decode(reader, reader.uint32());
          break;
        case 2:
          message.getAssetResponse = GetAssetResponse.decode(
            reader,
            reader.uint32()
          );
          break;
        case 3:
          message.getTableConfigurationResponse =
            GetTableConfigurationResponse.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): Response {
    return {
      ackResponse: isSet(object.ackResponse)
        ? AckResponse.fromJSON(object.ackResponse)
        : undefined,
      getAssetResponse: isSet(object.getAssetResponse)
        ? GetAssetResponse.fromJSON(object.getAssetResponse)
        : undefined,
      getTableConfigurationResponse: isSet(object.getTableConfigurationResponse)
        ? GetTableConfigurationResponse.fromJSON(
            object.getTableConfigurationResponse
          )
        : undefined,
    };
  },

  toJSON(message: Response): unknown {
    const obj: any = {};
    message.ackResponse !== undefined &&
      (obj.ackResponse = message.ackResponse
        ? AckResponse.toJSON(message.ackResponse)
        : undefined);
    message.getAssetResponse !== undefined &&
      (obj.getAssetResponse = message.getAssetResponse
        ? GetAssetResponse.toJSON(message.getAssetResponse)
        : undefined);
    message.getTableConfigurationResponse !== undefined &&
      (obj.getTableConfigurationResponse = message.getTableConfigurationResponse
        ? GetTableConfigurationResponse.toJSON(
            message.getTableConfigurationResponse
          )
        : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<Response>, I>>(object: I): Response {
    const message = createBaseResponse();
    message.ackResponse =
      object.ackResponse !== undefined && object.ackResponse !== null
        ? AckResponse.fromPartial(object.ackResponse)
        : undefined;
    message.getAssetResponse =
      object.getAssetResponse !== undefined && object.getAssetResponse !== null
        ? GetAssetResponse.fromPartial(object.getAssetResponse)
        : undefined;
    message.getTableConfigurationResponse =
      object.getTableConfigurationResponse !== undefined &&
      object.getTableConfigurationResponse !== null
        ? GetTableConfigurationResponse.fromPartial(
            object.getTableConfigurationResponse
          )
        : undefined;
    return message;
  },
};

function createBaseHelloRequest(): HelloRequest {
  return {};
}

export const HelloRequest = {
  encode(
    _: HelloRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): HelloRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseHelloRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): HelloRequest {
    return {};
  },

  toJSON(_: HelloRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<HelloRequest>, I>>(
    _: I
  ): HelloRequest {
    const message = createBaseHelloRequest();
    return message;
  },
};

function createBaseAckResponse(): AckResponse {
  return {};
}

export const AckResponse = {
  encode(_: AckResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): AckResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseAckResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): AckResponse {
    return {};
  },

  toJSON(_: AckResponse): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<AckResponse>, I>>(_: I): AckResponse {
    const message = createBaseAckResponse();
    return message;
  },
};

function createBaseDisplaySceneRequest(): DisplaySceneRequest {
  return { scene: undefined };
}

export const DisplaySceneRequest = {
  encode(
    message: DisplaySceneRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.scene !== undefined) {
      Scene.encode(message.scene, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): DisplaySceneRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseDisplaySceneRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.scene = Scene.decode(reader, reader.uint32());
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): DisplaySceneRequest {
    return {
      scene: isSet(object.scene) ? Scene.fromJSON(object.scene) : undefined,
    };
  },

  toJSON(message: DisplaySceneRequest): unknown {
    const obj: any = {};
    message.scene !== undefined &&
      (obj.scene = message.scene ? Scene.toJSON(message.scene) : undefined);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<DisplaySceneRequest>, I>>(
    object: I
  ): DisplaySceneRequest {
    const message = createBaseDisplaySceneRequest();
    message.scene =
      object.scene !== undefined && object.scene !== null
        ? Scene.fromPartial(object.scene)
        : undefined;
    return message;
  },
};

function createBaseGetAssetRequest(): GetAssetRequest {
  return { id: "" };
}

export const GetAssetRequest = {
  encode(
    message: GetAssetRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAssetRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetAssetRequest {
    return {
      id: isSet(object.id) ? String(object.id) : "",
    };
  },

  toJSON(message: GetAssetRequest): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GetAssetRequest>, I>>(
    object: I
  ): GetAssetRequest {
    const message = createBaseGetAssetRequest();
    message.id = object.id ?? "";
    return message;
  },
};

function createBaseGetAssetResponse(): GetAssetResponse {
  return { id: "", payload: new Uint8Array() };
}

export const GetAssetResponse = {
  encode(
    message: GetAssetResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.id !== "") {
      writer.uint32(10).string(message.id);
    }
    if (message.payload.length !== 0) {
      writer.uint32(18).bytes(message.payload);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetAssetResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetAssetResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.id = reader.string();
          break;
        case 2:
          message.payload = reader.bytes();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetAssetResponse {
    return {
      id: isSet(object.id) ? String(object.id) : "",
      payload: isSet(object.payload)
        ? bytesFromBase64(object.payload)
        : new Uint8Array(),
    };
  },

  toJSON(message: GetAssetResponse): unknown {
    const obj: any = {};
    message.id !== undefined && (obj.id = message.id);
    message.payload !== undefined &&
      (obj.payload = base64FromBytes(
        message.payload !== undefined ? message.payload : new Uint8Array()
      ));
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GetAssetResponse>, I>>(
    object: I
  ): GetAssetResponse {
    const message = createBaseGetAssetResponse();
    message.id = object.id ?? "";
    message.payload = object.payload ?? new Uint8Array();
    return message;
  },
};

function createBaseGetTableConfigurationRequest(): GetTableConfigurationRequest {
  return {};
}

export const GetTableConfigurationRequest = {
  encode(
    _: GetTableConfigurationRequest,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GetTableConfigurationRequest {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTableConfigurationRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(_: any): GetTableConfigurationRequest {
    return {};
  },

  toJSON(_: GetTableConfigurationRequest): unknown {
    const obj: any = {};
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GetTableConfigurationRequest>, I>>(
    _: I
  ): GetTableConfigurationRequest {
    const message = createBaseGetTableConfigurationRequest();
    return message;
  },
};

function createBaseGetTableConfigurationResponse(): GetTableConfigurationResponse {
  return { resolution: undefined, size: 0, playAudioOnTable: false };
}

export const GetTableConfigurationResponse = {
  encode(
    message: GetTableConfigurationResponse,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.resolution !== undefined) {
      GetTableConfigurationResponse_Resolution.encode(
        message.resolution,
        writer.uint32(10).fork()
      ).ldelim();
    }
    if (message.size !== 0) {
      writer.uint32(17).double(message.size);
    }
    if (message.playAudioOnTable === true) {
      writer.uint32(24).bool(message.playAudioOnTable);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GetTableConfigurationResponse {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTableConfigurationResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.resolution = GetTableConfigurationResponse_Resolution.decode(
            reader,
            reader.uint32()
          );
          break;
        case 2:
          message.size = reader.double();
          break;
        case 3:
          message.playAudioOnTable = reader.bool();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetTableConfigurationResponse {
    return {
      resolution: isSet(object.resolution)
        ? GetTableConfigurationResponse_Resolution.fromJSON(object.resolution)
        : undefined,
      size: isSet(object.size) ? Number(object.size) : 0,
      playAudioOnTable: isSet(object.playAudioOnTable)
        ? Boolean(object.playAudioOnTable)
        : false,
    };
  },

  toJSON(message: GetTableConfigurationResponse): unknown {
    const obj: any = {};
    message.resolution !== undefined &&
      (obj.resolution = message.resolution
        ? GetTableConfigurationResponse_Resolution.toJSON(message.resolution)
        : undefined);
    message.size !== undefined && (obj.size = message.size);
    message.playAudioOnTable !== undefined &&
      (obj.playAudioOnTable = message.playAudioOnTable);
    return obj;
  },

  fromPartial<I extends Exact<DeepPartial<GetTableConfigurationResponse>, I>>(
    object: I
  ): GetTableConfigurationResponse {
    const message = createBaseGetTableConfigurationResponse();
    message.resolution =
      object.resolution !== undefined && object.resolution !== null
        ? GetTableConfigurationResponse_Resolution.fromPartial(
            object.resolution
          )
        : undefined;
    message.size = object.size ?? 0;
    message.playAudioOnTable = object.playAudioOnTable ?? false;
    return message;
  },
};

function createBaseGetTableConfigurationResponse_Resolution(): GetTableConfigurationResponse_Resolution {
  return { width: 0, height: 0 };
}

export const GetTableConfigurationResponse_Resolution = {
  encode(
    message: GetTableConfigurationResponse_Resolution,
    writer: _m0.Writer = _m0.Writer.create()
  ): _m0.Writer {
    if (message.width !== 0) {
      writer.uint32(9).double(message.width);
    }
    if (message.height !== 0) {
      writer.uint32(17).double(message.height);
    }
    return writer;
  },

  decode(
    input: _m0.Reader | Uint8Array,
    length?: number
  ): GetTableConfigurationResponse_Resolution {
    const reader = input instanceof _m0.Reader ? input : new _m0.Reader(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetTableConfigurationResponse_Resolution();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          message.width = reader.double();
          break;
        case 2:
          message.height = reader.double();
          break;
        default:
          reader.skipType(tag & 7);
          break;
      }
    }
    return message;
  },

  fromJSON(object: any): GetTableConfigurationResponse_Resolution {
    return {
      width: isSet(object.width) ? Number(object.width) : 0,
      height: isSet(object.height) ? Number(object.height) : 0,
    };
  },

  toJSON(message: GetTableConfigurationResponse_Resolution): unknown {
    const obj: any = {};
    message.width !== undefined && (obj.width = message.width);
    message.height !== undefined && (obj.height = message.height);
    return obj;
  },

  fromPartial<
    I extends Exact<DeepPartial<GetTableConfigurationResponse_Resolution>, I>
  >(object: I): GetTableConfigurationResponse_Resolution {
    const message = createBaseGetTableConfigurationResponse_Resolution();
    message.width = object.width ?? 0;
    message.height = object.height ?? 0;
    return message;
  },
};

declare var self: any | undefined;
declare var window: any | undefined;
declare var global: any | undefined;
var globalThis: any = (() => {
  if (typeof globalThis !== "undefined") return globalThis;
  if (typeof self !== "undefined") return self;
  if (typeof window !== "undefined") return window;
  if (typeof global !== "undefined") return global;
  throw "Unable to locate global object";
})();

const atob: (b64: string) => string =
  globalThis.atob ||
  ((b64) => globalThis.Buffer.from(b64, "base64").toString("binary"));
function bytesFromBase64(b64: string): Uint8Array {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; ++i) {
    arr[i] = bin.charCodeAt(i);
  }
  return arr;
}

const btoa: (bin: string) => string =
  globalThis.btoa ||
  ((bin) => globalThis.Buffer.from(bin, "binary").toString("base64"));
function base64FromBytes(arr: Uint8Array): string {
  const bin: string[] = [];
  arr.forEach((byte) => {
    bin.push(String.fromCharCode(byte));
  });
  return btoa(bin.join(""));
}

type Builtin =
  | Date
  | Function
  | Uint8Array
  | string
  | number
  | boolean
  | undefined;

export type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Array<infer U>
  ? Array<DeepPartial<U>>
  : T extends ReadonlyArray<infer U>
  ? ReadonlyArray<DeepPartial<U>>
  : T extends {}
  ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

type KeysOfUnion<T> = T extends T ? keyof T : never;
export type Exact<P, I extends P> = P extends Builtin
  ? P
  : P & { [K in keyof P]: Exact<P[K], I[K]> } & Record<
        Exclude<keyof I, KeysOfUnion<P>>,
        never
      >;

if (_m0.util.Long !== Long) {
  _m0.util.Long = Long as any;
  _m0.configure();
}

function isSet(value: any): boolean {
  return value !== null && value !== undefined;
}
