export default actions => actions

    .define('sleep', value =>
      new Promise((resolve) => setTimeout(resolve, value)));
