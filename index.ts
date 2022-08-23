interface Reactive<T> {
  val: () => T;
  update: (fn: (value: T) => T) => void;
  addObserver: (fn: (value: T) => void) => void;
}

interface Derived<T> {
  val: () => T;
  addObserver: (fn: (value: T) => void) => void;
}

const R = <T>(initVal: T): Reactive<T> => {
  let currentValue = initVal;
  let observers = [];

  return {
    val: () => currentValue,

    update: (fn: (value: T) => T) => {
      let newValue = fn(currentValue);
      if (currentValue !== newValue) {
        currentValue = newValue;
        observers.forEach((obs) => obs(newValue));
      }
    },

    addObserver: function (fn: (value: T) => void) {
      observers.push(fn);
    },
  };
};

const D = <T, U>(reactive: Reactive<T>, fn: (val: T) => U): Derived<U> => {
  var newReactive = R(fn(reactive.val()));

  reactive.addObserver((val) => {
    newReactive.update((_) => fn(val));
  });

  return {
    val: newReactive.val,
    addObserver: newReactive.addObserver,
  };
};

let nums = R([1, 2, 3]);
let total = D(nums, (nums) => nums.reduce((acc, n) => acc + n, 0));

console.log(total.val());

nums.addObserver((val) => console.log(val));

nums.update((val) => [...val, 10, 11, 12]);
nums.update((val) => [...val, 20, 30, 40]);

console.log(total.val());
