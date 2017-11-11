# Change Log

## [1.8.0](https://github.com/andersonba/yve-bot/tree/1.8.0) (2017-11-11)
[Full Changelog](https://github.com/andersonba/yve-bot/compare/1.7.0...1.8.0)

**Implemented enhancements:**

- Passive mode support [\#46](https://github.com/andersonba/yve-bot/pull/46) ([andersonba](https://github.com/andersonba))

## [1.7.0](https://github.com/andersonba/yve-bot/tree/1.7.0) (2017-11-10)
[Full Changelog](https://github.com/andersonba/yve-bot/compare/1.6.0...1.7.0)

**Implemented enhancements:**

- YveBot shouldn't throw an error when trying to re-define an existing action/type [\#39](https://github.com/andersonba/yve-bot/issues/39)

**Fixed bugs:**

- Some properties of bot's instances are statics! [\#38](https://github.com/andersonba/yve-bot/issues/38)

**Closed issues:**

- StringSearch validation fails when server result is 0 [\#44](https://github.com/andersonba/yve-bot/issues/44)
- Bundle analyzer [\#42](https://github.com/andersonba/yve-bot/issues/42)

**Merged pull requests:**

- Fixing validation flow in StringSerach. Closes \#44 [\#45](https://github.com/andersonba/yve-bot/pull/45) ([rafaelverger](https://github.com/rafaelverger))

## [1.6.0](https://github.com/andersonba/yve-bot/tree/1.6.0) (2017-11-09)
[Full Changelog](https://github.com/andersonba/yve-bot/compare/1.5.0...1.6.0)

**Implemented enhancements:**

- feature: grouping rules into flows [\#40](https://github.com/andersonba/yve-bot/issues/40)
- user context support [\#37](https://github.com/andersonba/yve-bot/issues/37)

**Closed issues:**

- online IDE to build conversations [\#8](https://github.com/andersonba/yve-bot/issues/8)
- host the libs on CDN [\#7](https://github.com/andersonba/yve-bot/issues/7)

## [1.5.0](https://github.com/andersonba/yve-bot/tree/1.5.0) (2017-11-07)
[Full Changelog](https://github.com/andersonba/yve-bot/compare/1.4.0...1.5.0)

**Implemented enhancements:**

- core: improves actions flow [\#35](https://github.com/andersonba/yve-bot/issues/35)
- synonyms support [\#32](https://github.com/andersonba/yve-bot/issues/32)
- Customize time in bot typing [\#31](https://github.com/andersonba/yve-bot/issues/31)

**Fixed bugs:**

- ui: scroll down unstable when creating new message [\#34](https://github.com/andersonba/yve-bot/issues/34)

**Merged pull requests:**

- Synonyms [\#33](https://github.com/andersonba/yve-bot/pull/33) ([andersonba](https://github.com/andersonba))

## [1.4.0](https://github.com/andersonba/yve-bot/tree/1.4.0) (2017-11-01)
[Full Changelog](https://github.com/andersonba/yve-bot/compare/1.3.0...1.4.0)

**Implemented enhancements:**

- String search type [\#29](https://github.com/andersonba/yve-bot/issues/29)
- Create new field type: StringSearch [\#27](https://github.com/andersonba/yve-bot/pull/27) ([rafaelverger](https://github.com/rafaelverger))

## [1.3.0](https://github.com/andersonba/yve-bot/tree/1.3.0) (2017-10-31)
[Full Changelog](https://github.com/andersonba/yve-bot/compare/1.2.0...1.3.0)

## [1.2.0](https://github.com/andersonba/yve-bot/tree/1.2.0) (2017-10-25)
[Full Changelog](https://github.com/andersonba/yve-bot/compare/1.1.0...1.2.0)

**Implemented enhancements:**

- types: improves transform definition [\#24](https://github.com/andersonba/yve-bot/issues/24)
- Make rule.parser method an async function [\#20](https://github.com/andersonba/yve-bot/issues/20)
- show timestamp in conversation messages [\#16](https://github.com/andersonba/yve-bot/issues/16)

**Fixed bugs:**

- Webpack should compile server and client-side files differently [\#18](https://github.com/andersonba/yve-bot/issues/18)

**Merged pull requests:**

- Improve multi-executors RuleTypes flow [\#26](https://github.com/andersonba/yve-bot/pull/26) ([rafaelverger](https://github.com/rafaelverger))
- Missing changes on PR \#23 [\#25](https://github.com/andersonba/yve-bot/pull/25) ([rafaelverger](https://github.com/rafaelverger))
- Big improvements in Types and receiveMessage handler [\#23](https://github.com/andersonba/yve-bot/pull/23) ([rafaelverger](https://github.com/rafaelverger))
- Expect Type.parser method to be an async function [\#22](https://github.com/andersonba/yve-bot/pull/22) ([rafaelverger](https://github.com/rafaelverger))
- Set webpack to have custom props for node and browser [\#19](https://github.com/andersonba/yve-bot/pull/19) ([rafaelverger](https://github.com/rafaelverger))
- Add timestamp to the message. Close \#16 [\#17](https://github.com/andersonba/yve-bot/pull/17) ([soueuls](https://github.com/soueuls))

## [1.1.0](https://github.com/andersonba/yve-bot/tree/1.1.0) (2017-10-20)
[Full Changelog](https://github.com/andersonba/yve-bot/compare/1.0.0...1.1.0)

**Implemented enhancements:**

- Add bot name in the message [\#13](https://github.com/andersonba/yve-bot/issues/13)
- single/multiple-choices: support for compile message with option label [\#6](https://github.com/andersonba/yve-bot/issues/6)

**Fixed bugs:**

- option value is overwritten by label when value is nullable [\#11](https://github.com/andersonba/yve-bot/issues/11)
- fixing message [\#9](https://github.com/andersonba/yve-bot/pull/9) ([marcosrjjunior](https://github.com/marcosrjjunior))

**Merged pull requests:**

- Fix jasmin bot tests [\#15](https://github.com/andersonba/yve-bot/pull/15) ([tupy](https://github.com/tupy))
- Add bot name to the message. close \#13 [\#14](https://github.com/andersonba/yve-bot/pull/14) ([tupy](https://github.com/tupy))
- Avoid default value for label/value of SingleChoice field [\#12](https://github.com/andersonba/yve-bot/pull/12) ([rafaelverger](https://github.com/rafaelverger))

## [1.0.0](https://github.com/andersonba/yve-bot/tree/1.0.0) (2017-09-15)
**Closed issues:**

- tests: 100% coverage [\#3](https://github.com/andersonba/yve-bot/issues/3)
- run tests on ci [\#2](https://github.com/andersonba/yve-bot/issues/2)
- publish to npm [\#1](https://github.com/andersonba/yve-bot/issues/1)



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*
