const defaultConfig = {
    server: "https://moker-server.arctos.workers.dev/api/mock",
    block_mock_key: "mock_id",
    // block_case_key: "case_id",
    enable: false,
    token: ""
}

// Basic
function loadConfig() {
    const config = window.localStorage.getItem("MOKER_CONFIG");
    if (!config) return defaultConfig;
    return JSON.parse(config);
}
function updateConfig(configPatch) {
    const config = window.localStorage.getItem("MOKER_CONFIG");
    window.localStorage.setItem("MOKER_CONFIG", JSON.stringify(Object.assign(config, configPatch)))
    return true;
}
function checkEnv() {
    if (!window.indexedDB) {
        throw new Error("[Moker Plugin] Your browser doesn't support a stable version of IndexedDB. Plugin functions cannot run.")
    }
    if (!window.PouchDB) {
        throw new Error("[Moker Plugin] PouchDB init failed.")
    }
}

// Life Cycle
// First request, fetch Full Data from the Moker Server
function fetchFullRecord(mock_id, callback, errHandler) {
    let config = loadConfig();
    if (!config.token) throw new Error("[Moker Plugin] No Token detected!")
    fetch(`${config.server}/api/mock?__internal_record_id__=${mock_id}`, {
        method: "GET",
        headers: {
            "Moker-Authorization": config.token
        }
    }).then(response => {
        if (response.ok && response.status === 200) {
            return response.json()
        } else {
            errHandler(response);
            return false;
        }
    }).then(data => {
        if (!data) return {};
        callback(data)
    })
}

// PouchDB handlers
function GetDocFromDB(mock_id, callback, errHandler) {
    const db = new PouchDB('MOKER_POUCHDB');
    if (!db) throw new Error('[Moker Plugin] DB not found.')
    db.get(mock_id, function (err, doc) {
        if (err) {
            errHandler(err);
            return {};
        }
        // handle doc
        if (!doc._id) {
            errHandler(doc)
            return {};
        }
        const a = callback(doc)
        console.log(a)
        debugger;
        return a;
    })
}
function CreateDocFromDB(mock_id, callback, errHandler) {
    const db = new PouchDB('MOKER_POUCHDB');
    fetchFullRecord(mock_id, fullData => {
        const doc = {
            _id: mock_id,
            capture_time: Date.now(),
            enable: 0,
            ...fullData.data
        }
        db.put(doc, function (err, response) {
            if (err) { errHandler(err); return; }
            callback(doc)
        });
    }, err => {
        errHandler(err);
        return;
    })
    // let fullData = await fetchFullRecord(mock_id).catch(e => { throw e });
    // if (!fullData || !fullData.code) return false;
    // const doc = {
    //     _id: mock_id,
    //     capture_time: Date.now(),
    //     enable: 0,
    //     ...fullData.data
    // }
    // let result = await db.put(doc).catch(e => { throw e })
    // if (!result.ok) return false;
    // return doc;
}

function UpdateDocFromDB(exist_doc, callback, errHandler) {
    const db = new PouchDB('MOKER_POUCHDB');
    // let fullData = await fetchFullRecord(exist_doc._id).catch(e => { throw e });
    // if (!fullData.ok) return false;
    // const doc = {
    //     _id: exist_doc._id,
    //     _rev: exist_doc._rev,
    //     capture_time: Date.now(),
    //     enable: exist_doc.enable,
    //     ...fullData.data
    // }
    // let result = await db.put(doc).catch(e => { throw e })
    // if (!result.ok) return false;
    // return doc;
    fetchFullRecord(exist_doc._id, fullData => {
        if (!fullData || !fullData.ok) {
            errHandler();
            return;
        }
        const doc = {
            _id: exist_doc._id,
            _rev: exist_doc._rev,
            capture_time: Date.now(),
            enable: exist_doc.enable,
            ...fullData.data
        }
        db.put(doc, function (err, response) {
            if (err) { errHandler(err); return; }
            callback(doc)
        });
    })
}

function requestHandler(info) {
    const config = loadConfig();
    if (!config.enable) return {};
    const requestSearchParams = new URL(info.url).searchParams;
    let mockId = requestSearchParams.get(config.block_mock_key) || '';
    if (!mockId) return {};
    // let localMockState = await GetDocFromDB(mockId).catch(e => { throw e });
    // if (!localMockState) {
    //     localMockState = await CreateDocFromDB(mockId).catch(e => { throw e });
    // }
    // if (!localMockState) return {};
    // if (localMockState.capture_time - Date.now() > 60 * 60 * 24) {
    //     localMockState = await UpdateDocFromDB(localMockState).catch(e => { throw e });
    // }
    // if (localMockState.enable) {
    //     return {
    //         redirectUrl: config.server + '/api/mock' + `?__internal_record_id__=${mockId}&__internal_case_id__=${localMockState.enable}`
    //     }
    // }
    GetDocFromDB(mockId, (doc) => {
        if (doc.capture_time - Date.now() > 60 * 60 * 24) {
            UpdateDocFromDB(doc, doc => {
                if (doc.enable) {
                    return {
                        redirectUrl: config.server + '/api/mock' + `?__internal_record_id__=${mockId}&__internal_case_id__=${doc.enable}`
                    }
                } else {
                    return {}
                }
            })
        } else {
            if (doc.enable) {
                return {
                    redirectUrl: config.server + '/api/mock' + `?__internal_record_id__=${mockId}&__internal_case_id__=${doc.enable}`
                }
            } else {
                return {}
            }
        }
    }, (err) => {
        CreateDocFromDB(mockId, doc => {
            if (doc.enable) {
                return {
                    redirectUrl: config.server + '/api/mock' + `?__internal_record_id__=${mockId}&__internal_case_id__=${doc.enable}`
                }
            }
        }, err => {
            console.log(err)
            return {}
        })
    })
    // debugger;
    // return res;
    let doc = window.localStorage.getItem("MOKER_ID:" + mockId);
    if (!doc) return {}
    doc = JSON.parse(doc);
    if (!doc.enable) return {}
    if (doc.enable === "__random") {
        let cases = docs.cases.split(",");
        return {
            redirectUrl: config.server + '/api/mock' + `?__internal_record_id__=${mockId}&__internal_case_id__=${cases[Math.floor(Math.random()*cases.length)]}`
        }
    }
    return {
        redirectUrl: config.server + '/api/mock' + `?__internal_record_id__=${mockId}&__internal_case_id__=${doc.enable}`
    }
}

// Chrome Event Listener
chrome.webRequest.onBeforeRequest.addListener(
    // callback function
    info => requestHandler(info),
    // filter
    {
        urls: ["<all_urls>"]
    },
    // extraInfoSpec
    ["blocking"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {
    const config = loadConfig();
    if (!config.enable) return;
    if (!info.type === "xmlhttprequest") return;
    const ajaxId = new URL(info.url).searchParams.get('__internal_record_id__');
    if (!ajaxId) return;
    let headers = info.requestHeaders
    // Add private token
    headers.push({ name: "Moker-Authorization", value: config.token })
    return { requestHeaders: headers }
},
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]);