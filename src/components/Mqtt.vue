<template>
    <div class="home-container">
        <!-- 
            引用词是 configForRef
            hide-required-asterisk 表示表单必填项的星号不显示
            label-position 表单标签的位置
         -->
        <el-form
            ref="configFormRef"
            hide-required-asterisk
            size="small"
            label-position="top"
            :model="connection"
        >
            <!-- 
                gutter 行中的列的间隔，这里为20px
                justify 行中的列在水平方向上居中对齐
                align 行中的列在垂直方向上居中对齐
             -->
            <el-row :gutter="20" justify="center" align="middle">
                <!-- 列占据了24个栅格 -->
                <el-col :span="24"> 
                        <el-button
                            size="small"
                            class="conn-btn"
                            style="margin-right: 20px"
                            :disabled="connected"
                            @click="createConnection"
                        >
                            {{ connected ? "Connected" : "Connect" }}
                        </el-button>

                        <el-button
                            v-if="connected"
                            size="small"
                            class="conn-btn"
                            @click="destroyConnection"
                        >
                            Disconnect
                        </el-button>
                    </el-col>
                <el-col :span="8"> 
                    <div class="tempTable" ref="tempTableRef" style="width: 300px; height: 300px;">
                    </div>
                </el-col>
                <el-col :span="8">
                    <div class="humiTable" ref="humiTableRef" style="width:300px; height: 300px;"></div>
                </el-col>
                <el-col :span="8">
                    <div class="lightTable" ref="lightTableRef" style="width: 300px; height: 300px;"></div>
                </el-col>
            </el-row>
        </el-form>

        <!-- 引用dataDisplayRef用于显示图表 -->
        <div
            class="dataDisplay"
            ref="dataDisplayRef"
            style="width: 600px; height: 425px"
        ></div>
        <div
            class="dataDisplay2"
            ref="dataDisplayRef2"
            style="width: 600px; height: 425px"
        ></div>
    </div>
</template>

<script>
import mqtt from "mqtt";
export default {
    name: "Mqtt",

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
            publish: {
                topic: "con",
                qos: 0,
                payload:
                    '{"status":"ok","data":[{"imei":"conTwo","LED":"1"}]}',
            },
            receiveNews:"",

            connected: false,
            // subscribeSuccess: false,
            chart1: null,
            chart2: null,
            chart3: null,
            chart4: null,
            chart5: null,
            option_chart1: {},
            option_chart2: {},
            option_chart3: {},
            option_chart4: {},
            option_chart5: {},
        };
    },
    created() {
        this.getAllMqttDate();
    },
    mounted() {},
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
        // 订阅主题
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
        // 取消订阅
        doUnSubscribe() {
            const { topic } = this.subscription;
            this.client.unsubscribe(topic, (error) => {
                if (error) {
                    console.log("Unsubscribe error", error);
                }
            });
            // this.subscribeSuccess = false;
        },
        // 发送消息
        doPublish() {
            // 主题 服务质量 有效载荷
            const { topic, qos, payload } = this.publish;
            this.client.publish(topic, payload, qos, (error) => {
                if (error) {
                    console.log("Publish error", error);
                } else {
                    // 解析json对象 并提取data信息
                    let data = JSON.parse(this.publish.payload);
                    let { data: res } = data;
                    //this.addMqtt(res[0]);
                }
            });
        },
        // 断开连接
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
        getPage1() {
            // 定义了一个变量bar_mqtt，用它来获取页面上的一个元素，这个元素的引用是dataDisplayRef
            let bar_mqtt = this.$refs.dataDisplayRef;
            if (bar_mqtt) {
                // 调用this.$echarts.init方法，传入bar_mqtt和"dark"作为参数，返回一个图表对象，并赋值给this.chart。
                this.chart1 = this.$echarts.init(
                    this.$refs.dataDisplayRef,
                    "dark"
                );
                // 调用this.chart.setOption方法，传入this.option_chart作为参数，设置图表的选项
                this.chart1.setOption(this.option_chart1);
            } else {
            }  
        },
        getPage2() {
            // 2号办公室
            let bar_mqtt = this.$refs.dataDisplayRef2;
            if (bar_mqtt) {
                this.chart2 = this.$echarts.init(
                    this.$refs.dataDisplayRef2, "dark"
                );
                this.chart2.setOption(this.option_chart2);
            } else {

            }
        },
        getPage3() {
            // 2号办公室
            let bar_mqtt = this.$refs.tempTableRef;
            if (bar_mqtt) {
                this.chart3 = this.$echarts.init(
                    this.$refs.tempTableRef, "dark"
                );
                this.chart3.setOption(this.option_chart3);
            } else {

            }
        },
        // 发送数据至后端
        // 调用this.$http.post方法，传入"addmqtt"和一个包含iemi、temp、humi属性的对象作为参数，发送一个POST请求，并等待响应，将响应的数据赋值给res
        async addMqtt(obj) {
            const { data: res } = await this.$http.post("addmqtt", {
                iemi: obj.imei,
                temp: obj.temp,
                humi: obj.humi,
                illu: obj.illu,
            });
            // 打印res到控制台
            console.log(res);
            if (res.code !== 200) {
                return;
            }
            //this.getAllMqttDate()
        },
        async getAllMqttDate() {
            // 调用this.$http.get方法，传入"mqtt"作为参数，发送一个GET请求，并等待响应，将响应的数据赋值给res
            const { data: res1 } = await this.$http.get("mqtt?msg=showOne");
            const { data: res2 } = await this.$http.get("mqtt?msg=showTwo");
            if (res1.code !== 200) {
                return console.log("获取所有mqtt数据失败！");
            }
            // 定义一个变量mqttdata，赋值为res的data属性
            let mqttdata1 = res1.data;
            let mqttdata2 = res2.data;
            let dispalydata = [];
            let times1 = [];
            let times2 = [];
            let temps = [];
            let humis = [];
            let lights = [];
            let flag = false;
            let tempNow;
            let humiNow;
            let lightNow;
            // 判断mqttdata[item]的imei属性是否等于"shdhello"，如果是，就将它的temp属性转换为数字并添加到temps数组中，将它的humi属性转换为数字并添加到humis数组中，将它的time属性添加到times数组中，将它本身添加到dispalydata数组中
            for (let item in mqttdata1) {
                if (mqttdata1[item].imei == "showOne") {
                    temps.push(Number(mqttdata1[item].temp));
                    humis.push(Number(mqttdata1[item].humi));
                    times1.push(mqttdata1[item].time);
                    tempNow = mqttdata1[item].temp;
                    humiNow = mqttdata1[item].humi;
                    dispalydata.push(mqttdata1[item]);
                }
            }
            for (let item in mqttdata2) {
                if (mqttdata2[item].imei == "showTwo") {
                    lights.push(Number(mqttdata2[item].light))
                    lightNow = Number(mqttdata2[item].light);
                    if (lightNow < 60) flag=true;
                    times2.push(mqttdata2[item].time);
                }
            }
            // 设置图表
            this.option_chart1 = {
                title: {
                    text: "1号车间实时环境监测表",
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: {
                            backgroundColor: "#283b56",
                        },
                    },
                },
                legend: {
                    data: ["温度", "湿度"],
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { readOnly: false },
                        restore: {},
                        saveAsImage: {},
                    },
                },
                dataZoom: {
                    show: false,
                    start: 0,
                    end: 100,
                },
                xAxis: [
                    {
                        type: "category",
                        boundaryGap: false,
                        data: times1,
                    },
                    {
                        type: "category",
                        boundaryGap: true,
                        data: times1,
                        show: false,
                    },
                ],
                yAxis: [
                    {
                        type: "value",
                        scale: true,
                        name: "湿度",
                        max: 100,
                        min: 0,
                    },
                    {
                        type: "value",
                        scale: true,
                        name: "温度",
                        max: 50,
                        min: 0,
                    },
                ],
                series: [
                    {
                        name: "温度",
                        type: "bar",
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: temps,
                    },
                    {
                        name: "湿度",
                        type: "line",
                        data: humis,
                    },
                ],
            };
            this.option_chart2 = {
                title: {
                    text: "2号车间实时环境监测表",
                },
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        type: "cross",
                        label: {
                            backgroundColor: "#283b56",
                        },
                    },
                },
                legend: {
                    data: ["光照强度",],
                },
                toolbox: {
                    show: true,
                    feature: {
                        dataView: { readOnly: false },
                        restore: {},
                        saveAsImage: {},
                    },
                },
                dataZoom: {
                    show: false,
                    start: 0,
                    end: 100,
                },
                xAxis: [
                    {
                        type: "category",
                        boundaryGap: false,
                        data: times2,
                    },
                    {
                        type: "category",
                        boundaryGap: true,
                        data: times2,
                        show: false,
                    },
                ],
                yAxis: [
                    {
                        type: "value",
                        scale: true,
                        name: "光照强度",
                        max: 1500,
                        min: 0,
                    },
                    {
                        type: "value",
                        scale: true,
                        name: "",
                        max: 1500,
                        min: 0,
                    },
                ],
                series: [
                    {
                        name: "光照强度",
                        type: "bar",
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: lights,
                    },
                ],
            };

            this.option_chart3 = {
                series: [
                    {
                        type: 'gauge',
                        center: ['50%', '60%'],
                        startAngle: 200,
                        endAngle: -20,
                        min: 0,
                        max: 60,
                        splitNumber: 12,
                        itemStyle: {
                            color: '#ff0000'
                        },
                        progress: {
                            show: true,
                            width: 15
                        },
                        pointer: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                width: 15
                            }
                        },
                        axisTick: {
                            distance: -22,
                            splitNumber: 5,
                            lineStyle: {
                                width: 2,
                                color: '#999'
                            }
                        },
                        splitLine: {
                            distance: -30,
                            length: 14,
                            lineStyle: {
                                width: 3,
                                color: '#999'
                            }
                        },
                        axisLabel: {
                            distance: -20,
                            color: '#999',
                            fontSize: 20
                        },
                        anchor: {
                            show: false
                        },
                        title: {
                            show: false
                        },
                        detail: {
                            valueAnimation: true,
                            width: '60%',
                            lineHeight: 40,
                            borderRadius: 8,
                            offsetCenter: [0, '-15%'],
                            fontSize: 50,
                            fontWeight: 'bolder',
                            formatter: '{value} °C',
                            color: 'inherit'
                        },
                        data: [
                            {
                                value: tempNow
                            }
                        ]
                    },
                ]
            };
            this.option_chart4 = {
                series: [
                    {
                        type: 'gauge',
                        center: ['50%', '60%'],
                        startAngle: 200,
                        endAngle: -20,
                        min: 0,
                        max: 100,
                        splitNumber: 4,
                        itemStyle: {
                            color: '#00ff00'
                        },
                        progress: {
                            show: true,
                            width: 15
                        },
                        pointer: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                width: 15
                            }
                        },
                        axisTick: {
                            distance: -22,
                            splitNumber: 5,
                            lineStyle: {
                                width: 2,
                                color: '#999'
                            }
                        },
                        splitLine: {
                            distance: -30,
                            length: 14,
                            lineStyle: {
                                width: 3,
                                color: '#999'
                            }
                        },
                        axisLabel: {
                            distance: -20,
                            color: '#999',
                            fontSize: 20
                        },
                        anchor: {
                            show: false
                        },
                        title: {
                            show: false
                        },
                        detail: {
                            valueAnimation: true,
                            width: '60%',
                            lineHeight: 40,
                            borderRadius: 8,
                            offsetCenter: [0, '-15%'],
                            fontSize: 50,
                            fontWeight: 'bolder',
                            formatter: '{value} %rh',
                            color: 'inherit'
                        },
                        data: [
                            {
                                value: humiNow
                            }
                        ]
                    },
                ]
            };
            this.option_chart5 = {
                series: [
                    {
                        type: 'gauge',
                        center: ['50%', '60%'],
                        startAngle: 200,
                        endAngle: -20,
                        min: 0,
                        max: 1500,
                        splitNumber: 5,
                        itemStyle: {
                            color: '#0000ff'
                        },
                        progress: {
                            show: true,
                            width: 15
                        },
                        pointer: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                width: 15
                            }
                        },
                        axisTick: {
                            distance: -22,
                            splitNumber: 5,
                            lineStyle: {
                                width: 2,
                                color: '#999'
                            }
                        },
                        splitLine: {
                            distance: -30,
                            length: 14,
                            lineStyle: {
                                width: 3,
                                color: '#999'
                            }
                        },
                        axisLabel: {
                            distance: -20,
                            color: '#999',
                            fontSize: 20
                        },
                        anchor: {
                            show: false
                        },
                        title: {
                            show: false
                        },
                        detail: {
                            valueAnimation: true,
                            width: '60%',
                            lineHeight: 40,
                            borderRadius: 8,
                            offsetCenter: [0, '-15%'],
                            fontSize: 60,
                            fontWeight: 'bolder',
                            formatter: '{value} lx',
                            color: 'inherit'
                        },
                        data: [
                            {
                                value: lightNow
                            }
                        ]
                    },
                ]
            };
            // 用this.$echarts.init方法创建一个图表对象，并传入this.$refs.dataDisplayRef和"dark"作为参数，然后用this.chart.setOption方法设置图表的选项，并传入this.option_chart作为参数。
            this.chart1 = this.$echarts.init(this.$refs.dataDisplayRef);
            this.chart1.setOption(this.option_chart1);
            this.chart2 = this.$echarts.init(this.$refs.dataDisplayRef2);
            this.chart2.setOption(this.option_chart2);
            this.chart3 = this.$echarts.init(this.$refs.tempTableRef);
            this.chart3.setOption(this.option_chart3);
            this.chart4 = this.$echarts.init(this.$refs.humiTableRef);
            this.chart4.setOption(this.option_chart4);
            this.chart5 = this.$echarts.init(this.$refs.lightTableRef);
            this.chart5.setOption(this.option_chart5);
            if (flag === true) {
                // flag = false;
                this.doPublish();
                flag = false;
            }
            return;
        },
    },
};
</script>

<style lang="less">
.home-container {
    margin: 0 auto;
    padding: 0;
    // background: url("../assets/firetree.jpg");
    background-color: white;
    background-size: 100% 100%;
    background-repeat: no-repeat;
    background-attachment: fixed;
    // overflow: hidden;
    .el-card {
        background: rgba(0, 0, 0, 0.4);
        color: #fff;
        border: none;
        margin: 0 20px 0 20px;
        h3 {
            color: #fff;
            background: rgba(0, 0, 0, 0.4);
            display: inline-block;
        }
    }
    .el-card__body {
        padding: 10px;
    }
    .el-form {
        padding-top: 20px;
        margin-left: 20px;
        margin-bottom: 20px;
        .el-form-item {
            color: #dda;
        }
    }
    .conn-btn {
        color: #fff;
        background: rgba(0, 0, 0, 0.4);
        border: none;
        font-size: 14px;
    }

    .publish-btn {
        margin-bottom: 20px;
        float: right;
    }
    .tempTable,
    .humiTable,
    .lightTable {
        margin: 20px 20px;
        float: left;
    }
    .dataDisplay {
        margin: 0 0 0 20px;
        float: left;
    }
    .dataDisplay2 {
        float: left;
        margin: 0 40px;
    }
}
</style>

