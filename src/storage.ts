// import { openDB, IDBPDatabase, DBSchema, IDBPObjectStore } from 'idb';
// import { useState, useEffect } from 'react';
// import { EventEmitter } from 'events';

// const STORE_NAME = 'keyval';
// const INDEX_NAME = 'id';
// interface Schema<T> extends DBSchema {
// 	keyval: {
// 		key: string | number,
// 		value: T
// 	}
// }
// type KeyValDatabase<T extends { id: string | number }> = IDBPDatabase<Schema<T>>

// const changeEmitter = new EventEmitter();

// export function useDB<T extends { id: string | number }>(name: string) {
// 	const [db, setDB] = useState<KeyValDatabase<T> | undefined>(undefined);

// 	useEffect(() => {
// 		openDB<Schema<T>>(name, 1, {
// 			upgrade(db) {
// 				db.createObjectStore(STORE_NAME, {
// 					keyPath: INDEX_NAME,
// 					autoIncrement: true,
// 				});
// 			},
// 		}).then((db) => setDB(db))
// 	}, [])

// 	if (!db) {
// 		return undefined;
// 	}

// 	return db;
// }

// export function useAllValues<T extends { id: string | number }>(db: KeyValDatabase<T> | undefined) {
// 	const [values, setValues] = useState<Array<T> | undefined>(undefined);

// 	useEffect(() => {
// 		if (!db) {
// 			return;
// 		}

// 		function onChange() {
// 			db?.getAll(STORE_NAME).then((v) => setValues(v))
// 		}

// 		const event = 'change:' + db.name;
// 		changeEmitter.on(event, onChange);
// 		onChange();

// 		return () => { changeEmitter.off(event, onChange) }
// 	}, [db])

// 	if (!db) {
// 		return undefined;
// 	}

// 	return values;
// }

// export function useOneValue<T extends { id: string | number }>(db: KeyValDatabase<T> | undefined, id: string | number) {
// 	const [value, setValue] = useState<T | undefined>(undefined);

// 	useEffect(() => {
// 		if (!db) {
// 			return;
// 		}

// 		function onChange() {
// 			if (value?.id !== id) setValue(undefined);
// 			db?.get(STORE_NAME, id).then((v) => setValue(v))
// 		}

// 		const event = 'change:' + db.name;
// 		changeEmitter.on(event, onChange);
// 		onChange();

// 		return () => { changeEmitter.off(event, onChange) }
// 	}, [db, id])

// 	if (!db) {
// 		return undefined;
// 	}

// 	return value;
// }

// export function useObjectCreator<T extends { id: string | number }>(db: KeyValDatabase<T> | undefined): (object: T) => void {
// 	if (!db) {
// 		return () => { }
// 	}

// 	return (object: T) => {
// 		db.add(STORE_NAME, object)
// 			.then(() => {
// 				changeEmitter.emit('change:' + db.name);
// 			})
// 	}
// }

// export function useObjectUpdator<T extends { id: string | number }>(db: KeyValDatabase<T> | undefined): (object: T) => void {
// 	if (!db) {
// 		return () => { }
// 	}

// 	return (object: T) => {
// 		db.put(STORE_NAME, object)
// 			.then(() => {
// 				changeEmitter.emit('change:' + db.name);
// 			})
// 	}
// }



import { useState, useEffect, Dispatch, SetStateAction } from 'react';
const RTStorage = require('rt-storage');

export default function useGlobalStorage<T>(name: string) {
	const storage = new RTStorage({ name });
	const useOneValue = <V extends T = T>(key: string) => {
		const [data, setState] = useState<V | null | undefined>(undefined);

		useEffect(() => {
			storage.getItem(key).then((lastData: V) => {
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

		const setData = async (newData: V) => {
			setState(newData);
			await storage.setItem(key, newData);
		}

		return [data, setData] as [V | null | undefined, Dispatch<SetStateAction<V>>];
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
		}
	};
};