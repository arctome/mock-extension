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
async function fetchFullRecord(mock_id) {
    let config = loadConfig();
    if (!config.token) throw new Error("[Moker Plugin] No Token detected!")
    let response = await fetch(`${config.server}/api/mock?__internal_record_id__=${mock_id}`, {
        method: "GET",
        headers: {
            "Moker-Authorization": config.token
        }
    })
    if (response.ok && response.status === 200) {
        let data = await response.json();
        return data;
    } else {
        return false;
    }
}

// PouchDB handlers
async function GetDocFromDB(mock_id) {
    const db = new PouchDB('MOKER_POUCHDB');
    if (!db) throw new Error('[Moker Plugin] DB not found.')
    return await db.get(mock_id).catch(e => { console.log(e) })
}
async function CreateDocFromDB(mock_id) {
    const db = new PouchDB('MOKER_POUCHDB');
    let fullData = await fetchFullRecord(mock_id).catch(e => { throw e });
    if (!fullData || !fullData.code) return false;
    const doc = {
        _id: mock_id,
        capture_time: Date.now(),
        enable: 0,
        ...fullData.data
    }
    let result = await db.put(doc).catch(e => { throw e })
    if (!result.ok) return false;
    return doc;
}

async function UpdateDocFromDB(exist_doc) {
    const db = new PouchDB('MOKER_POUCHDB');
    let fullData = await fetchFullRecord(exist_doc._id).catch(e => { throw e });
    if (!fullData.ok) return false;
    const doc = {
        _id: exist_doc._id,
        _rev: exist_doc._rev,
        capture_time: Date.now(),
        enable: exist_doc.enable,
        ...fullData.data
    }
    let result = await db.put(doc).catch(e => { throw e })
    if (!result.ok) return false;
    return doc;
}

function requestHandler(info) {
    const config = loadConfig();
    if (!config.enable) return {};
    const requestSearchParams = new URL(info.url).searchParams;
    let mockId = requestSearchParams.get(config.block_mock_key) || '';
    if (!mockId) return {};
    let localMockState = await GetDocFromDB(mockId).catch(e => { throw e });
    if (!localMockState) {
        localMockState = await CreateDocFromDB(mockId).catch(e => { throw e });
    }
    if (!localMockState) return {};
    if (localMockState.capture_time - Date.now() > 60 * 60 * 24) {
        localMockState = await UpdateDocFromDB(localMockState).catch(e => { throw e });
    }
    if (localMockState.enable) {
        return {
            redirectUrl: config.server + '/api/mock' + `?__internal_record_id__=${mockId}&__internal_case_id__=${localMockState.enable}`
        }
    }
    // return new Promise((resolve, reject) => {
    //     setTimeout(() => {
    //         resolve({redirectUrl: 'www.google.com'})
    //     }, 100)
    // })
}

// Chrome Event Listener
chrome.webRequest.onBeforeRequest.addListener(
    // callback function
    requestHandler,
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
    headers.push({ name: "Moker-Authorization", value: config.token})
    return { requestHeaders: headers }
},
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]);