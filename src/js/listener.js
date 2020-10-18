class Listener {
  constructor() {
    this.list = [];
  }
  on(type, fun) {
    this.list.push({ type, fun });
  }
  off(type, fun) {
    if (type && fun) {
      this.list = this.list.filter((el) => el.type !== type || el.fun !== fun);
    } else if (type) {
      this.list = this.list.filter((el) => el.type !== type);
    }
  }
  fire(type, ...data) {
    this.list.forEach((el) => {
      if (el.type === type) {
        el.fun(...data);
      }
    });
  }
}

export default Listener;
