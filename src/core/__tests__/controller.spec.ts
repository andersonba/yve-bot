import YveBot from '..';

describe('getNextFromRule', () => {
  let bot;
  const rules = [
    {
      name: 'ruleWithNext',
      next: 'external-next'
      options: [
        {
          label: 'Null value',
          next: 'next-null',
          value: null,
        },
        {
          label: '0 value',
          next: 'next-0',
          value: 0,
        },
        {
          label: 'False value',
          next: 'next-false',
          value: false,
        },
        {
          label: 'Empty string value',
          next: 'next-emptystring',
          value: '',
        },
        {
          next: 'next-value',
          value: 'Only Value',
        },
        {
          label: 'Only label',
          next: 'next-label',
        },
        { value: 'No next' },
      ],
      type: 'SingleChoice',
    },
    {
      name: 'ruleWithoutNext',
      options: [{ value: 'No next' }],
      type: 'SingleChoice',
    },
    { name: 'next-untracked' },
    { name: 'external-next' },
    { name: 'next-null' },
    { name: 'next-0' },
    { name: 'next-false' },
    { name: 'next-emptystring' },
    { name: 'next-value' },
    { name: 'next-label' },
  ];

  beforeEach(() => {
    bot = new YveBot(rules);
  });

  [
    [0, undefined, 'external-next'],
    [0, false, 'next-false'],
    [0, null, 'next-null'],
    [0, 0, 'next-0'],
    [0, '', 'next-emptystring'],
    [0, 'only value', 'next-value'],
    [0, 'Only Label', 'next-label'],
    [0, 'no next', 'external-next'],
    [1, undefined, 'next-untracked'],
    [1, 'no next', 'next-untracked'],
  ].forEach(([ruleIdx, answer, nextRuleName]) => {
    test(`${rules[ruleIdx].name} + answer as '${answer}'`, (done) => {
      bot.on('reply', (a) => {
        const rule = bot.rules[bot.store.get('currentIdx')];
        expect(rule.name).toBe(nextRuleName);
        done();
      });
      bot.on('hear', (a) => bot.hear(answer));
      bot.controller.run(ruleIdx);
    });
  });
});
