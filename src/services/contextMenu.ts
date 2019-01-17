import { IFileTreeXHandle } from '../types'
import ContextMenu, { IPosition } from 'context-menu'
import insertIf from 'insert-if'
import { FileEntry, Directory } from 'react-aspen'

export function showContextMenu(ev: React.MouseEvent, treeH: IFileTreeXHandle, item: FileEntry | Directory, pos?: IPosition) {
    if (pos) {
        ev.preventDefault()
    }
    ContextMenu.showMenu([
        [
            ...insertIf(item instanceof Directory,
                {
                    label: 'New File',
                    onClick() {
                        treeH.newFile(item as any)
                    }
                }, {
                    label: 'New Folder',
                    onClick() {
                        treeH.newFolder(item as any)
                    }
                }),
            {
                label: 'Rename',
                onClick() {
                    treeH.rename(item as any)
                }
            },
        ]
    ] as any, pos || ev.nativeEvent)
}
