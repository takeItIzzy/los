# losjs

一个原子化的状态管理工具。

## 动机

现今社区中的状态管理库，大都希望自己能管理开发者项目中的所有状态，包括异步数据和前端状态。所以他们大多也都提供了对异步的支持以将网络请求的结果存入状态管理器中。

如果你的项目中只使用一个状态管理库缓存所有状态，这样当然没有问题，但实际情况可能更复杂。

`react-query` 已经在前端项目中扮演着越来越重要的角色，有越来越多的开发者将自己的网络请求和异步数据交给 react-query 管理。react-query 可能已经解决了 90% 的状态管理问题，但总还有一些场景是仅依靠 react-query 所无法完成的，比如，当你想编辑一个表单时，需要将网络请求到的表单默认值缓存下来，用户更新表单后，再将新表单数据发送到服务器。

类似这种场景就需要另一个管理状态的工具，但仅为了这可能只在项目中占 10% 的状态，就要引入一个专门为了管理你所有状态而存在的库，似乎显得过于重了，而且将 `react-query` 与其它状态管理库结合可能不那么方便。就拿 react 官方出的 `recoil` 举例，recoil 的 `atom` 和 `selector` 内都不能使用 hooks，也没办法像 `useState` 一样在调用 `useRecoilState` 时赋初值。这样一来，用户想将 react-query 的结果缓存时，只能在请求到表单数据以后，使用 `useEffect` 改变 recoil 状态，这会让组件多渲染一次，而且在 useEffect 中更新状态可能会导致状态被覆盖或依赖写不全的问题。当然 recoil 也是支持异步的，开发者也可以在 atom 和 selector 内发起网络请求，将请求结果作为初始值。但 react-query 这么好用，开发者为什么要把竞态、数据过期、突变等等问题再自己处理一遍呢？

其实在将异步数据交给 react-query 管理之后，其他场景使用 context 覆盖已经足够，context 也可以很轻松地配合 react-query 使用，只需将网络请求结果作为 useState 或 useReducer 的默认值，再将该 state 传入 provider 即可。context 确实是一个很好的 api，它大大降低了各组件间通信的成本，声明一次数据，就可以在 context 内任意位置调用。但 context 还存在一些老生常谈的缺陷——

1. context 可能会导致组件不必要的重绘；
2. context 需要配合 provider 使用，这将数据与 UI 耦合在了一起；
3. context 必须将状态提升到顶层。

问题 1 可能会导致性能的下降，问题 2 和问题 3 则会给组件结构划分带来影响，开发者在设计组件时必须迁就 context 的运行逻辑。

`los` 就是为了弥补 context 的这三点不足而诞生的状态管理工具。“los”的意思是“last one step”，它没有试图管理开发者所有的状态，而是仅作为 context 的替代品，将自己视为补全 react 项目技术栈的**最后一步**。los 解决了嵌套 provider 的问题，并且可以将状态与 react 组件脱钩，它具有 context 的优势——一次初始化，在任意位置调用 state，但更自由。

los 的原子化概念灵感来自 recoil，recoil 是个很好的状态管理库，但与 react-query 结合时的状态初始化略有不便，不适合我的工作场景，有些可惜。

## 安装

```
npm i losjs
```

## 快速上手

先使用 `atom` 声明一个原子状态：

```js
const myState = atom({
  defaultValue: 0
});
```

如果你的状态默认值不依赖于网络请求等场景，使用 atom 就初始化好了一个原子状态了，但如果你希望默认值在未来某个时间才确定，你可以在需要的时候调用 `initLosState`：

```js
function Foo() {
  ...
  const fetchData = async () => {
    const response = await fetch(...);
    initLosState(myState, response);
  };
  ...
};
```

initLosState() 默认仅会执行一次，后续再对同一个原子状态执行 init 则不会更新状态，想改变这一默认行为，可以传入第三个参数，这是一个布尔值，决定是否允许重复初始化，默认为 false：
```js
initLosState(myState, defaultValue, true);
```

initLosState 也提供了对应的 hooks，这在你想将数据的初始化隔离到特定组件或自定义 hooks 中时很有用。`useInitLosState` 行为类似 `useState`，接受默认值，并返回状态与改变状态的 setter 方法：

```js
function Foo({ defaultValue }) {
  const [state, setState] = useInitLosState(myState, defaultValue);
};
```

注意：initLosState 和 useInitLosState 并不是必要的，如果你的初始状态在使用 atom 生成原子状态时就可以确定，那就不需要使用它俩。

使用状态也类似 useState：

```js
const [state, setState] = useLosState(myState);
```
