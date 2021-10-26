function allHistoryIterate(fn) {
    let extSettingsReg = /^__ext__(.*)/
    let _local = Object.keys(localStorage)
    for (let i in _local) {
        if (!extSettingsReg.test(_local[i])) {
            var str = localStorage.getItem(_local[i]);
            try {
                str = JSON.parse(str)
            } catch (e) {
                console.log(`${_local[i]} record broken, automatically removed.`);
                localStorage.removeItem(_local[i]);
                return;
            }
            fn(_local[i], str);
        }
    }
}

function checkEnv() {
    if (!window.indexedDB) {
        throw new Error("[Moker Plugin] Your browser doesn't support a stable version of IndexedDB. Plugin functions cannot run.")
    }
    if (!window.PouchDB) {
        throw new Error("[Moker Plugin] PouchDB init failed.")
    }
}

const defaultConfig = {
    server: "http://localhost:10081",
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
    let config = window.localStorage.getItem("MOKER_CONFIG");
    if(config) {
        config = JSON.parse(config)
    } else {
        config = defaultConfig;
    }
    window.localStorage.setItem("MOKER_CONFIG", JSON.stringify(Object.assign(config, configPatch)))
    return true;
}