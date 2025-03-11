import assert from 'node:assert/strict'
import { join } from 'node:path'
import { EditorView, InputBox, TreeSection, VSBrowser, Workbench } from 'vscode-extension-tester'
import { captureInput, triggerDuplicate } from './utils'

describe('simple tests', () => {
    let tree: TreeSection

    before(async () => {
        await VSBrowser.instance.openResources(join('src', 'test', 'fixtures'))

        const workbench = new Workbench()
        const activityBar = workbench.getActivityBar()
        const controls = await activityBar.getViewControl('Explorer')
        const view = await controls?.openView()
        const sections = await view?.getContent().getSections()

        tree = sections?.at(0) as TreeSection
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
