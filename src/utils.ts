import { BlockEntity, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { SimpleBlockTree } from '..'

export function simplifyBlockTree (blockTree: SimpleBlockTree[] | BlockEntity[]): SimpleBlockTree[] {
  // returns just the content of the blocks
  const blocksContent = blockTree.map(
    // only use children and content keys
    ({ children, content }) => {
      // recursively parse childrens
      const simplifiedChildren: SimpleBlockTree[] = simplifyBlockTree(children as BlockEntity[])
      // only include children key if there are childrens
      if (simplifiedChildren.length > 0) {
        return { children: simplifiedChildren, content }
      } else {
        return { content }
      }
    }
  )
  return blocksContent as SimpleBlockTree[]
}

async function insertChildrenBlocks (children: BlockEntity[] | SimpleBlockTree[], parent: BlockEntity): Promise<void> {
  children.map(async (child) => {
    const createdBlock = await logseq.Editor.insertBlock(parent.uuid, child.content)
    if (child.children !== undefined && createdBlock !== null) {
      await insertChildrenBlocks(child.children as SimpleBlockTree[], createdBlock)
    }
  })
}

export async function appendBlocksFromTree (blocksTree: SimpleBlockTree[], page: PageEntity): Promise<void> {
  blocksTree.map(async (block) => {
    const createdBlock = await logseq.Editor.appendBlockInPage(page.uuid, block.content)
    if (block.children !== undefined && createdBlock !== null) {
      await insertChildrenBlocks(block.children, createdBlock)
    }
  })
}
