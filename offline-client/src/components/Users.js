import axios from 'axios'
import React, { useContext, useEffect, useState } from 'react'
import { IDBInitialization } from '../utils/IndexedDBInitialization'
import { IdxConstants, IdxModes } from '../constants/IndexedDBKeys'
import { Table, Form, Toast } from 'react-bootstrap'
import { PencilFill } from 'react-bootstrap-icons'
import { useNavigate } from 'react-router-dom'

const style = {
    productJust: {
        textAlign: 'justify',
        marginLeft: '10px'
    },
    productLabel: {
        fontWeight: 'bold'
    }
}

const makeTransactionInit = (db, storeName, mode) => {
    let txn = db.transaction(storeName, mode)
    txn.onerror = err => {
        console.warn('Global IndexedDB Error: ', err)
    }
    return txn
}

async function userUpdateToIndexedDB(dbInitialization, response) {
    const db = await dbInitialization()
    const txn = makeTransactionInit(db, IdxConstants.IMPORTED_SKU, IdxModes.readwrite)
    txn.oncomplete = (ev) => {
        console.log('complete')
    }
    const store = txn.objectStore(IdxConstants.IMPORTED_SKU)
    store.clear()
    response.data.forEach(item => {
        const request = store.add(item)
        request.onsuccess = ev => {
            console.log("Successfully added data to Indx DB!")
        }
        request.onerror = err => {
            console.log("Error adding value to Indx DB!", err)
        }
    })
}

async function getSyncStatusToIndexedDb(dbInitialization, setSyncStatus) {
    const db = await dbInitialization()
    const txnMeta = makeTransactionInit(db, IdxConstants.METADATA_STORE, IdxModes.readwrite)
    const metaStore = txnMeta.objectStore(IdxConstants.METADATA_STORE)
    const getMetaAll = metaStore.getAll()
    getMetaAll.onsuccess = function () {
        const result = getMetaAll.result
        const obj = result[0]
        setSyncStatus(obj.status === true)
    }
}

async function updateMetaDataSyncedToIndexedDB(dbInitialization, syncStatus) {
    const db = await dbInitialization()
    const txnMeta = makeTransactionInit(db, IdxConstants.METADATA_STORE, IdxModes.readwrite)
    const metaStore = txnMeta.objectStore(IdxConstants.METADATA_STORE)
    const getMetaAll = metaStore.getAll()
    getMetaAll.onsuccess = function () {
        const result = getMetaAll.result
        const obj = result[0]
        const request = metaStore.put({ ...obj, status: syncStatus })
        request.onsuccess = ev => {
            console.log("Successfully added data to Indx DB!")
        }
        request.onerror = err => {
            console.log("Error adding value to Indx DB!", err)
        }
    }
}

async function deliveryUpdationToIndexedDB(dbInitialization, completeSKU = [], skuUpdate, checked, setUsers, setSyncStatus) {
    const db = await dbInitialization()
    const txn = makeTransactionInit(db, IdxConstants.IMPORTED_SKU, IdxModes.readwrite)
    txn.oncomplete = (ev) => {
        console.log('complete')
    }
    const store = txn.objectStore(IdxConstants.IMPORTED_SKU)
    // store.clear()
    const finalArray = completeSKU.map((item) => {
        if (item.id == skuUpdate.id) {
            return { ...item, delivered: checked }
        }
        return item
    })
    if (finalArray && finalArray.length > 0) {
        store.clear()
        finalArray.forEach(item => {
            const request = store.add(item)
            request.onsuccess = ev => {
                console.log("Successfully added data to Indx DB!")
            }
            request.onerror = err => {
                console.log("Error adding value to Indx DB!", err)
            }
        })
        await updateMetaDataSyncedToIndexedDB(dbInitialization, true)
        setUsers(finalArray)
        setSyncStatus(true)
    }

}

async function userUpdateFromIndexedDB(dbInitialization, setUsers) {
    const db = await dbInitialization()
    const txn = makeTransactionInit(db, IdxConstants.IMPORTED_SKU, IdxModes.readwrite)
    txn.oncomplete = (ev) => {
        console.log('complete')
    }
    const store = txn.objectStore(IdxConstants.IMPORTED_SKU)
    const range = IDBKeyRange.bound('A', 'Z', false, false)
    const getRequest = store.index('emailIDX').getAll(range)
    getRequest.onsuccess = (ev) => {
        //getAll was successful
        const request = ev.target; //request === getRequest === ev.target
        //console.log({ request });
        setUsers(request.result)
    };
    getRequest.onerror = (err) => {
        console.warn(err);
    };
}

export default function ({ networkStatus, triggerPost }) {
    const [users, setUsers] = useState([])
    const [syncStatus, setSyncStatus] = useState(null)
    const dbInitialization = IDBInitialization


    useEffect(() => {
        if (syncStatus === null) {
            console.log("Reached here syncStatus")
            getSyncStatusToIndexedDb(dbInitialization, setSyncStatus)
        } else if (syncStatus === true && networkStatus) {
            userUpdateFromIndexedDB(dbInitialization, setUsers)
        }
    }, [syncStatus])

    useEffect(() => {
        if (users && users.length > 0 && syncStatus === true && networkStatus) {
            axios.post('http://localhost:8080/users', users).then(res => {
                console.log("Successfully posted")
                return updateMetaDataSyncedToIndexedDB(dbInitialization, false)
            }).then(r => {
                console.log("Metadata updated to false!")
            }).catch(err => {
                console.log("Error", err)
            })
        }
    }, [users, syncStatus, triggerPost])

    useEffect(() => {
        console.log(networkStatus, "onLine")
        if (networkStatus && syncStatus === false) {
            axios.get('http://localhost:8080/users').then(response => {
                if (response && response.data && response.data.length > 0) {
                    setUsers(response.data)
                    userUpdateToIndexedDB(dbInitialization, response)
                }

            }).catch(err => {
                userUpdateFromIndexedDB(dbInitialization, setUsers)
                console.log("Error Fetching data!", err)
            })
        } else {
            userUpdateFromIndexedDB(dbInitialization, setUsers)
        }
    }, [syncStatus])

    console.log('syncStatus',syncStatus)
    return (
        <div>
            {users.length > 0 && (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>Phone No</th>
                            <th>User Name</th>
                            <th>Email</th>
                            <th>Product Info</th>
                            <th>Product Delivered</th>
                        </tr>
                    </thead>
                    <tbody>

                        {users.map(item => {
                            return (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.name}</td>
                                    <td>{item.phone}</td>
                                    <td>{item.username}</td>
                                    <td>{item.email}</td>
                                    <td>
                                        <div style={style.productJust}>
                                            <div><span style={style.productLabel}>Product:</span> {item.title}</div>
                                            <div><span style={style.productLabel}>Category:</span> {item.category}</div>
                                            <div><span style={style.productLabel}>Price:</span> {item.price}</div>
                                        </div>
                                    </td>
                                    <td>
                                        <Form.Check // prettier-ignore
                                            type="switch"
                                            checked={item.delivered}
                                            id="custom-switch"
                                            onChange={(event) => {
                                                // console.log(event, event.target.value, event.target.checked)
                                                deliveryUpdationToIndexedDB(dbInitialization, users, item, event.target.checked, setUsers, setSyncStatus)
                                            }}
                                        />
                                    </td>
                                   
                                </tr>
                            )
                        })}
                    </tbody>
                </Table>

                // <ul>
                //     {users.map((item, id) => <li key={id} ind={id}>{item.name}</li>)}
                // </ul>
            )}
        </div>
    )
}


