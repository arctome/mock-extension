// chrome.browserAction.onClicked.addListener(e => {
//     chrome.tabs.create({
//         url: chrome.runtime.getURL('options.html'),
//         active: true
//     });
// });

// chrome.runtime.onInstalled.addListener(function (data) {
//     // after install, active options.html to init local storage.
//     if (data.reason == 'install') {
//         chrome.tabs.create({
//             url: chrome.runtime.getURL('options.html'),
//             active: true
//         })
//     }
//     if (data.reason == 'update') { }
// });

const BG_GLOBAL = {
    LOCAL_STORAGE_KEYNAME: "__ext__privatekey",
    LOCAL_STORAGE_SETTINGNAME: "__ext__settings",
    LOCAL_STORAGE_MOCKFLAG: "__ext__mockflag",
    REMOTE_MOCK_SERVER: "https://mock.arcto.xyz/mock?mock_redirected_id="
}

// functions for request blocking
function apiDataParse(info) {
    // {"frameId":0,"initiator":"http://some-mock-url.test.com","method":"GET","parentFrameId":-1,"requestId":"7064","tabId":105,"timeStamp":1603434504445.433,"type":"xmlhttprequest","url":"http://some-mock-url.test.com/test?ajaxID=thisistestid"}
    const infoURL = new URL(info.url)
    let localSettings = window.localStorage.getItem(BG_GLOBAL.LOCAL_STORAGE_SETTINGNAME);
    localSettings = JSON.parse(localSettings);
    const param = localSettings.ajax_param || "ajaxID";
    const id = infoURL.searchParams.get(param); // √
    if(id) {
        let storeInfo = {
            enable: false,
            url: infoURL.href,
            id
        }
        localStorage.setItem(id, JSON.stringify(storeInfo))
    }
}

function xhrRedirect(info) {
    let localSettings = window.localStorage.getItem(BG_GLOBAL.LOCAL_STORAGE_SETTINGNAME);
    localSettings = JSON.parse(localSettings);
    const param = localSettings.ajax_param || "ajaxID";
    const useOnline = localSettings.online === "on";
    const apiurl = useOnline ? BG_GLOBAL.REMOTE_MOCK_SERVER : localSettings.apiurl;
    let ajaxId = new URL(info.url).searchParams.get(param) || '';
    if (ajaxId) {
        if (!localStorage.getItem(ajaxId)) {
            apiDataParse(info)
        }
        let record = JSON.parse(localStorage.getItem(ajaxId));
        if (record.enable === false || record.enable === "false") return;
        return {
            redirectUrl: apiurl + ajaxId
        }
    }
}

function getMockStatus() {
    return localStorage.getItem(BG_GLOBAL.LOCAL_STORAGE_MOCKFLAG) === true || localStorage.getItem(BG_GLOBAL.LOCAL_STORAGE_MOCKFLAG) === "true";
}

chrome.webRequest.onBeforeRequest.addListener(
    // callback function
    (info) => {
        if (!getMockStatus()) return;
        if (info.type === "xmlhttprequest") {
            let redirect = xhrRedirect(info)
            return redirect
        }
    },
    // filter
    {
        urls: ["<all_urls>"]
    },
    // extraInfoSpec
    ["blocking"]
);

chrome.webRequest.onBeforeSendHeaders.addListener(function (info) {
    if (!getMockStatus()) return;
    const useOnline = localSettings.online === "on";
    if(!useOnline) return; // If user use custom service, ignore header pass.
    if (!info.type === "xmlhttprequest") return;
    const ajaxId = new URL(info.url).searchParams.get('mock_redirected_id');
    if (!ajaxId) return;
    let headers = info.requestHeaders
    // Add private token
    headers.push({ name: "Arcto-Mock-Token", value: localStorage.getItem(BG_GLOBAL.LOCAL_STORAGE_KEYNAME) })
    return { requestHeaders: headers }
},
    { urls: ["<all_urls>"] },
    ["blocking", "requestHeaders"]);