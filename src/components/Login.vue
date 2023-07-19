<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/user.jpg" alt="" />
            </div>
            <!-- 登录表单区域 -->
            <el-form
                ref="loginFormRef"
                :model="loginFrom"
                :rules="loginFromRules"
                label-width="0px"
                class="login_form"
            >
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input
                        v-model="loginFrom.username"
                        prefix-icon="iconfont icon-user"
                    ></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input
                        v-model="loginFrom.password"
                        prefix-icon="iconfont icon-suo"
                        show-password
                    ></el-input>
                </el-form-item>
                <!-- 按钮区域 -->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm"
                        >重置</el-button
                    >
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import mqtt from 'mqtt';
export default {
    data() {
        return {
            connection: {
                host: "192.168.1.154",
                port: 8083,
                endpoint: "/mqtt",
                clean: true, // 保留会话
                connectTimeout: 4000, // 超时时间
                reconnectPeriod: 0, // 重连时间间隔
                // 认证信息
                clientId: "mqttjs_3be2c321",
                username: "emqx_test",
                password: "emqx_test",
            },
            subscription: {
                topicOne: "showOne",
                topicTwo: "showTwo",
                topicThree: "card",
                qos1: 0,
                qos2: 0,
                qos3: 0,
            },
            receiveNews: "",
            //登录表单数据绑定对象
            loginFrom: {
                username: "admin",
                password: "123456",
            },
            created() {
                this.getAllMqttDate();
            },
            //表单验证规则对象
            loginFromRules: {
                // 用户名验证
                username: [
                    {
                        required: true,
                        message: "请输入用户名",
                        trigger: "blur",
                    },
                    {
                        min: 3,
                        max: 10,
                        message: "长度在 3 到 10 个字符",
                        trigger: "blur",
                    },
                ],
                // 密码验证
                password: [
                    {
                        required: true,
                        message: "请输入登录密码",
                        trigger: "blur",
                    },
                    {
                        min: 6,
                        max: 15,
                        message: "长度在 6 到 15 个字符",
                        trigger: "blur",
                    },
                ],
            },
        };
    },
    methods: {
        createConnection() {
            // 主机号 端口号 端点 和其他选项
            const { host, port, endpoint, ...options } = this.connection;
            const connectUrl = `ws://${host}:${port}${endpoint}`;
            try {
                // 创建一个mqtt客户端对象
                this.client = mqtt.connect(connectUrl, options);
                // this.connected = true;
                // 连接成功后 自动订阅所有的串口
                this.doSubscribe();
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
        doSubscribe() {
            const { topicOne, qos1 } = this.subscription;
            this.client.subscribe(topicOne, { qos1 }, (error, res) => {
                if (error) {
                    console.log("Subscribe to topics error", error);
                    return;
                }
                // this.subscribeSuccess = true;
                console.log("Subscribe to topics res", res);
            });

            const { topicTwo, qos2 } = this.subscription;
            this.client.subscribe(topicTwo, { qos2 }, (error, res) => {
                if (error) {
                    console.log("Subscribe to topics error", error);
                    return;
                }
                // this.subscribeSuccess = true;
                console.log("Subscribe to topics res", res);
            });

            const { topicThree, qos3 } = this.subscription;
            this.client.subscribe(topicThree, { qos3 }, (error, res) => {
                if (error) {
                    console.log("Subscribe to topics error", error);
                    return;
                }
                // this.subscribeSuccess = true;
                console.log("Subscribe to topics res", res);
            });
        },
        resetLoginForm() {
            this.$refs.loginFormRef.resetFields();
        },
        login() {
            this.$refs.loginFormRef.validate(async (valid, object) => {
                if (!valid) return;
                const { data: res } = await this.$http.post(
                    "login",
                    this.loginFrom
                );
                if (res.code !== 200)
                    return this.$message.error("登录失败");
                // createConnection();
                this.createConnection();
                // this.doSubscribe();
                this.$message.success("登录成功");
                this.$router.push("/home")
                return
            });
        },
        async getAllMqttDate() {
            // 调用this.$http.get方法，传入"mqtt"作为参数，发送一个GET请求，并等待响应，将响应的数据赋值给res
            const { data: res1 } = await this.$http.get("mqtt?msg=showOne");
            const { data: res2 } = await this.$http.get("mqtt?msg=showTwo");
            const { data: res3 } = await this.$http.get("mqtt?msg=card");
            if (res1.code !== 200) {
                return console.log("获取所有mqtt数据失败！");
            }
            // 定义一个变量mqttdata，赋值为res的data属性
            let mqttdata1 = res1.data;
            let mqttdata2 = res2.data;
            let mqttdata3 = res4.data;
            let dispalydata = [];
            let times1 = [];
            let times2 = [];
            let temps = [];
            let humis = [];
            let lights = [];
            let flag = false;
            // 判断mqttdata[item]的imei属性是否等于"shdhello"，如果是，就将它的temp属性转换为数字并添加到temps数组中，将它的humi属性转换为数字并添加到humis数组中，将它的time属性添加到times数组中，将它本身添加到dispalydata数组中
            for (let item in mqttdata1) {
                if (mqttdata1[item].imei == "showOne") {
                    temps.push(Number(mqttdata1[item].temp));
                    humis.push(Number(mqttdata1[item].humi));
                    times1.push(mqttdata1[item].time);
                    dispalydata.push(mqttdata1[item]);
                }
            }
            for (let item in mqttdata2) {
                if (mqttdata2[item].imei == "showTwo") {
                    lights.push(Number(mqttdata2[item].light))
                    times2.push(mqttdata2[item].time);
                }
            }
        },
    },
};
</script>
// scoped代表只渲染当前组件
<style lang="less" scoped>
.login_container {
    background-color: #2b4b6b;
    height: 100%;
}
.login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 3px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    .avatar_box {
        height: 130px;
        width: 130px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;
        img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background-color: #eee;
        }
    }
}

.login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
}
.btns {
    display: flex;
    justify-content: flex-end;
}

</style>
