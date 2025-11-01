import assert from 'node:assert/strict'
import l10n from '../l10n'

describe('l10n', () => {
    before(() => {
        l10n.messages = {
            'foo': 'hello world',
            'bar': 'hello {0}',
            'baz': 'hello {name}',
        }
    })

    it('format strings with variadic parameters', () => {
        assert.equal(
            l10n.format('foo {0}', 'hello world'),
            'foo hello world',
        )
        assert.equal(
            l10n.format('foo {0} bar {1}', 'hello', 'world'),
            'foo hello bar world',
        )
    })

    it('format strings with named parameters', () => {
        assert.equal(
            l10n.format('foo {msg}', {
                msg: 'hello world',
            }),
            'foo hello world',
        )
        assert.equal(
            l10n.format('foo {foo} bar {bar}', {
                foo: 'hello',
                bar: 'world',
            }),
            'foo hello bar world',
        )
    })

    it('translate without parameters', () => {
        assert.equal(
            l10n.t('foo'),
            'hello world',
        )
    })

    it('translate with variadic parameters', () => {
        assert.equal(
            l10n.t('bar', 'another world'),
            'hello another world',
        )
    })

    it('translate with named parameters', () => {
        assert.equal(
            l10n.t('baz', {
                name: 'github',
            }),
            'hello github',
        )
    })
})
