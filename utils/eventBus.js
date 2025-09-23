// 简单事件总线实现
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach(callback => {
        try {
          callback(...args);
        } catch (e) {
          console.error(`EventBus ${event} 回调错误:`, e);
        }
      });
    }
  }
}

// 全局单例
const eventBus = new EventBus();
module.exports = eventBus;