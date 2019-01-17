import { FileEntry, Directory, FileType } from 'react-aspen'
import { Decoration, TargetMatchMode } from 'aspen-decorations'
import { TreeModelX } from '../TreeModelX';
import { Notificar } from 'notificar'

enum DnDServiceEvent {
    FinishDnD,
}

const MS_TILL_DRAGGED_OVER_EXPANDS = 500

export class DragAndDropService {
    private model: TreeModelX
    private events: Notificar<DnDServiceEvent> = new Notificar()
    private wasBeingDraggedExpanded: boolean
    private beingDraggedItem: FileEntry | Directory
    private draggedOverItem: FileEntry | Directory
    private potentialParent: Directory
    private expandDraggedOverDirectoryTimeout: number
    private beingDraggedDec: Decoration = new Decoration('dragging')
    private draggedOverDec: Decoration = new Decoration('dragover')

    constructor(model: TreeModelX) { this.setModel(model) }

    public onDragAndDrop(cb: (target: FileEntry | Directory, to: Directory) => void) {
        this.events.add(DnDServiceEvent.FinishDnD, cb)
    }

    public setModel(model: TreeModelX) {
        if (this.model) {
            this.model.decorations.removeDecoration(this.beingDraggedDec)
            this.model.decorations.removeDecoration(this.draggedOverDec)
        }
        this.model = model
        this.model.decorations.addDecoration(this.beingDraggedDec)
        this.model.decorations.addDecoration(this.draggedOverDec)
    }

    public handleDragStart = (ev: React.DragEvent, item: FileEntry | Directory) => {
        this.beingDraggedItem = item
        const isDirAndExpanded = (item.type === FileType.Directory && (item as Directory).expanded)
        this.wasBeingDraggedExpanded = isDirAndExpanded
        if (isDirAndExpanded) {
            (item as Directory).setCollapsed()
        }
        this.beingDraggedDec.addTarget(item as any, TargetMatchMode.Self)
    }

    public handleDragEnd = (ev: React.DragEvent, item: FileEntry | Directory) => {
        if (this.wasBeingDraggedExpanded && item.type === FileType.Directory) {
            (item as Directory).setExpanded()
        }
        this.wasBeingDraggedExpanded = false
        this.beingDraggedDec.removeTarget(item)
        this.draggedOverDec.removeTarget(this.potentialParent)
        this.beingDraggedItem = null
        this.potentialParent = null
        if (this.expandDraggedOverDirectoryTimeout) {
            clearTimeout(this.expandDraggedOverDirectoryTimeout)
        }
    }

    public handleDragEnter = (ev: React.DragEvent, item: FileEntry | Directory) => {
        if (this.expandDraggedOverDirectoryTimeout) {
            clearTimeout(this.expandDraggedOverDirectoryTimeout)
        }
        this.draggedOverItem = item
        if (item === this.beingDraggedItem) {
            return
        }
        const newPotentialParent: Directory = (item.type === FileType.Directory && (item as Directory).expanded)
            ? item as Directory
            : item.parent

        if (this.potentialParent !== newPotentialParent && newPotentialParent !== this.beingDraggedItem.parent) {
            this.draggedOverDec.removeTarget(this.potentialParent)
            this.potentialParent = newPotentialParent
            this.draggedOverDec.addTarget(this.potentialParent, TargetMatchMode.SelfAndChildren)
        }

        if (this.potentialParent !== item && item.type === FileType.Directory) {
            this.expandDraggedOverDirectoryTimeout = setTimeout(async () => {
                this.expandDraggedOverDirectoryTimeout = null
                await this.model.root.expandDirectory(item as Directory)
                // make sure it's still the same thing
                if (this.draggedOverItem === item) {
                    this.draggedOverDec.removeTarget(this.potentialParent)
                    this.potentialParent = item as Directory
                    this.draggedOverDec.addTarget(this.potentialParent, TargetMatchMode.SelfAndChildren)
                }
            }, MS_TILL_DRAGGED_OVER_EXPANDS)
        }
    }

    public handleDrop = (ev: React.DragEvent) => {
        ev.preventDefault()
        const item = this.beingDraggedItem
        if (this.wasBeingDraggedExpanded && item.type === FileType.Directory) {
            (item as Directory).setExpanded()
        }
        this.wasBeingDraggedExpanded = false
        this.beingDraggedDec.removeTarget(item)
        this.draggedOverDec.removeTarget(this.potentialParent)

        this.events.dispatch(DnDServiceEvent.FinishDnD, this.beingDraggedItem, this.potentialParent)

        this.beingDraggedItem = null
        this.potentialParent = null
        if (this.expandDraggedOverDirectoryTimeout) {
            clearTimeout(this.expandDraggedOverDirectoryTimeout)
        }
    }

    public handleDragOver = (ev: React.DragEvent) => {
        ev.preventDefault()
    }
}