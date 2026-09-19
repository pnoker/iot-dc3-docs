---
title: M-Bus 驱动
---

# M-Bus 驱动

`dc3-driver-mbus` 通过 M-Bus（EN 13757）总线读取热表、水表、气表。

## 协议背景

M-Bus 是欧洲远程抄表标准，主站发短帧按主地址寻址，仪表回长帧携带 DIF/VIF 数据记录。

驱动 code：MbusDriver，类型：DRIVER_CLIENT，底层库：jSerialComm

## 属性配置

### 驱动属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Serial Port | port | STRING | /dev/ttyUSB0 | 串口设备路径 |
| Baud Rate | baudRate | INT | 2400 | 波特率（300/600/1200/2400/4800/9600） |
| Data Bits | dataBits | INT | 8 | 数据位（7、8） |
| Stop Bits | stopBits | INT | 1 | 停止位（1、2） |
| Parity | parity | INT | 2 | 校验位（0=无、1=奇、2=偶） |
| Timeout | timeout | INT | 1000 | 读超时（毫秒） |
| Primary Address | primaryAddress | INT | 0 | M-Bus 主地址（0-250） |

### 位号属性

| 属性 | code | 类型 | 默认值 | 说明 |
|------|------|------|--------|------|
| Record Index | recordIndex | INT | 0 | 数据记录 0 基索引 |
| Data Format | dataFormat | STRING | AUTO | 解码格式：AUTO、HEX、BCD、INT、FLOAT |

## 采集与健康

- **采集周期**：`read` 调度默认 cron `0/30 * * * * ?`（每 30 秒对所有位号跑一轮轮询）。
- **健康/在线**：设备健康检查默认 cron `0/15 * * * * ?`，租约超时 `45 秒`。

## 能力矩阵

| 能力 | 支持 |
|------|------|
| 读 | ✓ |
| 写 | ✓ |
| 订阅 | — |

::: info 实现状态：完整

帧为自研实现（无原生 jrxtx 依赖），MbusFrame 负责组帧、校验与记录解析。
:::

## 故障排查

M-Bus 接不通，问题基本落在串口、寻址、记录解析三类。按"症状 → 原因 → 排查"过一遍：

- **串口打不开**。原因：`port` 路径不存在、串口被其他进程占用或当前用户无权限，驱动打开串口失败会抛 `ConnectorException`（日志见 `Failed to open serial port`）。排查：Linux 下确认 `ls /dev/ttyUSB0` 存在、当前用户在 `dialout` 组；Windows 下 `port` 填 `COM3` 这类名字；确认没有别的程序占着口。
- **一直报 `Empty M-Bus response`**。原因：仪表没有应答——`primaryAddress` 与仪表实际主地址不符、串口参数与仪表不一致、电平转换器或接线有问题。排查：先把 `baudRate`/`dataBits`/`stopBits`/`parity` 对到仪表手册的值（M-Bus 出厂多为 2400/8/1/偶校验），再用 M-Bus 主站工具单独读一次表，确认地址无误。
- **报 `checksum mismatch` 或 `invalid frame delimiters`**。原因：收到的字节不是一帧完整应答——串口参数错导致字节错乱、总线干扰，或应答被截断：接收端以"连续 3 次、每次约 20 毫秒读不到新字节"判定一帧结束，仪表发送中途停顿超过这个窗口就会被截断。排查：核对四项串口参数；仍不行时加大 `timeout`，并检查总线终端电阻与共地。
- **报 `Unexpected M-Bus response control code`**。原因：应答帧的 control 字节不是 RSP_UD（`0x08`），常见于总线上有设备用了重复主地址应答。排查：确认每个主地址在总线上唯一。
- **报 `M-Bus record not found`**。原因：`recordIndex` 超出本次应答里解码出的记录数——不同表型、不同变长数据结构下记录数不同。排查：`recordIndex` 是 DIF/VIF 记录列表的 0 基索引，从 0 逐个试到目标记录，对照仪表手册的变量数据结构。
- **读到的数值不对**。原因：`dataFormat` 与记录的实际编码不符。默认 `AUTO` 按 DIF 自动选：BCD 类 DIF 按 BCD、32 位实数按 FLOAT、其余按 INT，把 BCD 计量值按 INT 解会得到错误数字。排查：显式把 `dataFormat` 指定为 `BCD`/`INT`/`FLOAT`，或先用 `HEX` 看原始字节再定。
- **写命令一直失败**。原因：驱动把写值按 US-ASCII 字节装进 SND_UD 帧发出，只有仪表回恰好 1 字节的 ACK（`0xE5`）才算成功——仪表不支持该写操作、payload 不符合仪表的应用层格式、地址错，都会失败。排查：先确认同地址读正常，再按仪表手册核对该写的应用层报文。
- **设备反复离线、重连**。原因：任何一次读或写抛异常，驱动都会作废该串口连接并在下次访问时重开；设备的更新/删除元数据事件也会主动关闭连接。排查：日志里 `Driver connection established` / `Serial port opened` 高频出现就是在反复重开串口，回到上面的读失败原因定位。在线状态机制见[设备](../introduction/concepts/device)。

## 在 IoT DC3 中如何落地

M-Bus 是两线、单主多从的总线：驱动主机通过 M-Bus 主站（常见形态是 USB 转 M-Bus 的电平转换器）挂在总线一端，总线下挂热表、水表、气表，每块表用一个 0-250 的主地址区分。驱动是 `DRIVER_CLIENT` 主动轮询型：每个[设备](../introduction/concepts/device)对应一条串口连接，连接参数（`port`/`baudRate`/`dataBits`/`stopBits`/`parity`/`timeout`）取自该设备的驱动属性，按 `deviceId` 缓存复用；一块表 = 一个设备 + 一个 `primaryAddress`。

::: warning 连接不共享串口
连接按 `deviceId` 建立与缓存：两个设备填同一个 `port`，驱动会各自打开这个串口，不做合并复用。同一物理总线接多块表需要多个设备（每个设备一个主地址）时，请先确认你的串口栈允许同一端口被打开多次。
:::

读链路：采集调度（默认每 30 秒）对设备下全部位号跑一轮。`read()` 用设备属性 `primaryAddress` 组 REQ_UD2 请求帧，发送前先清掉串口里的残留字节，收到应答后依次校验 control 码（应为 RSP_UD）、帧定界与校验和，再把用户数据解析成 DIF/VIF 记录列表，按位号属性 `recordIndex` 取目标记录、按 `dataFormat` 解码成值，封装为[位号值](../introduction/concepts/point-value)上送——同一块表的不同记录（累计量、瞬时流量、温度）配成多个位号即可，各自指定 `recordIndex`。

写链路与平台衔接：`write()` 把命令值转成 US-ASCII 字节、按同一个 `primaryAddress` 组 SND_UD 帧发出，仪表回单字节 ACK（`0xE5`）即判成功，异常抛 `WritePointException`。健康检查每 15 秒按串口连接的 `isOpen()` 报在线/离线；设备元数据的更新/删除事件会主动关闭对应连接，读写异常同样会作废连接、下个周期重建——所以串口参数配错的典型表现是"反复重开串口 + 持续读失败"，而不是驱动挂死。读写能力与[驱动能力矩阵](./matrix)一致：读 ✓ / 写 ✓ / 订阅 —（M-Bus 是主从轮询，仪表不主动上报）。

## 最小接入示例

1. 选 M-Bus 驱动创建设备，填 port、baudRate=2400、parity=2、primaryAddress=0。
2. 加位号（READ_ONLY），填 recordIndex=0、dataFormat=FLOAT。
3. 启动驱动，30 秒内即可看到采集值。

## 延伸阅读

- [驱动总览](./index)
- [驱动能力矩阵](./matrix)
- [设备接入](../operation/device-onboarding)
