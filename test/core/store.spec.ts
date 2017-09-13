import { describe, it } from 'mocha';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { Store } from '../../src/core/store';

function mockBot() {
  return {
    dispatch: sinon.spy(),
  };
}

describe('core.store', () => {
  it('initial state', () => {
    const store = new Store(null);
    expect(store.get()).to.be.deep.equal({
      currentIdx: null,
      waitingForAnswer: false,
      output: {},
    });
  });

  it('setting', () => {
    const bot = mockBot();
    const store = new Store(bot);
    store.set('output.word', 'ok');
    expect(bot.dispatch).to.have.been.calledWith('storeChanged', store.get());
    expect(store.get('output.word')).to.be.equal('ok');
  });

  it('unsetting', () => {
    const bot = mockBot();
    const store = new Store(bot);
    store.set('output.word', 'ok');
    expect(store.get('output.word')).to.be.equal('ok');
    store.unset('output.word');
    expect(store.get('output')).to.be.deep.equal({});
  });

  it('reseting', () => {
    const store = new Store(mockBot());
    store.set('currentIdx', 1);
    expect(store.get('currentIdx')).to.be.equal(1);
    store.reset();
    expect(store.get('currentIdx')).to.be.null;
  });

  it('replacing', () => {
    const store = new Store(mockBot());
    const obj = {
      currentIdx: 4,
      waitingForAnswer: true,
      output: { a: 1 },
    };
    store.replace(obj)
    expect(store.get()).to.be.deep.equal(obj);
  });
});
