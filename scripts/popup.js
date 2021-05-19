Vue.component("MockItem", {
  template: `
      <li style="list-style:none;">
        <sui-segment style="display: flex;justify-content:space-between;align-items:stretch;">
          <div>
            <p style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><strong>Mock ID: </strong>{{ info.id }}</p>
            <strong>URL: </strong>
            <p style="max-width:300px;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp: 3;-webkit-box-orient: vertical;word-break: break-all;">{{ info.url }}</p>
          </div>
          <div style="display:flex;flex-direction:column;justify-content:space-between;align-items: flex-end;margin-left:5px;">
            <sui-checkbox toggle v-model="info.enable" name="enable" @change="enableToggler" />
            <sui-button size="mini" color="red" icon="trash alternate" inverted @click="removeItemHandler" style="opacity:.2" @mouseover="hoverHandler" @mouseleave="unhoverHandler" />
          </div>
        </sui-segment>
      </li>
    `,
  name: "MockItem",
  data() {
    return {}
  },
  props: ["info"],
  methods: {
    enableToggler(bool) {
      var oldRec = window.localStorage.getItem(this.info.id);
      oldRec = JSON.parse(oldRec);
      oldRec.enable = bool;
      window.localStorage.setItem(this.info.id, JSON.stringify(oldRec));
    },
    removeItemHandler() {
      window.localStorage.removeItem(this.info.id);
      window.location.reload();
    },
    hoverHandler(e) {
      e.target.style.opacity=1
    },
    unhoverHandler(e) {
      e.target.style.opacity=0.2
    }
  },
  mounted() {
    // var a = window.localStorage.getItem(this.info.id);
    // console.log(a);
  }
})
Vue.component("StatusBar", {
  template: `
      <div>
        <div style="display: flex; align-items: center; justify-content: space-between">
          <sui-button-group>
            <sui-button title="Pause listening" negative icon="pause circle" v-if="mockFlag" @click="toggleMockHandler(!mockFlag)" />
            <sui-button title="Start listening" positive icon="right play" v-else @click="toggleMockHandler(!mockFlag)" />
            <sui-button title="Clear All History" icon="trash alternate" @click="clearHistory" />
          </sui-button-group>
          <sui-button content="Edit or Create" icon="external alternate right" label-position="right" @click="window.open('https://mock.arcto.xyz/dashboard')" />
        </div>
        <sui-divider horizontal>Captured Requests</sui-divider>
        <ul style="padding: 0">
          <mock-item v-for="item in recordList" :info="item" :key="item.id"></mock-item>
        </ul>
      </div>
    `,
  name: "StatusBar",
  data() {
    return {
      mockFlag: false,
      recordList: [
        // {id: 123, url: "https://mock.arcto.xyz"}
      ]
    }
  },
  mounted() {
    const _this = this;
    this.mockFlag = window.localStorage.getItem(window.__ext__VARS.LOCAL_STORAGE_MOCKFLAG) === "true";
    allHistoryIterate(function (key, value) {
      _this.recordList.push({ ...value, id: key });
    })
  },
  methods: {
    toggleMockHandler(bool) {
      window.localStorage.setItem(window.__ext__VARS.LOCAL_STORAGE_MOCKFLAG, bool);
      this.mockFlag = bool;
    },
    clearHistory() {
      allHistoryIterate(function (key, value) {
        localStorage.removeItem(key);
        window.location.reload();
      })
    }
  }
})
const App = {
  template: `<div><status-bar /></div>`,
  name: "App",
  data() {
    return {

    };
  },
  methods: {

  },
};
Vue.config.productionTip = false;
Vue.use(SemanticUIVue);

new Vue({
  render: (h) => h(App),
}).$mount("#app");