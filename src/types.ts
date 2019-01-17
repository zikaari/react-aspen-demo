import { IFileTreeHandle, FileEntry, Directory, TreeModel, FileType, IFileEntryItem, IItemRenderer } from 'react-aspen'
import { IDisposable } from 'notificar'
import { TreeModelX } from './TreeModelX'

export interface IItemRendererX extends IItemRenderer {
    getBoundingClientRectForItem(item: FileEntry | Directory): ClientRect
}
// Here imagination is your limit! IFileTreeHandle has core low-level features you can build on top of as your application needs
export interface IFileTreeXHandle extends IFileTreeHandle {
    getActiveFile(): FileEntry | Directory
    setActiveFile(path: string)
    setActiveFile(file: FileEntry)
    setActiveFile(dir: Directory)

    getPseudoActiveFile(): FileEntry | Directory
    setPseudoActiveFile(path: string)
    setPseudoActiveFile(file: FileEntry)
    setPseudoActiveFile(dir: Directory)

    rename(path: string)
    rename(file: FileEntry)
    rename(dir: Directory)

    newFile(dirpath: string)
    newFile(dir: Directory)
    newFolder(dirpath: string)
    newFolder(dir: Directory)
    toggleDirectory(path: string)
    toggleDirectory(dir: Directory)

    getModel(): TreeModelX
    /**
     * If document.activeElement === filetree wrapper element
     */
    hasDirectFocus(): boolean

    // events
    onBlur(callback: () => void): IDisposable
}

export interface IFileTreeXProps {
    height: number
    width: number
    model: TreeModelX

    /**
     * Same as unix's `mv` command as in `mv [SOURCE] [DEST]`
     */
    mv: (oldPath: string, newPath: string) => boolean | Promise<boolean>

    /**
     * Amalgam of unix's `mkdir` and `touch` command
     */
    create: (path: string, type: FileType) => IFileEntryItem | Promise<IFileEntryItem>
    onReady?: (handle: IFileTreeXHandle) => void
}

export enum FileTreeXEvent {
    OnBlur,
}
