Vue.component("SettingForm", {
    template: `
    <sui-form @submit="saveHandler">
      <sui-divider horizontal>Authorization</sui-divider>
      <sui-form-field>
        <label>Token</label>
        <textarea rows="2" type="text" name="token" placeholder="Paste your token here." v-model="token"></textarea>
      </sui-form-field>
      <sui-divider horizontal>Legacy Settings</sui-divider>
      <sui-form-field inline>
        <label>Block URL Param: </label>
        <input type="text" placeholder="mock_id" name="block_mock_key" v-model="block_mock_key" />
      </sui-form-field>
      <sui-form-field inline>
        <label>API Endpoint: </label>
        <input type="text" placeholder="Enter your Moker Server Domain" name="server" v-model="server" style="min-width: 400px;" />
      </sui-form-field>
      <sui-button :content="saveStatus ? 'Saved!' : 'Save'" type="submit" primary :positive="saveStatus" />
    </sui-form>`,
    name: 'SettingForm',
    data() {
      return {
        saveStatus: false,
        block_mock_key: "",
        server: "",
        token: ""
      };
    },
    mounted() {
      let config = loadConfig();
      this.block_mock_key = config.block_mock_key;
      this.server = config.server;
      this.token = config.token;
    },
    methods: {
      saveHandler(e) {
        e.preventDefault();
        const form = new FormData(e.target);
        const json = {};
        for (let pair of form.entries()) {
          json[pair[0]] = pair[1];
        }
        this.saveStatus = true;
        // valid & save
        updateConfig(json);
        setTimeout(() => {
          this.saveStatus = false;
        }, 1000);
      },
    },
  })
  
  // Settings - Save PrivateKey
  var App = {
    template: `<div><setting-form /></div>`,
    name: "App",
    data() {
      return {};
    },
    methods: {},
  };
  Vue.config.productionTip = false;
  Vue.use(SemanticUIVue);
  
  new Vue({
    render: (h) => h(App),
  }).$mount("#app");