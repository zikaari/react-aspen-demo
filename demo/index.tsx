import * as BrowserFS from 'browserfs'
import ContextMenu from 'context-menu'
import * as React from 'react'
import { render } from 'react-dom'

import {
    FileType,
    IBasicFileSystemHost,
    IFileEntryItem,
} from 'react-aspen'
import { FileTreeX, TreeModelX } from '../src'

import { initFS } from './fs'

import 'context-menu/lib/styles.css'

const Path = BrowserFS.BFSRequire('path');

(async () => {
    const MOUNT_POINT = '/app'
    // In a real app this could be `fs-extra` as it has `Promise` based API
    const fs = await initFS(MOUNT_POINT)

    // Setup host
    const host: IBasicFileSystemHost = {
        pathStyle: 'unix',
        getItems: async (path) => {
            return await Promise.all(
                (await fs.readdir(path))
                    .map(async (filename) => {
                        const stat = await fs.stat(Path.join(path, filename))
                        return {
                            name: filename,
                            type: stat.isDirectory() ? FileType.Directory : FileType.File
                        }
                    }))
        },
    }

    const treeModelX = new TreeModelX(host, MOUNT_POINT) // second argument can be anything depending on your use case (eg: '/usr' | 'C:\Users\defunkt\Dropbox')

    // used by `FileTreeX` for drag and drop, and rename prompts
    const mv = async (oldPath: string, newPath: string): Promise<boolean> => {
        try {
            await fs.mv(oldPath, newPath)
            return true
        } catch (error) {
            return false // or throw error as you see fit
        }
    }

    // used by `FileTreeX` for when user hits `Enter` key in a new file prompt
    const create = async (pathToNewObject: string, fileType: FileType): Promise<IFileEntryItem> => {
        try {
            if(fileType === FileType.File) {
                await fs.writeFile(pathToNewObject)
            } else {
                await fs.mkdir(pathToNewObject)
            }
            return {
                name: pathToNewObject,
                type: fileType,
            }
        } catch (error) {
            return null // or throw error as you see fit
        }
    }

    // [optional] ensure root level is loaded (`host.getItems('/appv'`)) (again this is not required, it just prevents FOUC due contents not being ready)
    await treeModelX.root.ensureLoaded()

    // lift off
    render(
        <div>
            <ContextMenu theme='light' />
            <FileTreeX height={700} width={350} model={treeModelX} mv={mv} create={create} />
        </div>, document.getElementById('root'));
})()
