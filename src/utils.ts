import { BlockEntity, IBatchBlock, PageEntity } from '@logseq/libs/dist/LSPlugin.user'

export function simplifyBlockTree (blockTree: IBatchBlock[] | BlockEntity[]): IBatchBlock[] {
  // returns just the content of the blocks
  const blocksContent = blockTree.map(
    // only use children and content keys
    ({ children, content }) => {
      // recursively parse childrens
      const simplifiedChildren: IBatchBlock[] = simplifyBlockTree(children as BlockEntity[])
      // only include children key if there are childrens
      if (simplifiedChildren.length > 0) {
        return { children: simplifiedChildren, content }
      } else {
        return { content }
      }
    }
  )
  return blocksContent as IBatchBlock[]
}

export async function clearPage (page: PageEntity): Promise<void> {
  const blocks = await logseq.Editor.getPageBlocksTree(page.uuid)

  for (const block of blocks) {
    await logseq.Editor.removeBlock(block.uuid)
  }
}

export async function waitForElm (selector: string): Promise<Element> {
  /* https://stackoverflow.com/a/61511955 */

  return await new Promise(resolve => {
    const elm = parent.document.querySelector(selector)
    if (elm !== null) {
      return resolve(elm)
    }

    const observer = new MutationObserver(mutations => {
      const elm = parent.document.querySelector(selector)
      if (elm !== null) {
        observer.disconnect()
        return resolve(elm)
      }
    })

    // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
    observer.observe(parent.document.body, {
      childList: true,
      subtree: true
    })
  })
}
