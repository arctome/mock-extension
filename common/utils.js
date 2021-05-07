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