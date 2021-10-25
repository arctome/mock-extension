Vue.component("MockItem", {
  template: `
      <li style="list-style:none;">
        <sui-segment>
          <div style="display:flex;justify-content:space-between;">
            <p>NAME: {{ info.name }}</p>
            <sui-dropdown text="State">
              <sui-dropdown-menu>
                <sui-dropdown-item>Disabled</sui-dropdown-item>
                <sui-dropdown-item>Random States</sui-dropdown-item>
                <sui-dropdown-divider />
                <sui-dropdown-item v-for="k in info.cases" :key="k">{{ k }}</sui-dropdown-item>
              </sui-dropdown-menu>
            </sui-dropdown>
          </div>
          <p>URL: {{ info.url }}</p>
        </sui-segment>
      </li>
    `,
  name: "MockItem",
  data() {
    return {}
  },
  props: ["info"],
  methods: {
  },
  mounted() {
  }
})
Vue.component("StatusBar", {
  template: `
        <div style="display: flex; align-items: center; justify-content: space-between">
          <sui-button-group>
            <sui-button title="Stop listening" negative icon="pause circle" v-if="mockFlag" @click="toggleMockHandler(!mockFlag)" />
            <sui-button title="Start listening" positive icon="right play" v-else @click="toggleMockHandler(!mockFlag)" />
            <sui-button title="Clear All History" icon="trash alternate" @click="clearHistory" />
          </sui-button-group>
          <sui-button content="Edit or Create" icon="external alternate right" label-position="right" @click="window.open(adminPanel)" />
        </div>
    `,
  name: "StatusBar",
  data() {
    return {
      mockFlag: false,
      adminPanel: ""
    }
  },
  mounted() {
    const config = loadConfig();
    if (config.enable) this.mockFlag = true;
    if (config.server) this.adminPanel = config.server.replace('/api/mock', '/admin')
  },
  methods: {
    toggleMockHandler(status) {
      this.mockFlag = status;
    },
    clearHistory() {}
  }
})
const App = {
  template: `<div>
    <status-bar />
    <sui-search style="margin-top: 10px;">
      <template v-slot:input="{ props, handlers }">
        <sui-input
          v-bind="props"
          v-on="handlers"
          placeholder="Search collections ..."
          icon="search"
        />
      </template>
    </sui-search>
    <sui-divider horizontal>Captured Requests</sui-divider>
    <ul style="padding: 0">
      <mock-item v-for="item in records" :info="item" :key="item.id"></mock-item>
    </ul>
  </div>`,
  name: "App",
  data() {
    return {
      records: null
    };
  },
  methods: {
    loadRecords(collection) {
      const db = new PouchDB("MOKER_POUCHDB");
      await db.createIndex({
        index: { fields: ['capture_time'] }
      })
      let selector = {}
      if (collection) selector.collection = { $regex: `.*${collection}.*` }
      let records = await db.find({
        selector,
        fields: ['_id', 'name', 'url', 'collections', 'cases', "c_time", "owner_id"],
        sort: ['capture_time']
      });
      this.records = records.docs;
      console.log(this.records)
    },
    handleCollectionChange() { }
  },
  mounted() {
    checkEnv();
    loadRecords();
  }
};
Vue.config.productionTip = false;
Vue.use(SemanticUIVue);

new Vue({
  render: (h) => h(App),
}).$mount("#app");