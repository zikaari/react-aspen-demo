import * as BrowserFS from 'browserfs'
import { FileSystem } from 'browserfs/dist/node/core/file_system'
import Stats from 'browserfs/dist/node/core/node_fs_stats'

class PromisedFS {
    private fs: FileSystem
    constructor(fs) {
        this.fs = fs
    }

    public writeFile = (path: string, data?: any) => new Promise((res, rej) => {
        this.fs.writeFile(path, data || '', null, {
            pathNotExistsAction: () => 3,
            isWriteable: () => true,
            isSynchronous: () => true
        } as any, null, (err) => err ? rej(err) : res())
    })

    public mkdir = (path: string, mode?) => new Promise((res, rej) => {
        this.fs.mkdir(path, mode, (err) => err ? rej(err) : res())
    })

    public readdir = (path: string) => new Promise<string[]>((res, rej) => {
        this.fs.readdir(path, (err, files) => err ? rej(err) : res(files))
    })

    public stat = (path: string) => new Promise<Stats>((res, rej) => {
        this.fs.stat(path, false, (err, stats) => err ? rej(err) : res(stats))
    })

    public mv = (source: string, dest: string) => new Promise((res, rej) => {
        this.fs.rename(source, dest, (renameErr) => {
            if (renameErr) {
                this.fs.link(source, dest, (linkErr) => {
                    if (linkErr) {
                        rej(linkErr)
                    }
                    this.fs.unlink(source, (unlinkErr) => unlinkErr ? rej(unlinkErr) : res())
                })
            } else {
                res()
            }
        })
    })
}

export async function initFS(mountPoint: string) {
    const treeTemplate = {
        'yarn.lock': '',
        'package.json': '',
        '.gitignore': '',
        'etc': {
            'lib': {},
            '.apps': {
                'timer': {
                    'package.json': '',
                    'src': {
                        'components': {
                            'main.ts': '',
                            'header.ts': '',
                            'footer.ts': ''
                        },
                        'styles': {
                            'main.css': '',
                            'index.css': ''
                        }
                    },
                },
                'devtools': {
                    'www': {
                        'index.html': '',
                        'index.css': '',
                        'main.js': '',
                    },
                    'var': {
                        'debug.log': '',
                        'yarn.lock': ''
                    },
                    'package.json': ''
                }
            },

        },
        'usr': {
            'apps': {
                'zip': '',
                'md5sum': '',
                'sha256sum': '',
                'package.json': '',
                'lodash.js': '',
                'lodash.min.js': '',
            },
            'trash': {
                'logo.png': '',
                'lodash': {
                    'package.json': '',
                    'lodash.js': '',
                    'lodash.min.js': '',
                }
            }
        },
        '.trash': {
            'third_party': {
                'mozilla': {
                    'firebug': {},
                    'thimble': {},
                },
            },
            'zip': '',
            'md5sum': '',
            'sha256sum': '',
            'package.json': '',
            'lodash.js': '',
            'lodash.min.js': '',
        }
    }

    const loadFS = () => new Promise((res, rej) => {
        BrowserFS.getFileSystem({
            fs: 'InMemory',
            options: {}
        }, (err, resd) => err ? rej(err) : res(resd))
    })

    const Path = BrowserFS.BFSRequire('path')

    const fillFS = async (fs: PromisedFS) => {
        const fill = async (path, tree) => {
            for (let filename in tree) {
                const node = tree[filename]
                const _path = Path.join(path, filename)
                if (typeof node !== 'string') {
                    await fs.mkdir(_path)
                    await fill(_path, node)
                } else {
                    await fs.writeFile(_path)
                }
            }
        }
        await fs.mkdir(mountPoint)
        return fill(mountPoint, treeTemplate)
    }
    const fs = new PromisedFS(await loadFS())
    await fillFS(fs)
    return fs
}