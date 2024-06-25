/// <reference types="web-bluetooth" />

import {useEffect, useState} from 'react';

const config = {
  ble: {
    filters: [
      {
        services: [0x12342233],
      },
    ] as BluetoothLEScanFilter[],
    serviceUUID: 0x12342233,
  },
};

export function useBluetoothDevice(): {
  connect: () => void;
  disconnect: () => void;
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  error: Error | null;
  service: BluetoothRemoteGATTService | null;
} {
  const [service, setService] = useState<BluetoothRemoteGATTService | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);
  const [status, setStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');

  useEffect(() => {
    if (!service) {
      return;
    }

    service.device.addEventListener('gattserverdisconnected', () => {
      setService(null);
      setStatus('disconnected');
    });
  }, [service]);

  return {
    connect: async () => {
      if (!service) {
        try {
          setStatus('connecting');
          const service = await requestDevice();
          setService(service);
          setStatus('connected');
        } catch (e) {
          setError(e as Error);
          setStatus('error');
        }
      }
    },
    disconnect: () => {
      if (service) {
        service.device.gatt?.disconnect();
        setStatus('disconnected');
        setService(null);
      }
    },
    status,
    error,
    service: service,
  };
}

export function useCharacteristicValue<T>(
  service: BluetoothRemoteGATTService | null,
  charUUID: number | null,
  decoder: (value: DataView) => T
) {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    if (!charUUID || !service) {
      return;
    }
    let char: BluetoothRemoteGATTCharacteristic;
    const handler = () => {
      setValue(decoder(char!.value!));
    };
    service.getCharacteristic(charUUID).then(c => {
      char = c;
      char.startNotifications();
      char.addEventListener('characteristicvaluechanged', handler);
    });
    return () => {
      if (char) {
        if (char.service.device.gatt?.connected) {
          // char.stopNotifications();
        }
        char.removeEventListener('characteristicvaluechanged', handler);
      }
    };
  }, [service, charUUID, decoder]);

  return value;
}

async function requestDevice() {
  const device = await navigator.bluetooth.requestDevice({
    filters: config.ble.filters,
    optionalServices: [config.ble.serviceUUID],
    // acceptAllDevices: true
  });

  console.log('device', device);

  const server = await device.gatt?.connect();
  if (!server) {
    throw new Error('Failed to connect to GATT server');
  }
  return await server.getPrimaryService(config.ble.serviceUUID);
}
