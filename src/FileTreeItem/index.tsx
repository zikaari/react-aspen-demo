import cn from 'classnames'
import * as React from 'react'
import { ClasslistComposite } from 'aspen-decorations'
import { Directory, FileEntry, IItemRendererProps, ItemType, PromptHandle, RenamePromptHandle, FileType } from 'react-aspen'
import { DragAndDropService } from '../services/dragAndDrop';

import './styles.sass'

interface IItemRendererXProps {
    /**
     * In this implementation, decoration are null when item is `PromptHandle`
     * 
     * If you would like decorations for `PromptHandle`s, then get them using `DecorationManager#getDecorations(<target>)`.
     * Where `<target>` can be either `NewFilePromptHandle.parent` or `RenamePromptHandle.target` depending on type of `PromptHandle`
     * 
     * To determine the type of `PromptHandle`, use `IItemRendererProps.itemType`
     */
    decorations: ClasslistComposite
    dndService: DragAndDropService
    onClick: (ev: React.MouseEvent, item: FileEntry | Directory, type: ItemType) => void
    onContextMenu: (ev: React.MouseEvent, item: FileEntry | Directory, type: ItemType) => void
}

// DO NOT EXTEND FROM PureComponent!!! You might miss critical changes made deep within `item` prop
// as far as efficiency is concerned, `react-aspen` works hard to ensure unnecessary updates are ignored
export class FileTreeItem extends React.Component<IItemRendererXProps & IItemRendererProps> {
    public static getBoundingClientRectForItem(item: FileEntry | Directory): ClientRect {
        const divRef = FileTreeItem.itemIdToRefMap.get(item.id)
        if (divRef) {
            return divRef.getBoundingClientRect()
        }
        return null
    }

    // ensure this syncs up with what goes in CSS, (em, px, % etc.) and what ultimately renders on the page
    public static readonly renderHeight: number = 24
    private static readonly itemIdToRefMap: Map<number, HTMLDivElement> = new Map()

    constructor(props) {
        super(props)
        // used to apply decoration changes, you're welcome to use setState or other mechanisms as you see fit
        this.forceUpdate = this.forceUpdate.bind(this)
    }

    public render() {
        const { item, itemType, decorations } = this.props

        const isRenamePrompt = itemType === ItemType.RenamePrompt
        const isNewPrompt = itemType === ItemType.NewDirectoryPrompt || itemType === ItemType.NewFilePrompt
        const isPrompt = isRenamePrompt || isNewPrompt
        const isDirExpanded = itemType === ItemType.Directory
            ? (item as Directory).expanded
            : itemType === ItemType.RenamePrompt && (item as RenamePromptHandle).target.type === FileType.Directory
                ? ((item as RenamePromptHandle).target as Directory).expanded
                : false

        const fileOrDir =
            (itemType === ItemType.File ||
                itemType === ItemType.NewFilePrompt ||
                (itemType === ItemType.RenamePrompt && (item as RenamePromptHandle).target.constructor === FileEntry))
                ? 'file'
                : 'directory'

        return (
            <div
                className={cn('file-entry', {
                    renaming: isRenamePrompt,
                    prompt: isRenamePrompt || isNewPrompt,
                    new: isNewPrompt,
                }, fileOrDir, decorations ? decorations.classlist : null, `depth-${item.depth}`)}
                data-depth={item.depth}
                onContextMenu={this.handleContextMenu}
                onClick={this.handleClick}
                onDragStart={this.handleDragStart}
                onDragEnd={this.handleDragEnd}
                onDragEnter={this.handleDragEnter}
                onDragOver={this.handleDragOver}
                onDrop={this.handleDrop}
                // required for rendering context menus when opened through context menu button on keyboard
                ref={this.handleDivRef}
                draggable={true}
                title={!isPrompt ? (item as FileEntry).path : null}>

                {!isNewPrompt && fileOrDir === 'directory' ?
                    <i className={cn('directory-toggle', isDirExpanded ? 'open' : '')} />
                    : null
                }

                <span className='file-label'>
                    <i className={cn('file-icon', isNewPrompt ? 'new' : '', fileOrDir)} />
                    <span className='file-name'>
                        {isPrompt && item instanceof PromptHandle
                            ? <><item.ProxiedInput /><span className='prompt-err-msg'></span></>
                            : (item as FileEntry).fileName
                        }
                    </span>
                </span>
            </div>)
    }

    public componentDidMount() {
        if (this.props.decorations) {
            this.props.decorations.addChangeListener(this.forceUpdate)
        }
    }

    public componentWillUnmount() {
        if (this.props.decorations) {
            this.props.decorations.removeChangeListener(this.forceUpdate)
        }
    }

    public componentDidUpdate(prevProps: IItemRendererXProps) {
        if (prevProps.decorations) {
            prevProps.decorations.removeChangeListener(this.forceUpdate)
        }
        if (this.props.decorations) {
            this.props.decorations.addChangeListener(this.forceUpdate)
        }
    }

    private handleDivRef = (r: HTMLDivElement) => {
        if (r === null) {
            FileTreeItem.itemIdToRefMap.delete(this.props.item.id)
        } else {
            FileTreeItem.itemIdToRefMap.set(this.props.item.id, r)
        }
    }

    private handleContextMenu = (ev: React.MouseEvent) => {
        // context menu event when caused by user pressing context menu key on keyboard is handled in parent component
        if (ev.nativeEvent.which === 0) {
            return
        }
        const { item, itemType, onContextMenu } = this.props
        if (itemType === ItemType.File || itemType === ItemType.Directory) {
            onContextMenu(ev, item as FileEntry, itemType)
        }
    }

    private handleClick = (ev: React.MouseEvent) => {
        const { item, itemType, onClick } = this.props
        if (itemType === ItemType.File || itemType === ItemType.Directory) {
            onClick(ev, item as FileEntry, itemType)
        }
    }

    private handleDragStart = (ev: React.DragEvent) => {
        const { item, itemType, dndService } = this.props
        if (itemType === ItemType.File || itemType === ItemType.Directory) {
            const ref = FileTreeItem.itemIdToRefMap.get(item.id)
            if (ref) {
                ref.style.background = 'none'
                const label$ = ref.querySelector('.file-label') as HTMLDivElement
                label$.style.borderRadius = '1em'
                label$.style.padding = '2px 8px'
                label$.style.background = '#313131'

                ev.dataTransfer.setDragImage(label$, -5, -5);
                // once image is set, clean up in the very next frame
                requestAnimationFrame(() => {
                    ref.style.background = ''
                    label$.style.borderRadius = ''
                    label$.style.padding = ''
                    label$.style.background = ''
                })
            }
            dndService.handleDragStart(ev, item as FileEntry)
        }
    }

    private handleDragEnd = (ev: React.DragEvent) => {
        const { item, itemType, dndService } = this.props
        if (itemType === ItemType.File || itemType === ItemType.Directory) {
            dndService.handleDragEnd(ev, item as FileEntry)
        }
    }

    private handleDragEnter = (ev: React.DragEvent) => {
        const { item, itemType, dndService } = this.props
        if (itemType === ItemType.File || itemType === ItemType.Directory) {
            dndService.handleDragEnter(ev, item as FileEntry)
        }
    }

    private handleDrop = (ev: React.DragEvent) => {
        const { item, itemType, dndService } = this.props
        if (itemType === ItemType.File || itemType === ItemType.Directory) {
            dndService.handleDrop(ev)
        }
    }

    private handleDragOver = (ev: React.DragEvent) => {
        const { item, itemType, dndService } = this.props
        if (itemType === ItemType.File || itemType === ItemType.Directory) {
            dndService.handleDragOver(ev)
        }
    }
}
