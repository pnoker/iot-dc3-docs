(window.webpackJsonp=window.webpackJsonp||[]).push([[23],{719:function(t,s,a){"use strict";a.r(s);var e=a(62),r=Object(e.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h3",{attrs:{id:"dc3-modbus-tcp-驱动模块"}},[t._v("DC3 Modbus Tcp 驱动模块 "),s("a",{staticClass:"header-anchor",attrs:{href:"#dc3-modbus-tcp-驱动模块"}},[t._v("#")])]),t._v(" "),s("div",{staticClass:"custom-block warning"},[s("p",{staticClass:"custom-block-title"},[t._v("WARNING")]),t._v(" "),s("p",[t._v("当前文档可能落后于最新版本,具体请以代码为准")])]),t._v(" "),s("blockquote",[s("p",[s("strong",[t._v("位置")]),t._v("：iot-dc3\\dc3-driver\\dc3-driver-modbus-tcp")]),t._v(" "),s("p",[s("strong",[t._v("依赖服务")]),t._v("（参考Idea开发环境启动即可）：dc3-mysql、dc3-mongo、dc3-redis、dc3-rabbitmq、dc3-center-register、dc3-center-manager、dc3-center-data、dc3-center-auth、dc3-center-gateway、dc3-web")]),t._v(" "),s("p",[s("strong",[t._v("开源工具")]),t._v("：Spring Cloud、Modbus4j")]),t._v(" "),s("p",[s("strong",[t._v("Modbus Tcp")]),t._v("：MODBUS/TCP 使 MODBUS_RTU 协议运行于以太网，MODBUS TCP使用 TCP/IP 和以太网在站点间传送 MODBUS 报文，MODBUS TCP 结合了以太网物理网络和网络标准 TCP/IP以及以 MODBUS 作为应用协议标准的数据表示方法。MODBUS TCP 通信报文被封装于以太网 TCP/IP 数据包中。与传统的串口方式，MODBUS TCP 插入一个标准的 MODBUS 报文到 TCP 报文中，不再带有数据校验和地址。")])]),t._v(" "),s("h3",{attrs:{id:"配置文件"}},[t._v("配置文件 "),s("a",{staticClass:"header-anchor",attrs:{href:"#配置文件"}},[t._v("#")])]),t._v(" "),s("blockquote",[s("p",[s("strong",[t._v("位置")]),t._v("：iot-dc3\\dc3-driver\\dc3-driver-modbus-tcp\\src\\main\\resources\\application.yml")])]),t._v(" "),s("h4",{attrs:{id:"_1-driver-driver-attribute"}},[t._v("1. driver.driver-attribute "),s("a",{staticClass:"header-anchor",attrs:{href:"#_1-driver-driver-attribute"}},[t._v("#")])]),t._v(" "),s("blockquote",[s("p",[s("em",[t._v("driver-attribute 用于配置连接一个 Modbus Tcp 服务所需要的基本参数")])]),t._v(" "),s("p",[s("strong",[t._v("连接一个 Modbus Tcp 服务需要：主机、端口，那么 "),s("code",[t._v("dc3-modbus-tcp")]),t._v(" 驱动模块此处的 "),s("code",[t._v("driver-attribute")]),t._v(" 就应该如下：")])])]),t._v(" "),s("div",{staticClass:"language-yaml extra-class"},[s("pre",{pre:!0,attrs:{class:"language-yaml"}},[s("code",[t._v("  "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("driver-attribute")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("displayName")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 主机\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" host\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" string\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" localhost\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("description")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Modbus IP\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("displayName")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 端口\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" port\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" int\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("502")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("description")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" Modbus Port\n")])])]),s("h4",{attrs:{id:"_2-driver-point-attribute"}},[t._v("2. driver.point-attribute "),s("a",{staticClass:"header-anchor",attrs:{href:"#_2-driver-point-attribute"}},[t._v("#")])]),t._v(" "),s("blockquote",[s("p",[s("em",[t._v("point-attribute 用于配置读取一个 Modbus Tcp 点位值所需要的基本参数")])]),t._v(" "),s("p",[s("strong",[t._v("读取一个 Modbus Tcp 服务的点位值需要：从站编号、功能码、偏移量信息，那么  "),s("code",[t._v("dc3-modbus-tcp")]),t._v(" 驱动模块此处的 "),s("code",[t._v("point-attribute")]),t._v(" 就应该如下:")])])]),t._v(" "),s("div",{staticClass:"language-yaml extra-class"},[s("pre",{pre:!0,attrs:{class:"language-yaml"}},[s("code",[t._v("  "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("point-attribute")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("displayName")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 从站编号\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" slaveId\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" int\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("description")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 从站编号\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("displayName")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 功能码\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" functionCode\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" int\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("1")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("description")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 功能码 "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("[")]),t._v("1、2、3、4"),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("]")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("-")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("displayName")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 偏移量\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("name")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" offset\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("type")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" int\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("value")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token number"}},[t._v("0")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("description")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" 偏移量\n")])])]),s("h4",{attrs:{id:"_3-driver-schedule"}},[t._v("3. driver.schedule "),s("a",{staticClass:"header-anchor",attrs:{href:"#_3-driver-schedule"}},[t._v("#")])]),t._v(" "),s("blockquote",[s("p",[s("em",[t._v("schedule 用于设置 读 和 自定义方法的调度")])]),t._v(" "),s("p",[s("strong",[t._v("read")]),t._v("：用于配置周期性调用 iot-dc3\\dc3-driver\\dc3-driver-modbus-tcp\\src\\main\\java\\com\\dc3\\driver\\service\\impl\\CustomDriverServiceImpl.java （read方法）")]),t._v(" "),s("p",[s("strong",[t._v("custom")]),t._v("：用于配置周期性调用 iot-dc3\\dc3-driver\\dc3-driver-modbus-tcp\\src\\main\\java\\com\\dc3\\driver\\service\\impl\\CustomDriverServiceImpl.java（schedule方法）")]),t._v(" "),s("p",[s("strong",[t._v("enable")]),t._v("：是否启动")]),t._v(" "),s("p",[s("strong",[t._v("corn")]),t._v("：corn 表达式，用于设置调度规则")])]),t._v(" "),s("div",{staticClass:"language-yaml extra-class"},[s("pre",{pre:!0,attrs:{class:"language-yaml"}},[s("code",[t._v("  "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("schedule")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("read")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("enable")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean important"}},[t._v("true")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("corn")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'0/30 * * * * ?'")]),t._v("\n    "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("custom")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("enable")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),s("span",{pre:!0,attrs:{class:"token boolean important"}},[t._v("true")]),t._v("\n      "),s("span",{pre:!0,attrs:{class:"token key atrule"}},[t._v("corn")]),s("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v("  "),s("span",{pre:!0,attrs:{class:"token string"}},[t._v("'0/5 * * * * ?'")]),t._v("\n")])])]),s("h3",{attrs:{id:"小试牛刀"}},[t._v("小试牛刀 "),s("a",{staticClass:"header-anchor",attrs:{href:"#小试牛刀"}},[t._v("#")])]),t._v(" "),s("h4",{attrs:{id:"_1-启动依赖服务"}},[t._v("1. 启动依赖服务 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_1-启动依赖服务"}},[t._v("#")])]),t._v(" "),s("ul",[s("li",[t._v("参考Idea开发环境启动 dc3-mysql、dc3-mongo、dc3-redis、dc3-rabbitmq、dc3-center-register、dc3-center-manager、dc3-center-data、dc3-center-auth、dc3-web")]),t._v(" "),s("li",[t._v("启动 dc3-driver-modbus-tcp")])]),t._v(" "),s("h4",{attrs:{id:"_2-启动-modbus-tcp-调试工具"}},[t._v("2. 启动 Modbus Tcp 调试工具 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_2-启动-modbus-tcp-调试工具"}},[t._v("#")])]),t._v(" "),s("p",[t._v("安装并启动 Modbus Slave 软件")]),t._v(" "),s("p",[t._v("下载链接："),s("a",{attrs:{href:"https://pan.baidu.com/s/1fwRjc1Im1pIZfV9nLwjtbg",target:"_blank",rel:"noopener noreferrer"}},[t._v("百度云盘 Modbus Slave"),s("OutboundLink")],1)]),t._v(" "),s("p",[t._v("验证码："),s("code",[t._v("eatt")])]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-2.png",alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_3-驱动"}},[t._v("3. 驱动 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_3-驱动"}},[t._v("#")])]),t._v(" "),s("p",[t._v("切换到 ''"),s("strong",[t._v("驱动")]),t._v('" 菜单，当前 '),s("code",[t._v("Modbus Tcp")]),t._v(" 启动启动成功，并处于 "),s("strong",[t._v("在线")]),t._v(" 状态")]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-3.png",alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_4-驱动属性"}},[t._v("4. 驱动属性 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_4-驱动属性"}},[t._v("#")])]),t._v(" "),s("p",[t._v("切换到 ''"),s("strong",[t._v("驱动属性")]),t._v('" 菜单，当前 驱动属性 列表如下')]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-4.png",alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_5-位号属性"}},[t._v("5. 位号属性 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_5-位号属性"}},[t._v("#")])]),t._v(" "),s("p",[t._v("切换到 “"),s("strong",[t._v("位号属性")]),t._v("” 菜单，当前 位号属性 列表如下")]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-5.png",alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_6-模板"}},[t._v("6. 模板 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_6-模板"}},[t._v("#")])]),t._v(" "),s("p",[t._v("切换到 “"),s("strong",[t._v("模板")]),t._v("” 菜单，新建一个 "),s("code",[t._v("私有")]),t._v(" 的 "),s("code",[t._v("ModbusTcpProfile")]),t._v(" 模板，如下")]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-6.png",alt:""}})]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-7.png",alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_7-驱动配置"}},[t._v("7. 驱动配置 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_7-驱动配置"}},[t._v("#")])]),t._v(" "),s("p",[t._v("切换到 “"),s("strong",[t._v("驱动配置")]),t._v("” 菜单，为刚刚新建的 "),s("code",[t._v("模板")]),t._v(" 配置一个连接到 "),s("code",[t._v("第2步启动的 Modbus Tcp 模拟服务")]),t._v(" 的驱动配置，如下")]),t._v(" "),s("ul",[s("li",[s("strong",[t._v("主机")]),t._v(" 属性值为："),s("code",[t._v("localhost")]),t._v("，以 "),s("code",[t._v("Modbus Slave")]),t._v(" 启动为主")])]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-8.png",alt:""}})]),t._v(" "),s("ul",[s("li",[s("strong",[t._v("端口")]),t._v(" 属性值为："),s("code",[t._v("502")]),t._v("，以 "),s("code",[t._v("Modbus Slave")]),t._v(" 启动为主")])]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-9.png",alt:""}})]),t._v(" "),s("ul",[s("li",[t._v("以上的 主机和端口均配置完之后，列表如下")])]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-10.png",alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_8-位号"}},[t._v("8. 位号 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_8-位号"}},[t._v("#")])]),t._v(" "),s("p",[t._v("切换到 “"),s("strong",[t._v("位号")]),t._v("” 菜单，为刚刚新建的 "),s("code",[t._v("模板")]),t._v(" 配置待读取的 位号，这里以一个 "),s("code",[t._v("Integer")]),t._v(" 类型的为例，如下")]),t._v(" "),s("blockquote",[s("p",[t._v("同时也需要在 Modbus Slave 软件中设置一下")])]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-20.png",alt:""}}),t._v(" "),s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-21.png",alt:""}}),t._v(" "),s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-11.png",alt:""}})]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-12.png",alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_9-分组"}},[t._v("9. 分组 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_9-分组"}},[t._v("#")])]),t._v(" "),s("p",[t._v("切换到 “"),s("strong",[t._v("分组")]),t._v("” 菜单，新建一个设备分组，如下")]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-13.png",alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_10-设备"}},[t._v("10. 设备 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_10-设备"}},[t._v("#")])]),t._v(" "),s("p",[t._v("切换到 “"),s("strong",[t._v("设备")]),t._v("” 菜单，在刚刚新建的分组下，新建一个设备，如下")]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-14.png",alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_11-位号配置"}},[t._v("11. 位号配置 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_11-位号配置"}},[t._v("#")])]),t._v(" "),s("p",[t._v("切换到 “"),s("strong",[t._v("位号配置")]),t._v("” 菜单，为新建的 "),s("code",[t._v("设备")]),t._v(" ，配置 "),s("code",[t._v("位号")]),t._v(" 的的 "),s("strong",[t._v("属性值")]),t._v("，从而是 "),s("code",[t._v("dc3-modbus-tcp")]),t._v(" 模块能读取到 "),s("code",[t._v("Modbus Slave")]),t._v(" 软件中的真实点位值，如下")]),t._v(" "),s("ul",[s("li",[s("strong",[t._v("从站编号")]),t._v("：第8步骤中的 "),s("code",[t._v("ID")]),t._v(" 值")])]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-15.png",alt:""}})]),t._v(" "),s("ul",[s("li",[s("strong",[t._v("功能码")]),t._v("：第8步骤中的 "),s("code",[t._v("F")]),t._v(" 值")])]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-16.png",alt:""}})]),t._v(" "),s("ul",[s("li",[s("strong",[t._v("偏移量")]),t._v("：第8步骤中的 "),s("code",[t._v("0-9")]),t._v(" 值")])]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-17.png",alt:""}})]),t._v(" "),s("ul",[s("li",[t._v("以上的 命名空间和位号均配置完之后，列表如下")])]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-18.png",alt:""}})]),t._v(" "),s("h4",{attrs:{id:"_12-数据"}},[t._v("12. 数据 "),s("a",{staticClass:"header-anchor",attrs:{href:"#_12-数据"}},[t._v("#")])]),t._v(" "),s("p",[t._v("切换到 “数据” 菜单，30秒左右会采集一个值")]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/modbus/modbus-tcp-19.png",alt:""}})])])}),[],!1,null,null,null);s.default=r.exports}}]);