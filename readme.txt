npm i
npm run serve

=================================
router/index.js
  将redirect: '/login' 改为 redirect: '/home'，
    将Mqtt.vue下 host改为本地
         data() {
        return {
            connection: {
                host: "127.0.0.1",
  这样运行后， 在http://localhost:8080/下可发布和订阅
=====================================================
node -v 以及 npm -v
npm install -g rimraf
rimraf node_modules
npm install -g cnpm --registry=https://registry.npm.taobao.org
npm install sass -g  --registry=https://registry.npm.taobao.org

hello:
npm i -g vue
npm install -g @vue/cli --registry=https://registry.npm.taobao.org
npm install -g webpack --registry=https://registry.npm.taobao.org
vue create hello-world
npm run serve


