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
