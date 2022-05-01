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

通过 `useLosState` hook 使用该状态，`useLosState` 的行为与 `React.useState` 类似，接受一个新值或返回新值的回调函数：

```js
const Foo = () => {
  const [state, setState] = useLosState(myState);
  
  return (
    <>
      <div>counts: {state}</div>
      <button onClick={() => setState(prev => prev + 1)}>Increase</button>
    </>
  );
};
```

## APIs

### atom

`atom` 方法可以在 los 内注册一个原子状态，该方法接受一个如下类型的对象：

```typescript
{
  defaultValue?: T;
  reducer?: LosReducer<T, A>;
}
```

`defaultValue` 作为该原子状态的默认值，`reducer` 类似 `React.useReducer` 的第一个参数，接受一个返回新值的 reducer 函数：

```js
const myState = atom({
  defaultValue: 0,
  reducer: (state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return state + 1;
      default:
        return state;
    }
  },
});
```

los 认为一个状态的改变途径可以在声明该状态时就确定，所以将 reducer 放在了 atom 中。

### useLosState

`useLosState` 接受由 `atom` 方法返回的原子状态作为参数，返回该状态的最新值以及更新该状态的 setter 方法：

```js
const Foo = () => {
  const [state, setState] = useLosState(myState);

  return (
    <>
      <div>new value: {state}</div>
      <button onClick={() => setState(1)}>Click me</button>
      <button onClick={() => setState(prev => prev + 1)}>Inrease</button>
    </>
  );
};
```

### useLosValue & useSetLosState

如果你仅在某个组件中使用而不需要设置一个状态，可以使用 `useLosValue`，它将仅返回状态的新值：

```js
const Foo = () => {
  const state = useLosValue(myState);
  
  return <div>{state}</div>
};
```

如果你仅在某个组件中设置而不需要使用一个状态，可以使用 `useSetLosState`，它将仅返回更新状态的 setter 方法：

```js
const Foo = () => {
  const setState = useSetLosState(myState);
  
  return <button onClick={() => setState(1)}>Update state</button>
};
```

事实上，在 los 内部，`useLosState` 就是由 `useLosValue` 和 `useSetLosState` 组成的，`useLosState` 方法返回的就是 `[useLosValue(myState), useSetLosState(myState)]`。

### useLosReducer

`useLosReducer` 接受一个声明了 `reducer` 属性的由 `atom` 方法生成的原子状态，它的行为类似 `React.useReducer`，返回一个该状态的最新值和一个用于改变该状态的 dispatch 方法：

```js
const myState = atom({
  defaultValue: 0;
  reducer: (state, action) => {
    switch (action.type) {
      case 'INCREMENT':
        return state + action.step ?? 1;
      default:
        return state;
    }
  };
});

const Foo = () => {
  const [state, dispatch] = useLosReducer(myState);
  
  return (
    <>
      <div>Counts: {state}</div>
      <button onClick={() => dispatch({ type: 'INCREMENT', step: 2 })}>Increase</button>
    </>
  );
};
```

如果你的状态无法在使用 `atom` 声明状态时确认，`useLosReducer` 还接受第二个参数，用于在调用 useLosReducer 时再初始化状态。在使用 `atom` 时不需要指定 `defaultValue`：

```js
const stateWithoutDefault = atom();

const Foo = () => {
  const [state, dispatch] = useLosReducer(stateWithoutDefault, 0);
  
  return <div>{state}</div>; // should be `0`
};
```

初始化状态默认仅会执行一次，如果传入的第二个参数是个变量，即使后面其值变更，也不会生效。想改变这一默认行为，可以传入第三个参数，这是一个布尔值，决定是否允许重新初始化，默认为 `false`。通常你不需要这样做，这可能会导致状态管理变得混乱，你更应该使用 `dispatch` 来更新状态，这个参数只是多一种选择：

```js
const Foo = ({ value }) => {
  const [state, dispatch] = useLosReducer(stateWithoutDefault, value, true); // everytime `value` changes, it'll update state.
  
  return ...
};
```

### useLosDispatch

就像 `useLosState` 是由 `useLosValue` 和 `useSetLosState` 组合而成的一样，`useLosReducer` 是由 `useLosValue` 和 `useLosDispatch` 组合而成的。你可以根据实际情况调用 `useLosValue` 和 `useLosDispatch` 来仅在一个组件内使用或更新状态：

```js
const Foo = () => {
  const dispatch = useLosDispatch(myState);
  
  return <button onClick={() => dispatch({ type: "INCREMENT" })}>Update state</button>
};
```

### initLosState & useInitLosState

如果你的状态默认值不依赖于网络请求等场景，使用 atom 就初始化好了一个原子状态了，但如果你的默认值在未来某个时间才确定，你可以在需要的时候调用 `initLosState`：

```js
function Foo() {
  ...
  const fetchData = async () => {
    const response = await fetch(...);
    initLosState(myState, response.data);
  };
  ...
};
```

与在 `useLosReducer` 中初始化状态类似，initLosState() 默认仅会执行一次，后续再对同一个原子状态执行 initLosState 则不会更新状态，想改变这一默认行为，可以传入第三个参数，这是一个布尔值，决定是否允许重复初始化，默认为 false：
```js
initLosState(myState, defaultValue, true);
```

initLosState 也提供了对应的 hooks，这在你想将数据的初始化隔离到特定组件或自定义 hooks 中时很有用。`useInitLosState` 行为类似 `useState`，接受默认值，并返回状态与改变状态的 setter 方法：

```js
function Foo({ defaultValue }) {
  const [state, setState] = useInitLosState(myState, defaultValue);
};
```

#### 未初始化时数据的表现形式

当一个状态还没有初始化完成时，其返回的状态也是 `atom` 中的 `defaultValue`，如果这时你没有设置 defaultValue，那 los 将返回 undefined：

```js
const Foo = () => {
  const state = useLosValue(myState);
  
  if (state == undefined) { // `==` will determine whether it is nil
    return <Loader />
  }
  
  return <div>{state}</div>
};
```

注意：initLosState 和 useInitLosState 并不是必要的，如果你的初始状态在使用 atom 生成原子状态时就可以确定，那就不需要使用它俩。

### TypeScript

每个 API 都可以通过泛型约定状态及 actions 的类型，其中 actions 类型是可选的：

```typescript
const myState = atom<number>({ defaultValue: 0 });
type Actions = 'INCREMENT' | 'DECREMENT';
const myStateWithReducer = atom<number, Actions>({ defaultValue: 0, reducer: ... });

const Foo = () => {
  const state = useLosValue<number>(myState);
  const stateWithReducer = useLosValue<number, Actions>(myStateWithReducer);
  
  return ...
};
```

另外 los 还提供了 `LosReducer` 类型帮助你单独声明 reducer 函数：

```typescript
const reducer: LosReducer<number, Actions> = (state, action) => { ... };
```
