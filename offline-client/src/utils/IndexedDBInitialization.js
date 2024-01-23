import { IdxConstants, IdxModes } from '../constants/IndexedDBKeys'
import { uid } from './uuid'

export const IDBInitialization = async () => {
    return new Promise((resolve, reject) => {
        let db = null
        let dbOpenRequest = indexedDB.open(IdxConstants.DBNAME, 2)
        dbOpenRequest.addEventListener('error', (err) => {
            console.warn(err)
            reject('IndexedDB open Failed.', err)
        })
        dbOpenRequest.addEventListener('success', (ev) => {
            db = ev.target.result
            console.log('Success opening DB', db)
            resolve(db)
        })
        dbOpenRequest.addEventListener('upgradeneeded', (ev) => {
            db = ev.target.result
            // METAData SKU store configuration
            if (db.objectStoreNames.contains(IdxConstants.IMPORTED_SKU)) {
                db.deleteObjectStore(IdxConstants.IMPORTED_SKU)
            }
            let metaDataStore = db.createObjectStore(IdxConstants.METADATA_STORE, {
                keyPath: 'id'
            })

            metaDataStore.transaction.oncomplete = (event) => {
                // Store values in the newly created objectStore.
                const metadataUpdateStore = db
                  .transaction(IdxConstants.METADATA_STORE, IdxModes.readwrite)
                  .objectStore(IdxConstants.METADATA_STORE);
                metadataUpdateStore.add({
                    id: uid(),
                    desc: 'Server Sync Pending',
                    status: false
                })
              };

            // IMPORTED SKU Store configuration
            if (db.objectStoreNames.contains(IdxConstants.IMPORTED_SKU)) {
                db.deleteObjectStore(IdxConstants.IMPORTED_SKU)
            }
            let objectStore = db.createObjectStore(IdxConstants.IMPORTED_SKU, {
                keyPath: 'id'
            })
            objectStore.createIndex('nameIDX', 'name', { unique: false })
            objectStore.createIndex('ageIDX', 'age', { unique: false })
            objectStore.createIndex('emailIDX', 'email', { unique: true })
        })
    })
}
