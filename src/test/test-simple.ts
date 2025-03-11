import { expect } from 'chai'
import { join } from 'node:path'
import { ActivityBar, DefaultTreeSection, SideBarView, VSBrowser, ViewContent } from 'vscode-extension-tester'
import { captureInput, triggerDuplicate } from './utils'

describe('simple tests', () => {
    let content: ViewContent
    let tree: DefaultTreeSection

    before(async () => {
        // we will be looking at the explorer view
        // first we need to open a folder to get some items into the view
        await VSBrowser.instance.openResources(join('src', 'test', 'fixtures'));
        // make sure the view is open
        (await new ActivityBar().getViewControl('Explorer'))?.openView()

        // now to initialize the view
        // this object is basically just a container for two parts: title & content
        const view = new SideBarView()
        content = view.getContent()

        tree = await content.getSection('fixtures') as DefaultTreeSection
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
            expect(text).to.eq(filenameCopy)
        })
    })

})
