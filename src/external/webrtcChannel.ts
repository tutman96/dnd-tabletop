import {Packet} from '../protos/external';
import AbstractChannel, {ChannelState} from './abstractChannel';

const SIGNAL_BASE_URL = 'https://dndttapi.tutman96.workers.dev';

function makeid(length: number) {
  let result = '';
  const characters = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // A-Z0-9 omitting O, 0, 1, I, L
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const isTable = window.location.hash.substring(2) === 'table/network';

export default class WebRTCApiChannel extends AbstractChannel {
  public sessionId = makeid(6);
  private connecting = false;
  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;

  get state(): ChannelState {
    if (this.connecting) {
      return ChannelState.CONNECTING;
    } else if (this.dataChannel?.readyState === 'open') {
      return ChannelState.CONNECTED;
    } else {
      return ChannelState.DISCONNECTED;
    }
  }

  async connect() {
    this.peerConnection = new RTCPeerConnection();

    this.dataChannel = this.peerConnection.createDataChannel('scene', {
      negotiated: true,
      id: 0,
    });

    await new Promise(res => (this.peerConnection!.onnegotiationneeded = res));

    this.connecting = true;
    this.notifyConnectionStateChange();

    this.peerConnection.onconnectionstatechange = () => {
      this.notifyConnectionStateChange();
    };

    this.dataChannel.onerror = e => {
      console.warn('Data channel error', e);
      this.notifyConnectionStateChange();
    };

    this.dataChannel.onmessage = async event => {
      if (!(event.data instanceof ArrayBuffer)) {
        console.warn("Got a message that wasn't a ArrayBuffer", event);
        return;
      }
      const packet = Packet.decode(new Uint8Array(event.data));
      await this.processIncomingPacket(packet);
    };

    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });

    if (isTable) {
      let offer: string;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          const resp = await fetch(
            `${SIGNAL_BASE_URL}/session/${this.sessionId}/offer`
          );

          if (resp.status === 200) {
            offer = await resp.text();
            break;
          }
        } catch {
          // no-op
        }
        await new Promise(res => setTimeout(res, 5_000));
      }

      console.log('Got offer', {offer});

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({
          sdp: offer,
          type: 'offer',
        })
      );

      const answer = await this.peerConnection.createAnswer();
      this.peerConnection.setLocalDescription(answer);

      await fetch(`${SIGNAL_BASE_URL}/session/${this.sessionId}/answer`, {
        method: 'PUT',
        body: answer.sdp,
      });
    } else {
      console.log('createoffer');
      const firstOffer = await this.peerConnection.createOffer();
      console.log('setLocalDescription');
      await this.peerConnection.setLocalDescription(firstOffer);

      await new Promise<void>(res => {
        this.peerConnection!.onicecandidate = e => {
          console.log('onicecandidate', e.candidate);
          if (e.candidate) {
            this.peerConnection!.addIceCandidate(e.candidate);
          } else {
            res();
          }
        };
      });

      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      console.log('PUT offer', {offer});
      const resp = await fetch(
        `${SIGNAL_BASE_URL}/session/${this.sessionId}/offer`,
        {
          method: 'PUT',
          body: offer.sdp,
        }
      );

      if (!resp.ok) {
        throw new Error(
          `Unknown request status code writing offer: ${resp.status}`
        );
      }

      let answer: string;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          const resp = await fetch(
            `${SIGNAL_BASE_URL}/session/${this.sessionId}/answer`
          );

          if (resp.status === 200) {
            answer = await resp.text();
            break;
          }
        } catch {
          // no-op
        }

        await new Promise(res => setTimeout(res, 5_000));
      }

      console.log('Got answer', {answer});

      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription({
          type: 'answer',
          sdp: answer,
        })
      );
    }

    await new Promise(res => (this.dataChannel!.onopen = res));
    this.connecting = false;

    this.notifyConnectionStateChange();
  }

  async disconnect() {
    console.warn('disconnecting');
    if (this.connecting) {
      console.warn("Can't disconnect while connecting");
      return;
    }
    if (this.peerConnection) {
      this.dataChannel?.close();
      this.dataChannel = null;
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.notifyConnectionStateChange();
  }

  async sendOutgoingPacket(packet: Packet) {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.warn('Tried to send packet before finished connecting');
      return;
    }
    const encodedPacket = Packet.encode(packet).finish();
    const buffer = encodedPacket.buffer.slice(
      encodedPacket.byteOffset,
      encodedPacket.byteOffset + encodedPacket.byteLength
    );
    this.dataChannel.send(buffer);
  }

  protected override notifyConnectionStateChange(): void {
    console.log('connection state', this.state);
    super.notifyConnectionStateChange();
  }
}
