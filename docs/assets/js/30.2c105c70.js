(window.webpackJsonp=window.webpackJsonp||[]).push([[30],{722:function(t,s,a){"use strict";a.r(s);var v=a(62),r=Object(v.a)({},(function(){var t=this,s=t._self._c;return s("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[s("h1",{attrs:{id:"listeningvirtual-驱动"}},[t._v("ListeningVirtual 驱动 "),s("a",{staticClass:"header-anchor",attrs:{href:"#listeningvirtual-驱动"}},[t._v("#")])]),t._v(" "),s("div",{staticClass:"custom-block tip"},[s("p",{staticClass:"custom-block-title"},[t._v("TIP")]),t._v(" "),s("p",[t._v("Tcp/Udp驱动")])]),t._v(" "),s("h2",{attrs:{id:"基础说明"}},[t._v("基础说明 "),s("a",{staticClass:"header-anchor",attrs:{href:"#基础说明"}},[t._v("#")])]),t._v(" "),s("blockquote",[s("p",[s("strong",[t._v("位置")]),t._v("：iot-dc3\\dc3-driver\\dc3-driver-listening-virtual")]),t._v(" "),s("p",[s("strong",[t._v("相关配置项")]),t._v(": "),s("RouterLink",{attrs:{to:"/config/#listeningvirtual"}},[t._v("详情")])],1)]),t._v(" "),s("h2",{attrs:{id:"报文格式"}},[t._v("报文格式 "),s("a",{staticClass:"header-anchor",attrs:{href:"#报文格式"}},[t._v("#")])]),t._v(" "),s("blockquote",[s("p",[t._v("本示范中使用报文（设备名称[22]+关键字[1]+海拔[4]+速度[8]+液位[8]+方向[4]+锁定[1]+经纬[21]）进行测试使用"),s("br"),t._v("\n4C 69 73 74 65 6E 69 6E 67 56 69 72 74 75 61 6C 44 65 76 69 63 65"),s("br"),t._v("\n62"),s("br"),t._v("\n44 C3 E7 5C"),s("br"),t._v("\n40 46 D5 C2 8F 5C 28 F6"),s("br"),t._v("\n00 00 00 00 00 00 00 0C"),s("br"),t._v("\n00 00 00 2D"),s("br"),t._v("\n01"),s("br"),t._v("\n31 33 31 2E 32 33 31 34 35 36 2C 30 32 31 2E 35 36 38 32 31 31")])]),t._v(" "),s("h2",{attrs:{id:"快速开始"}},[t._v("快速开始 "),s("a",{staticClass:"header-anchor",attrs:{href:"#快速开始"}},[t._v("#")])]),t._v(" "),s("a-alert",{attrs:{type:"warning","show-icon":""}},[s("span",{attrs:{slot:"message"},slot:"message"},[t._v("\n     确保已经配置好了基础开发服务\n   ")])]),t._v(" "),s("p",[t._v("1.启动驱动")]),t._v(" "),s("p"),t._v(" "),s("p",[t._v("2.添加数据模板")]),t._v(" "),s("p",[t._v("驱动自带的业务代码中有"),s("code",[t._v("海拔[4]+速度[8]+液位[8]+方向[4]+锁定[1]+经纬[21]")]),t._v(" 6个业务属性,此处只配置了一个")]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/listeningvirtual/708d1bee-c05e-4de3-bbad-abc5a1d0a77a.png",alt:"配置模板"}})]),t._v(" "),s("p",[t._v("3.添加设备")]),t._v(" "),s("a-alert",{attrs:{type:"warning","show-icon":""}},[s("span",{attrs:{slot:"message"},slot:"message"},[t._v("\n     此处设备名称将在报文中出现,请尽量使用纯英文或数字,或自行替换代码中的部分逻辑\n   ")])]),t._v(" "),s("p"),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/listeningvirtual/414078d1-4e83-4f7f-a157-4339e34ccf16.png",alt:"新增设备"}})]),t._v(" "),s("p",[t._v("4.配置位号属性")]),t._v(" "),s("p",[s("img",{attrs:{src:"/assets/images/dc3/driver/listeningvirtual/edc7ac63-3a05-4ba0-9377-32413f830687.png",alt:"配置位号属性"}})]),t._v(" "),s("p",[t._v("起始字节: 读取的起始字节位置")]),t._v(" "),s("p",[t._v("结束字节: 读取的结束字节位置,非可变长属性可忽略配置")]),t._v(" "),s("p",[t._v("类型: 数据真实数据类型")]),t._v(" "),s("p",[t._v("关键字: 业务逻辑,见代码")]),t._v(" "),s("p",[t._v("本示范中"),s("code",[t._v("温度")]),t._v("的起始字节位置为"),s("code",[t._v("23")]),t._v(",标准4字节,所以结束字节可忽略配置")]),t._v(" "),s("p",[t._v("5.发送数据")]),t._v(" "),s("p",[t._v("使用网络调试助手或各类TCP测试工具发送报文")]),t._v(" "),s("p",[t._v("6.查看数据\n"),s("img",{attrs:{src:"/assets/images/dc3/driver/listeningvirtual/e5e39809-cb96-40bf-b4de-b4732f82efa6.png",alt:"配置位号属性"}})])],1)}),[],!1,null,null,null);s.default=r.exports}}]);