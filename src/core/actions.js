export default actions => actions

    .define('timeout', value =>
      new Promise((resolve) => setTimeout(resolve, value)))

;
