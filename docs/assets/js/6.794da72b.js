(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{697:function(t,a,s){"use strict";s.r(a);var e=s(62),r=Object(e.a)({},(function(){var t=this,a=t._self._c;return a("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[a("div",{staticClass:"custom-block tip"},[a("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),a("p",[t._v("此处仅显示平台特殊配置项,其他基础设施配置项请参考相关文档")])]),t._v(" "),a("h2",{attrs:{id:"基础配置"}},[t._v("基础配置 "),a("a",{staticClass:"header-anchor",attrs:{href:"#基础配置"}},[t._v("#")])]),t._v(" "),a("h3",{attrs:{id:"influxdb"}},[t._v("influxdb "),a("a",{staticClass:"header-anchor",attrs:{href:"#influxdb"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("a-alert",{attrs:{type:"info"}},[a("span",{attrs:{slot:"message"},slot:"message"},[t._v("\n    位置：iot-dc3/dc3-common/dc3-common-influxdata/src/main/resources/application-influx.yml\n  ")])]),t._v(" "),a("h4",{attrs:{id:"url"}},[t._v("url "),a("a",{staticClass:"header-anchor",attrs:{href:"#url"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("http://${INFLUX_HOST:dc3-influx}:${INFLUX_PORT:8086}")])])]),t._v(" "),a("p",[t._v("influxdb http 地址")]),t._v(" "),a("h4",{attrs:{id:"organization"}},[t._v("organization "),a("a",{staticClass:"header-anchor",attrs:{href:"#organization"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("${INFLUX_ORG:dc3}")])])]),t._v(" "),a("p",[t._v("influxdb 默认组织")]),t._v(" "),a("h4",{attrs:{id:"bucket"}},[t._v("bucket "),a("a",{staticClass:"header-anchor",attrs:{href:"#bucket"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("${INFLUX_BUCKET:dc3}")])])]),t._v(" "),a("p",[t._v("influxdb 默认bucket")]),t._v(" "),a("h4",{attrs:{id:"token"}},[t._v("token "),a("a",{staticClass:"header-anchor",attrs:{href:"#token"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: 由系统生成")]),t._v(" "),a("li",[t._v("可选: "),a("code",[t._v("不能和username,password同时为空")])])]),t._v(" "),a("p",[t._v("influxdb http接口访问token,如果为空则平台在初始化的时候会自动生成并输出到控制台,请务必保留好")]),t._v(" "),a("h4",{attrs:{id:"username"}},[t._v("username "),a("a",{staticClass:"header-anchor",attrs:{href:"#username"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("dc3")])]),t._v(" "),a("li",[t._v("可选: "),a("code",[t._v("不能和token同时为空")])])]),t._v(" "),a("p",[t._v("influxdb web ui 登录用户名")]),t._v(" "),a("h4",{attrs:{id:"password"}},[t._v("password "),a("a",{staticClass:"header-anchor",attrs:{href:"#password"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("dc3")])]),t._v(" "),a("li",[t._v("可选: "),a("code",[t._v("不能和token同时为空")])])]),t._v(" "),a("p",[t._v("influxdb web ui 登录密码")]),t._v(" "),a("h3",{attrs:{id:"mqtt"}},[t._v("mqtt "),a("a",{staticClass:"header-anchor",attrs:{href:"#mqtt"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("a-alert",{attrs:{type:"info"}},[a("span",{attrs:{slot:"message"},slot:"message"},[t._v("\n    位置：iot-dc3/dc3-common/dc3-common-mqtt/src/main/resources/application-mqtt.yml\n  ")])]),t._v(" "),a("h4",{attrs:{id:"url-2"}},[t._v("url "),a("a",{staticClass:"header-anchor",attrs:{href:"#url-2"}},[t._v("#")])]),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("${MQTT_BROKER_URL:ssl://dc3-rabbitmq:8883}")])])]),t._v(" "),a("p",[t._v("mqtt服务器地址")]),t._v(" "),a("h4",{attrs:{id:"auth-type"}},[t._v("auth-type "),a("a",{staticClass:"header-anchor",attrs:{href:"#auth-type"}},[t._v("#")])]),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("X509")])])]),t._v(" "),a("p",[t._v("mqtt认证方式")]),t._v(" "),a("h4",{attrs:{id:"username-2"}},[t._v("username "),a("a",{staticClass:"header-anchor",attrs:{href:"#username-2"}},[t._v("#")])]),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("dc3")])])]),t._v(" "),a("p",[t._v("mqtt用户名")]),t._v(" "),a("h4",{attrs:{id:"password-2"}},[t._v("password "),a("a",{staticClass:"header-anchor",attrs:{href:"#password-2"}},[t._v("#")])]),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("dc3")])])]),t._v(" "),a("p",[t._v("mqtt密码")]),t._v(" "),a("h4",{attrs:{id:"ca-crt"}},[t._v("ca-crt "),a("a",{staticClass:"header-anchor",attrs:{href:"#ca-crt"}},[t._v("#")])]),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("classpath:/certs/ca.crt")])])]),t._v(" "),a("p",[t._v("mqtt ca证书路径")]),t._v(" "),a("h4",{attrs:{id:"client-crt"}},[t._v("client-crt "),a("a",{staticClass:"header-anchor",attrs:{href:"#client-crt"}},[t._v("#")])]),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("classpath:/certs/client.crt")])])]),t._v(" "),a("p",[t._v("mqtt client证书路径")]),t._v(" "),a("h4",{attrs:{id:"client-key"}},[t._v("client-key "),a("a",{staticClass:"header-anchor",attrs:{href:"#client-key"}},[t._v("#")])]),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("classpath:/certs/client.key")])])]),t._v(" "),a("p",[t._v("mqtt client key路径")]),t._v(" "),a("h4",{attrs:{id:"client-key-pass"}},[t._v("client-key-pass "),a("a",{staticClass:"header-anchor",attrs:{href:"#client-key-pass"}},[t._v("#")])]),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("dc3-client")])])]),t._v(" "),a("p",[t._v("mqtt client key密码")]),t._v(" "),a("h4",{attrs:{id:"receive-topics"}},[t._v("receive-topics "),a("a",{staticClass:"header-anchor",attrs:{href:"#receive-topics"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("p",[t._v("mqtt接收消息的topic")]),t._v(" "),a("p",[t._v("默认值:")]),t._v(" "),a("div",{staticClass:"language-yaml extra-class"},[a("pre",{pre:!0,attrs:{class:"language-yaml"}},[a("code",[a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("receive-topics")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("qos")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v("\n        "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" device/+\n")])])]),a("h4",{attrs:{id:"default-send-topic"}},[t._v("default-send-topic "),a("a",{staticClass:"header-anchor",attrs:{href:"#default-send-topic"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("p",[t._v("mqtt发送消息的默认topic")]),t._v(" "),a("p",[t._v("默认值:")]),t._v(" "),a("div",{staticClass:"language-yaml extra-class"},[a("pre",{pre:!0,attrs:{class:"language-yaml"}},[a("code",[a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("default-send-topic")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("qos")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" command\n")])])]),a("h4",{attrs:{id:"keep-alive"}},[t._v("keep-alive "),a("a",{staticClass:"header-anchor",attrs:{href:"#keep-alive"}},[t._v("#")])]),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("int")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("15")])])]),t._v(" "),a("p",[t._v("mqtt心跳时间")]),t._v(" "),a("h4",{attrs:{id:"completion-timeout"}},[t._v("completion-timeout "),a("a",{staticClass:"header-anchor",attrs:{href:"#completion-timeout"}},[t._v("#")])]),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("int")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("3000")])])]),t._v(" "),a("p",[t._v("mqtt连接超时时间")]),t._v(" "),a("h4",{attrs:{id:"batch"}},[t._v("batch "),a("a",{staticClass:"header-anchor",attrs:{href:"#batch"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("p",[t._v("mqtt批量发送消息的配置")]),t._v(" "),a("p",[t._v("默认值:")]),t._v(" "),a("div",{staticClass:"language-yaml extra-class"},[a("pre",{pre:!0,attrs:{class:"language-yaml"}},[a("code",[a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("batch")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("speed")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" $"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("MQTT_BATCH_SPEED"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("100")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("interval")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" $"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("MQTT_BATCH_INTERVAL"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("5")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v("\n")])])]),a("h2",{attrs:{id:"驱动配置"}},[t._v("驱动配置 "),a("a",{staticClass:"header-anchor",attrs:{href:"#驱动配置"}},[t._v("#")])]),t._v(" "),a("h3",{attrs:{id:"通用配置"}},[t._v("通用配置 "),a("a",{staticClass:"header-anchor",attrs:{href:"#通用配置"}},[t._v("#")])]),t._v(" "),a("h4",{attrs:{id:"driver-tenant"}},[t._v("driver.tenant "),a("a",{staticClass:"header-anchor",attrs:{href:"#driver-tenant"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("default")])])]),t._v(" "),a("p",[t._v("驱动所属租户")]),t._v(" "),a("h4",{attrs:{id:"driver-name"}},[t._v("driver.name "),a("a",{staticClass:"header-anchor",attrs:{href:"#driver-name"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])])]),t._v(" "),a("p",[t._v("驱动名称")]),t._v(" "),a("h4",{attrs:{id:"driver-code"}},[t._v("driver.code "),a("a",{staticClass:"header-anchor",attrs:{href:"#driver-code"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])])]),t._v(" "),a("p",[t._v("驱动代码")]),t._v(" "),a("h4",{attrs:{id:"driver-type"}},[t._v("driver.type "),a("a",{staticClass:"header-anchor",attrs:{href:"#driver-type"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])])]),t._v(" "),a("p",[t._v("驱动类型")]),t._v(" "),a("h4",{attrs:{id:"driver-remark"}},[t._v("driver.remark "),a("a",{staticClass:"header-anchor",attrs:{href:"#driver-remark"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("string")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("@project.description@")])])]),t._v(" "),a("p",[t._v("驱动备注")]),t._v(" "),a("h4",{attrs:{id:"driver-schedule-read"}},[t._v("driver.schedule.read "),a("a",{staticClass:"header-anchor",attrs:{href:"#driver-schedule-read"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("div",{staticClass:"language-yaml extra-class"},[a("pre",{pre:!0,attrs:{class:"language-yaml"}},[a("code",[a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("read")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("enable")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean important"}},[t._v("false")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 是否启用")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("corn")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'0/30 * * * * ?'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# corn表达式")]),t._v("\n")])])]),a("p",[t._v("驱动读取数据定时任务配置")]),t._v(" "),a("h4",{attrs:{id:"driver-schedule-custom"}},[t._v("driver.schedule.custom "),a("a",{staticClass:"header-anchor",attrs:{href:"#driver-schedule-custom"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("div",{staticClass:"language-yaml extra-class"},[a("pre",{pre:!0,attrs:{class:"language-yaml"}},[a("code",[a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("custom")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("enable")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token boolean important"}},[t._v("false")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 是否启用")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("corn")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[t._v("'0/5 * * * * ?'")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# corn表达式")]),t._v("\n")])])]),a("p",[t._v("驱动自定义定时任务配置")]),t._v(" "),a("h4",{attrs:{id:"driver-point-attribute"}},[t._v("driver.point-attribute "),a("a",{staticClass:"header-anchor",attrs:{href:"#driver-point-attribute"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("list")])])]),t._v(" "),a("div",{staticClass:"language-yaml extra-class"},[a("pre",{pre:!0,attrs:{class:"language-yaml"}},[a("code",[a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("point-attribute")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("display-name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 指令Topic "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 显示名称")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("attribute-name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" commandTopic "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 名称")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("attribute-type-flag")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" STRING "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 类型")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("default-value")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" commandTopic "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 默认值")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("remark")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 测点/设备接收下行指令的Mqtt主题 "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 备注")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("display-name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 指令Qos\n    "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("attribute-name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" commandQos\n    "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("attribute-type-flag")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" INT\n    "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("default-value")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("2")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("remark")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 测点/设备接收下行指令的Mqtt主题的Qos\n")])])]),a("p",[t._v("驱动点位属性配置,指一个位号在该驱动中读取到的数据需要配置什么,比如指令Topic,指令Qos等")]),t._v(" "),a("h4",{attrs:{id:"driver-driver-attribute"}},[t._v("driver.driver-attribute "),a("a",{staticClass:"header-anchor",attrs:{href:"#driver-driver-attribute"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("list")])])]),t._v(" "),a("div",{staticClass:"language-yaml extra-class"},[a("pre",{pre:!0,attrs:{class:"language-yaml"}},[a("code",[a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("driver-attribute")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("display-name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 主机 "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 显示名称")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("attribute-name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" host "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 名称")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("attribute-type-flag")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" STRING "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 类型")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("default-value")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" localhost  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 默认值")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("remark")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Opc Ua IP "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 备注")]),t._v("\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("display-name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 端口\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("attribute-name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" port\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("attribute-type-flag")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" INT\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("default-value")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token number"}},[t._v("18600")]),t._v("\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("remark")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Opc Ua Port\n    "),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("display-name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 路径\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("attribute-name")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" path\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("attribute-type-flag")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" STRING\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("default-value")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" /\n      "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("remark")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Opc Ua Path\n")])])]),a("p",[t._v("驱动属性配置,指一个驱动下的设备需要配置什么"),a("code",[t._v("共同配置")]),t._v(","),a("strong",[t._v("注意此处的共同配置指共同的key,不代表共同的vlaue")]),t._v(",比如Opc Ua的IP,Port,Path等")]),t._v(" "),a("h3",{attrs:{id:"本地开发"}},[t._v("本地开发 "),a("a",{staticClass:"header-anchor",attrs:{href:"#本地开发"}},[t._v("#")])]),t._v(" "),a("a-alert",{attrs:{type:"info"}},[a("span",{attrs:{slot:"message"},slot:"message"},[t._v("\n    实现原理:iot-dc3/dc3-common/dc3-common-rabbitmq/src/main/java/io/github/pnoker/common/config/RabbitmqEnvironmentConfig.java\n  ")])]),t._v(" "),a("div",{staticClass:"language-yaml extra-class"},[a("pre",{pre:!0,attrs:{class:"language-yaml"}},[a("code",[a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("spring")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 当开启env和group时，需要本地启动auth，manager和data服务")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("env")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" dev "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 分发的环境")]),t._v("\n  "),a("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("group")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" $"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("user.name"),a("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),a("span",{pre:!0,attrs:{class:"token comment"}},[t._v("# 分发的分组")]),t._v("\n")])])]),a("p",[t._v("使用场景:多人开发驱动时,为了更好的调试驱动,可以启用该配置,该配置会将驱动相关的消息发送到本地的data服务进行消费")]),t._v(" "),a("h3",{attrs:{id:"lwm2m"}},[t._v("Lwm2m "),a("a",{staticClass:"header-anchor",attrs:{href:"#lwm2m"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("a-alert",{attrs:{type:"info"}},[a("span",{attrs:{slot:"message"},slot:"message"},[t._v("\n    位置：iot-dc3\\dc3-driver\\dc3-driver-lwm2m\\src\\main\\resources\\application.yml\n  ")])]),t._v(" "),a("h4",{attrs:{id:"custom-coap-port"}},[t._v("custom.coap.port "),a("a",{staticClass:"header-anchor",attrs:{href:"#custom-coap-port"}},[t._v("#")])]),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("int")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("5683")])])]),t._v(" "),a("p",[t._v("CoAP端口")]),t._v(" "),a("h4",{attrs:{id:"custom-coaps-port-未启用"}},[t._v("custom.coaps.port "),a("a-tag",{attrs:{color:"orange"}},[t._v("未启用")]),t._v(" "),a("a",{staticClass:"header-anchor",attrs:{href:"#custom-coaps-port-未启用"}},[t._v("#")])],1),t._v(" "),a("p"),t._v(" "),a("ul",[a("li",[t._v("类型: "),a("code",[t._v("int")])]),t._v(" "),a("li",[t._v("默认值: "),a("code",[t._v("5684")])])]),t._v(" "),a("p",[t._v("CoAPS端口,加密端口")])],1)}),[],!1,null,null,null);a.default=r.exports}}]);