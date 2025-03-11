import assert from 'node:assert/strict'
import { join } from 'node:path'
import { DefaultTreeSection, EditorView, InputBox, VSBrowser, Workbench } from 'vscode-extension-tester'
import { captureInput, triggerDuplicate } from './utils'

describe('simple tests', () => {
    let tree: DefaultTreeSection

    before(async () => {
        await VSBrowser.instance.openResources(join('src', 'test', 'fixtures'))

        const workbench = new Workbench()
        const activityBar = workbench.getActivityBar()
        const controls = await activityBar.getViewControl('Explorer')
        const view = await controls?.openView()

        tree = await view?.getContent().getSection(s => s instanceof DefaultTreeSection) as DefaultTreeSection
    })

    const cases: string[][] = [
        ['test.txt', 'test-copy.txt'],
        ['.htaccess', '.htaccess-copy'],
        ['1.1.1_text-alternative.md', '1.1.1_text-alternative-copy.md'],
        ['a-directory', 'a-directory-copy'],
        ['dir.with.dots', 'dir.with.dots-copy'],
    ]

    cases.forEach((value) => {
        const filenameOriginal = value[0]
        const filenameCopy = value[1]

        it(`${filenameOriginal} renames to ${filenameCopy}`, async () => {
            await triggerDuplicate(tree, filenameOriginal)

            const text = await captureInput()
            assert.equal(text, filenameCopy)
        })
    })

})
