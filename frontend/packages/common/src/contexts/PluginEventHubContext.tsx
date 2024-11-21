import { createContext, FC, ReactNode, useContext, useState } from "react";


class EventEmitter {
    // 用来存放注册的事件与回调
    _events:any
    constructor () {
      this._events = {}
    }
  
    on (eventName:string, callback:Function) {
      // 由于一个事件可能注册多个回调函数，所以使用数组来存储事件队列
      const callbacks = this._events[eventName] || []
      callbacks.push(callback)
      this._events[eventName] = callbacks
    }
  
    // 此处需要处理，emit时需要按顺序执行监听的函数，每个函数都会返回是否中止的参数，如果中止则不执行后续的函数
    // emit传入eventName 和 event, 返回 event
    emit (eventName:string, event:any) {
      return new Promise((resolve) => {
        const callbacks = this._events[eventName] || []
        for (const cb of callbacks) {
          const cbRes = cb(event.data)
          if (cbRes.continue === false) {
            resolve(cbRes)
            break
          } else {
            event = cbRes
          }
        }
        resolve(event.data)
      })
    }
  
    // 取消订阅
    off (eventName:string, callback:Function) {
      const callbacks = this._events[eventName] || []
      const newCallbacks = callbacks.filter((fn:any) => fn !== callback && fn.initialCallback !== callback /* 用于once的取消订阅 */)
      this._events[eventName] = newCallbacks
    }
  
    // 单次订阅，后台插件可以自行决定取消对事件的订阅
    once (eventName:string, callback:Function) {
      // 由于需要在回调函数执行后，取消订阅当前事件，所以需要对传入的回调函数做一层包装,然后绑定包装后的函数
      const one = (...args:any) => {
        callback(...args)
        this.off(eventName, one)
      }
  
      // 由于：我们订阅事件的时候，修改了原回调函数的引用，所以，用户触发 off 的时候不能找到对应的回调函数
      // 所以，我们需要在当前函数与用户传入的回调函数做一个绑定，我们通过自定义属性来实现
      one.initialCallback = callback
      this.on(eventName, one)
    }
  }

export const PluginEventHubContext = createContext<EventEmitter | undefined>(undefined);

export const PluginEventHubProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [pluginEventHub] = useState<EventEmitter>(new EventEmitter());

  return (
    <PluginEventHubContext.Provider value={pluginEventHub}>
      {children}
    </PluginEventHubContext.Provider>
  );
};

export const usePluginEventHub = () => {
  const context = useContext(PluginEventHubContext);
  if (!context) {
    throw new Error('usePluginEventHub must be used within a PluginEventHubProvider');
  }
  return context;
};