Vue.component("MockItem", {
    template: `
      <li style="list-style:none;">
        <sui-segment style="display: flex;justify-content:space-between;align-items:center;">
          <div>
            <p style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><strong>Mock ID: </strong>{{ info.id }}</p>
            <strong>URL: </strong>
            <p style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:-webkit-box;-webkit-line-clamp: 3;-webkit-box-orient: vertical;word-break: break-all;">{{ info.url }}</p>
          </div>
          <div>
            <sui-checkbox toggle v-model="info.enable" name="enable" @change="enableToggler" />
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
        // console.log(this.info.id);
        window.localStorage.setItem(this.info.id, bool);
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
          <div><sui-button content="Pause" negative icon="pause" label-position="left" v-if="mockFlag" @click="toggleMockHandler(!mockFlag)" />
          <sui-button content="Start" positive icon="right arrow" label-position="right" v-else @click="toggleMockHandler(!mockFlag)" /></div>
          <sui-button content="Edit or Create" icon="external alternate right" label-position="right" @click="window.open('https://mock.arcto.xyz/dashboard')" />
        </div>
        <sui-divider horizontal>Captured Request with Param</sui-divider>
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
      allHistoryIterate(function(key, value) {
        _this.recordList.push({...value, id: key});
      })
    },
    methods: {
      toggleMockHandler(bool) {
        window.localStorage.setItem(window.__ext__VARS.LOCAL_STORAGE_MOCKFLAG, bool);
        this.mockFlag = bool;
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