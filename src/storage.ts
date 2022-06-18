import { useState, useEffect } from 'react';
const RTStorage = require('rt-storage');

export interface IRTStorage<T> {
	getItem<V extends T>(key: string): Promise<V>;
	setItem<V extends T>(key: string, value: V): Promise<V>;
	removeItem(key: string): Promise<void>;
	keys(): Promise<Array<string>>;
	subscribe<V extends T>(handler: (value: V) => void): { unsubscribe: () => void };
	subscribe<V extends T>(key: string, handler: (value: V) => void): { unsubscribe: () => void };
}

export default function globalStorage<T>(name: string) {
	const storage = new RTStorage({ name }) as IRTStorage<T>;
	const useOneValue = <V extends T = T>(key: string | null) => {
		const [data, setState] = useState<V | null | undefined>(undefined);

		useEffect(() => {
			if (!key) return;
			storage.getItem<V>(key).then((lastData) => {
				if (lastData) {
					setState(lastData);
				}
				else {
					setState(null);
				}
			});

			const subscription = storage.subscribe(key, (d: V) => setState(d));
			return () => {
				subscription.unsubscribe();
			};
		}, [key]);

		if (key === null) {
			return [null, () => Promise.resolve()] as [V | null | undefined, (newData: V) => Promise<void>];
		}

		const setData = async (newData: V) => {
			setState(newData);
			await storage.setItem(key, newData);
		}

		return [data, setData] as [V | null | undefined, (newData: V) => Promise<void>];
	}

	return {
		useAllValues: () => {
			const [data, setState] = useState<Map<string, T>>();

			useEffect(() => {
				function handleStorageChange() {
					storage.keys()
						.then(async (keys: string[]) => {
							const items = new Map<string, T>();
							await Promise.all(keys.map(async (k) => {
								const item = await storage.getItem(k)
								items.set(k, item);
							}))
							setState(items);
						});
				}

				handleStorageChange();
				const subscription = storage.subscribe(handleStorageChange);
				return () => {
					subscription.unsubscribe();
				};
			}, []);

			return data;
		},
		useOneValue,
		createItem: (key: string, object: T) => {
			storage.setItem(key, object);
		},
		deleteItem: async (key: string) => {
			await storage.removeItem(key);
		},
		storage
	};
};