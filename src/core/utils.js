function findOptionByAnswer(options, answer) {
  const [option] = options
    .filter(o => o.value === answer || o.label === answer);
  return option;
}

export default {
  findOptionByAnswer,
};
