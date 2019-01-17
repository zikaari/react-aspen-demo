import { FileEntry, Directory, FileType } from 'react-aspen'
import { IFileTreeXHandle } from '../types'

export class KeyboardHotkeys {
    private hotkeyActions = {
        'ArrowUp': () => this.jumpToPrevItem(),
        'ArrowDown': () => this.jumpToNextItem(),
        'ArrowRight': () => this.expandOrJumpToFirstChild(),
        'ArrowLeft': () => this.collapseOrJumpToFirstParent(),
        'Space': () => this.toggleDirectoryExpand(),
        'Enter': () => this.selectFileOrToggleDirState(),
        'Home': () => this.jumpToFirstItem(),
        'End': () => this.jumpToLastItem(),
        'F2': () => this.triggerRename(),
        'Escape': () => this.resetSteppedOrSelectedItem(),
    }

    constructor(private readonly fileTreeX: IFileTreeXHandle) { }

    public handleKeyDown = (ev: React.KeyboardEvent) => {
        if (!this.fileTreeX.hasDirectFocus()) {
            return false
        }
        const { code } = ev.nativeEvent
        if (code in this.hotkeyActions) {
            ev.preventDefault()
            this.hotkeyActions[code]()
            return true
        }
    }

    private jumpToFirstItem = (): void => {
        const { root } = this.fileTreeX.getModel()
        this.fileTreeX.setPseudoActiveFile(root.getFileEntryAtIndex(0))
    }

    private jumpToLastItem = (): void => {
        const { root } = this.fileTreeX.getModel()
        this.fileTreeX.setPseudoActiveFile(root.getFileEntryAtIndex(root.branchSize - 1))
    }

    private jumpToNextItem = (): void => {
        const { root } = this.fileTreeX.getModel()
        let currentPseudoActive = this.fileTreeX.getPseudoActiveFile()
        if (!currentPseudoActive) {
            const selectedFile = this.fileTreeX.getActiveFile()
            if (selectedFile) {
                currentPseudoActive = selectedFile
            } else {
                return this.jumpToFirstItem()
            }
        }
        const idx = root.getIndexAtFileEntry(currentPseudoActive)
        if (idx + 1 > root.branchSize) {
            return this.jumpToFirstItem()
        } else if (idx > -1) {
            this.fileTreeX.setPseudoActiveFile(root.getFileEntryAtIndex(idx + 1))
        }
    }

    private jumpToPrevItem = (): void => {
        const { root } = this.fileTreeX.getModel()
        let currentPseudoActive = this.fileTreeX.getPseudoActiveFile()
        if (!currentPseudoActive) {
            const selectedFile = this.fileTreeX.getActiveFile()
            if (selectedFile) {
                currentPseudoActive = selectedFile
            } else {
                return this.jumpToLastItem()
            }
        }
        const idx = root.getIndexAtFileEntry(currentPseudoActive)
        if (idx - 1 < 0) {
            return this.jumpToLastItem()
        } else if (idx > -1) {
            this.fileTreeX.setPseudoActiveFile(root.getFileEntryAtIndex(idx - 1))
        }
    }

    private expandOrJumpToFirstChild(): void {
        const currentPseudoActive = this.fileTreeX.getPseudoActiveFile()
        if (currentPseudoActive && currentPseudoActive.type === FileType.Directory) {
            if ((currentPseudoActive as Directory).expanded) {
                return this.jumpToNextItem()
            } else {
                this.fileTreeX.openDirectory(currentPseudoActive as Directory)
            }
        }
    }

    private collapseOrJumpToFirstParent(): void {
        const currentPseudoActive = this.fileTreeX.getPseudoActiveFile()
        if (currentPseudoActive) {
            if (currentPseudoActive.type === FileType.Directory && (currentPseudoActive as Directory).expanded) {
                return this.fileTreeX.closeDirectory(currentPseudoActive as Directory)
            }
            this.fileTreeX.setPseudoActiveFile(currentPseudoActive.parent)
        }
    }

    private triggerRename(): void {
        const currentPseudoActive = this.fileTreeX.getPseudoActiveFile()
        if (currentPseudoActive) {
            this.fileTreeX.rename(currentPseudoActive)
        }
    }

    private selectFileOrToggleDirState = (): void => {
        const currentPseudoActive = this.fileTreeX.getPseudoActiveFile()
        if (!currentPseudoActive) { return }
        if (currentPseudoActive.type === FileType.Directory) {
            this.fileTreeX.toggleDirectory(currentPseudoActive as Directory)
        } else if (currentPseudoActive.type === FileType.File) {
            this.fileTreeX.setActiveFile(currentPseudoActive as FileEntry)
        }
    }

    private toggleDirectoryExpand = (): void => {
        const currentPseudoActive = this.fileTreeX.getPseudoActiveFile()
        if (!currentPseudoActive) { return }
        if (currentPseudoActive.type === FileType.Directory) {
            this.fileTreeX.toggleDirectory(currentPseudoActive as Directory)
        }
    }

    private resetSteppedOrSelectedItem = (): void => {
        const currentPseudoActive = this.fileTreeX.getPseudoActiveFile()
        if (currentPseudoActive) {
            return this.resetSteppedItem()
        }
        this.fileTreeX.setActiveFile(null)
    }

    private resetSteppedItem = () => {
        this.fileTreeX.setPseudoActiveFile(null)
    }
}
