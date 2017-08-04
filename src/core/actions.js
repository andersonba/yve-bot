export default actions => actions

    .define('delay', value =>
      new Promise((resolve) => setTimeout(resolve, value)));
