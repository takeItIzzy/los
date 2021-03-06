# losjs

一个原子化的状态管理工具。

## Concurrent Mode 兼容性

测试用例来自 [Will this React global state work in concurrent rendering?](https://github.com/dai-shi/will-this-react-global-state-work-in-concurrent-rendering)

<details>
<summary>Raw Output</summary>

```
With useTransition                                                                                                                        
  Level 1                                                                                                                                 
    √ No tearing finally on update (8817 ms)                                                                                              
    √ No tearing finally on mount (4828 ms)                                                                                               
  Level 2                                                                                                                                 
    √ No tearing temporarily on update (13193 ms)                                                                                         
    √ No tearing temporarily on mount (4650 ms)                                                                                           
  Level 3                                                                                                                                 
    × Can interrupt render (time slicing) (8362 ms)                                                                                       
    × Can branch state (wip state) (6974 ms)                                                                                              
With useDeferredValue                                                                                                                     
  Level 1                                                                                                                                 
    √ No tearing finally on update (10088 ms)                                                                                             
    √ No tearing finally on mount (5167 ms)                                                                                               
  Level 2                                                                                                                                 
    × No tearing temporarily on update (21284 ms)                                                                                         
    √ No tearing temporarily on mount (6503 ms)
```
</details>

<table>
<tr><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th></tr>
	<tr>
		<td>:white_check_mark:</td>
		<td>:white_check_mark:</td>
		<td>:white_check_mark:</td>
		<td>:white_check_mark:</td>
		<td>:x:</td>
		<td>:x:</td>
		<td>:white_check_mark:</td>
		<td>:white_check_mark:</td>
		<td>:x:</td>
		<td>:white_check_mark:</td>
	</tr>

</table>

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

`los` 就是为了弥补 context 的这三点不足而诞生的状态管理工具。“los”的意思是“last one step”，它没有试图管理开发者所有的状态，而是仅作为 context 的替代品，将自己视为补全 react 项目技术栈的**最后一步**。los 解决了嵌套 provider 的问题，并且可以将状态与 react 组件脱钩，这意味着你不需要总在组件顶层声明状态。它具有 context 的优势——一次初始化，在任意位置调用 state，但更自由。

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
  cached?: boolean;
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

los 的目标之一是可以取代 context 在代码中的使用，但现在一个原子状态一旦被注册，没有办法被注销，这与 context 不同—当承载 provider 的组件销毁时，context 也会跟着注销。可能带来的问题是，有的时候开发者希望每次打开一个页面，都能加载状态的初始值，而 los 依然保留着上一次的最新值。

所以 los 允许在注册 atom 时传入第三个属性——cached，决定该 atom 是否是持久化的，该属性默认为 `true`，如果设置为 `false`，los 会在全局没有任何组件应用该 atom 时重置 atom。

```js
const uncachedAtom = atom({ default: 0, cached: false });
```

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

值得一提的是，`useLosValue` 是 **真正的** hooks，因为它内部依赖了 `useSyncExternalStore`，你在使用 `useLosValue` 时需要遵守一切 [hooks 的规则](https://reactjs.org/docs/hooks-rules.html)。但 `useSetLosState` 不是，它内部没有依赖任何 react 官方的 hooks，它其实更像一个普通的方法，以 `use` 开头更多的是为了在表现与使用形式上与 `useLosValue` 保持一致。尽管你可以无需遵守 hooks 的规则，比如直接在条件分支中使用 `useSetLosState`，但我不建议你这么做，这违背了 `useSetLosState` 以 `use` 为前缀的初衷，也容易为不明 `useSetLosState` 原理的其它代码维护者带来困扰，你在使用时还是应该把它视为真正的 hooks。但有时，类似“hooks 不能在分支语句中调用”这样的规则可能会制约代码的结构。所以，los 也提供了 `useSetLosState` 的一般方法版本，即 `setLosState`，它的行为与 `useSetLosState` 完全一致，但在违背 hooks 规则的地方使用时，不会有违和感：

```js
if (condition) {
  const setState = setLosState(myState);
  setState('new value');
}
```

事实上，在 los 内部，`useLosState` 就是由 `useLosValue` 和 `setLosState` 组成的，`useLosState` 方法返回的就是 `[useLosValue(myState), setLosState(myState)]`。这也意味着，`useLosState` 也是 **真正的** hooks，你在使用 `useLosState` 时也需要遵守一切 hooks 的规则。

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

与 `useSetLosState` 类似，`useLosDispatch` 也并不是真正的 hooks，你可以在违反 hooks 规则的地方使用它，但为了使语义更明确，你不应该这么做。如果你确实需要如此，使用 `useLosDispatch` 的一般方法版本：

```js
if (condition) {
  const dispatch = losDispatch(myState);
  dispatch({ type: 'INCREMENT' });
}
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
function Form({ defaultValue }) {
  // the default value for the form cannot be determined until the network request gets response.
  const [state, setState] = useInitLosState(myState, defaultValue);
  
  return ...
};
```

### computed

`computed` 类似 vue 的 [`计算属性`](https://vuejs.org/api/reactivity-core.html#computed) 或 recoil 的 [`selector`](https://recoiljs.org/docs/api-reference/core/selector) 的概念，语法也与 recoil 的 selector 类似。

#### 只读的 computed

你可以为 computed 传入一个含有 `get` 方法的对象，表示这是一个只读的 computed。get 方法返回值即作为 computed 的值。

```js
const atomState = atom({ defaultValue: 1 });
const computedState = computed({
  get: ({ get }) => {
    const atomValue = get(atomState); // get 方法的作用与 useLosValue 类似，传入一个 atom，获得其当前值
    return atomValue + 1;
  }
})
```

只有 `useLosState` 和 `useInitLosState` 及它俩的衍生方法或 hooks 可以接受 computed 作为参数，`useLosReducer`、`useLosDispatch`、`losDispatch` 则不行：

```js
const Foo = () => {
  const state = useLosValue(computedState);
  
  // 当 atom 的值是 1 时，computed 的值是 2
  return <div>computed: {state}</div>
}
```

#### 可写的 computed

computed 的入参对象还可以接受 `set` 方法，当传入这个方法时，可以通过 computed 改变 atom 的值：

```js
const atomState = atom({ defaultValue: 1 });
const computedState = computed({
  get: ({ get }) => {
    const atomValue = get(atomState);
    return atomValue + 1;
  },
  set: ({ get, set }, newValue) => {
    set(atomState, newValue - 2); // set 方法作用与 useSetLosState 类似，用来改变 atom 的值；newValue 即为在组件中调用时传入的值
  }
})

const Foo = () => {
  const [state, setState] = useLosState(computedState);
  
  // 点击 button 后，set 的 newValue 值为 5，所以 atom 被设置为 3，而 computed 在 get 中被声明为 4，所以 div 应该展示 `computed: 4`
  return (
    <>
      <div>computed: {state}</div>
      <button onClick={() => setState(5)}>Click me</button>
    </>
  )
}
```

#### 未初始化时数据的表现形式

当一个状态还没有初始化完成时，其返回的状态也是 `atom` 中的 `defaultValue`，如果这时你没有设置 defaultValue，那 los 将返回 undefined：

```js
const Foo = () => {
  const state = useLosValue(myState);
  
  if (state === undefined) {
    return <Loader />
  }
  
  return <div>{state}</div>
};
```

`initLosState` 和 `useInitLosState` 并不是必要的，如果你的初始状态在使用 `atom` 生成原子状态时就可以确定，那就不需要使用它俩。

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
