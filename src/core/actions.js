export default actions => actions

    .define('wait', value =>
      new Promise((resolve) => setTimeout(resolve, value)));
