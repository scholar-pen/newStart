<template>
    <div class="home-container">
        <el-table
            :data="tableData"
            border
            height="100%"
            ref="table"
            style="width: 100%;">
            <el-table-column
              prop="time"
              label="日期"
              width="180">
            </el-table-column>
            <el-table-column
              prop="name"
              label="姓名"
              width="180">
            </el-table-column>
            <el-table-column
              prop="id"
              label="Ic卡号">
            </el-table-column>
        </el-table>
    </div>
</template>

<script>
import mqtt from "mqtt";
export default {
    name: "Mqtt",
    data() {
        return {
            tableData: [],
            connection: {
                host: "192.168.1.154",
                port: 8083,
                endpoint: "/mqtt",
                clean: true, // 保留会话
                connectTimeout: 4000, // 超时时间
                reconnectPeriod: 4000, // 重连时间间隔
                // 认证信息
                clientId: "mqttjs_3be2c321",
                username: "emqx_test",
                password: "emqx_test",
            },
            receiveNews: "",
            connected: false,
        };
    },
    created() {
        this.getAllMqttDate();
    },
    mounted() { },
    methods: {
        // 创建连接
        createConnection() {
            // 主机号 端口号 端点 和其他选项
            const { host, port, endpoint, ...options } = this.connection;
            const connectUrl = `ws://${host}:${port}${endpoint}`;
            try {
                // 创建一个mqtt客户端对象
                this.client = mqtt.connect(connectUrl, options);
                this.connected = true;
            } catch (error) {
                console.log("mqtt.connect error", error);
            }
            this.client.on("connect", () => {
                console.log("Connection succeeded!");
            });
            this.client.on("error", (error) => {
                console.log("Connection failed", error);
            });
            // 接收到消息时 将消息添加到receiveNews中
            this.client.on("message", (topic, message) => {
                this.receiveNews = this.receiveNews.concat(message);
                console.log(`Received message ${message} from topic ${topic}`);
                //let data = JSON.parse(message);
                //let { data: res } = data;
                //this.addMqtt(res[0]);                
                this.getAllMqttDate();
            });
        },
        destroyConnection() {
            if (this.connected) {
                try {
                    this.client.end();
                    this.connected = false;
                    // this.subscribeSuccess = false;
                    console.log("Successfully disconnected!");
                } catch (error) {
                    console.log("Disconnect failed", error.toString());
                }
            }
        },
        async getAllMqttDate() {
            // 调用this.$http.get方法，传入"mqtt"作为参数，发送一个GET请求，并等待响应，将响应的数据赋值给res
            const { data: res } = await this.$http.get("mqtt?msg=card");
            if (res.code !== 200) {
                return console.log("获取所有mqtt数据失败！");
            }
            // 定义一个变量mqttdata，赋值为res的data属性
            let mqttdata = res.data;
            // 判断mqttdata[item]的imei属性是否等于"shdhello"，如果是，就将它的temp属性转换为数字并添加到temps数组中，将它的humi属性转换为数字并添加到humis数组中，将它的time属性添加到times数组中，将它本身添加到dispalydata数组中
            for (let item in mqttdata) {
                if (mqttdata[item].imei === "card") {
                    this.tableData.push(mqttdata[item]);
                    this.$nextTick(function () {
                    });
                    // console.log(this.tableData[item]);
                }
            }
            return;
        },
    },
};
</script>

<style lang="less">
</style>

