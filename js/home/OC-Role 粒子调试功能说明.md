# OC-Role 粒子调试功能说明

## 功能目标

这个功能主要是为了更方便地调整首页 `oc-role` 分区粒子动画的视觉效果。

当前重点调试的参数只有两组：

- `camera`：控制 Three.js 相机位置
- `center`：控制粒子整体的中心偏移

## 现在有两个入口

### 1. 本地人工改写入口

如果你只是想手动写一组启动参数，直接改这个文件：

- [particle-debug-preset.js](../../js/home/particle-debug-preset.js)

这是一个很短的本地预设文件，专门用来手动填写初始值：

```js
export const PARTICLE_DEBUG_LOCAL_PRESET = {
    camera: {
        x: 0,
        y: 0,
        z: 80
    },
    center: {
        x: 0,
        y: 0,
        z: 0
    }
};
```

页面启动时会先加载这份预设。

### 2. 页面内 debug 调整入口

如果你想边看效果边调参数，打开这个开关：

- [particles.js](../../js/home/particles.js:10)

把：

```js
const PARTICLE_DEBUG_ENABLED = false;
```

改成：

```js
const PARTICLE_DEBUG_ENABLED = true;
```

开启后，页面右下角会出现 debug 窗口，可以实时调整：

- `camera.x`
- `camera.y`
- `camera.z`
- `center.x`
- `center.y`
- `center.z`

同时会动态显示当前 JSON。

## debug 窗口现在不依赖具体粒子函数

现在 debug 窗口已经从具体粒子实现里抽离出来了，不再绑死在某一个粒子文件上。

也就是说，[particles.js](../../js/home/particles.js) 里这行：

```js
import { ParticlesSwarm } from './kh_m.js';
```

以后就算你改成：

```js
import { ParticlesSwarm } from './jellyfish_2.js';
```

或者切到别的粒子模块，debug 窗口仍然会正常存在，不会因为更换粒子函数而消失。

当前职责拆分如下：

- `particles.js`：粒子入口和 debug 开关
- `particle-debug-runtime.js`：统一负责 debug 窗口、参数注入和实时 JSON
- `particle-debug-preset.js`：本地人工改写的初始预设
- 具体粒子文件：只负责各自的粒子运动逻辑

## 启动加载逻辑

启动时会按下面的顺序加载：

1. 先读取本地预设文件 [particle-debug-preset.js](../../js/home/particle-debug-preset.js)
2. 再经过 [particle-debug-config.js](../../js/home/particle-debug-config.js) 做配置归一化
3. 如果 debug 开关开启，再由 [particle-debug-runtime.js](../../js/home/particle-debug-runtime.js) 创建调试窗口并把参数注入粒子系统

如果浏览器里还没有保存过调试配置，就会把这份本地预设写入 `localStorage`。

使用的键名是：

```text
ocRoleParticleDebugConfig
```

## 推荐用法

如果你想快速设一个固定起点：

1. 改 `particle-debug-preset.js`
2. 刷新页面

如果你想微调视觉效果：

1. 先在 `particle-debug-preset.js` 里写一个大致值
2. 再开启 `PARTICLE_DEBUG_ENABLED`
3. 在页面右下角继续微调

如果你切换了粒子实现文件，比如从 `kh_m.js` 改到 `jellyfish_2.js`、`ton_618.js` 或 `koratom_10.js`，这套 debug 入口仍然继续可用，不需要额外修改 debug 窗口逻辑。

## 相关文件

- [particle-debug-preset.js](../../js/home/particle-debug-preset.js)
- [particle-debug-config.js](../../js/home/particle-debug-config.js)
- [particle-debug-runtime.js](../../js/home/particle-debug-runtime.js)
- [particles.js](../../js/home/particles.js)
- [kh_m.js](../../js/home/kh_m.js)
