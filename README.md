# React Aspen Demo

This repository implements a filetree component on top of low-level API's offered by [`react-aspen`](https://github.com/neeksandhu/react-aspen), a library for rendering nested trees in React apps very efficiently.

All the UI features you expect from a filetree are available out-of-the-box, for example:
 - Expand/Collapse folders
 - Drag and Drop files/folders
 - Keyboard shorcuts (Arrow up/down/left/right, Enter, F2, etc.)
 - Inline file renaming and creation
 - A complete decoration (styling) system
 - Context menu interactions

<div>
    <img src="https://i.imgur.com/94wkW8q.gif" width="350" alt="Aspen filetree animated demo" style="float: left;margin-right: 10px;margin-bottom: 10px;">
    <div style="display: inline-block;">
        <div>
          <img src="https://i.imgur.com/cTtXhow.gif" width="350" alt="Aspen filetree animated demo" style="display: block">
          <h4>Inline renaming</h4>
      </div>
      <div>
        <img src="https://i.imgur.com/DSTJCeD.gif" width="350" alt="Aspen filetree animated demo">
        <h4>Inline file creation</h4>
      </div>
    </div>
    <div style="clear: both"></div>
</div>

## Performance

> *(as of yet, no other implementation has outperformed `react-aspen` as far as raw numbers are concerned)*

A large part of the performance edge comes from the fact that `react-aspen` uses virtualization/windowing to render trees instead of a nested DOM node structure.

Here's a section taken from [reactjs.org]() that describes windowing in detail:

> If your application renders long lists of data (hundreds or thousands of rows), we recommended using a technique known as “windowing”. This technique only renders
a small subset of your rows at any given time, and can dramatically reduce the time it takes to re-render the components as well as the number of DOM nodes created.

This also allows browsers to chillout since they no longer have to do extensive bookkeeping of extensive number of DOM nodes.

## Usage

This repo lives as a base template for developers who want a filetree in their apps (electron/webapps). Unlike the core engine, `react-aspen`, this isn't published on `npm` as a package
by design. Part of the reason is to emphasize on the customization part of `react-aspen`, something we want the developer to be in full control of.

So to integrate a filetree in your app, either extract the contents of `src/` to some directory in your codebase and call it a day, or, add this repository as a git submodule.
The problem with former option is that you'll loose all the "git'ty" features from that point on, meaning you won't get any changes made in the upstream branch without having
to manually copy/paste stuff.

Alternatively (and preferably), you should consider `npm` package scoping. To do so, fork this repo to your account, make changes as you see fit and then publish you *custom*
filetree on `npm` under a scopename like `@zeit/filetree`, `@axosoft/filetree-component`, etc. and then consume it like a regular `npm` package.

Speaking of `npm`, you can also use `lerna` to "contain" your app in one place while still being separate pieces.

Should you go with the forking method, I suggest you create appropriate branches for the changes you make and then make a PR to this repository. That way the changes you make can
be isolated and PR'd back to this repository as community payback. Your contributions will help all of us 🙂

### Required/Expected patching

You can port everything except context menu service.

Depending on what setup you're running, or how context menus work in your app. You'll have to unplug some wires here and there to make it work. For the most part you'll
most likely need to modify `src/services/contextMenu.ts` file and change the implementation of `#showContextMenu` function. After that, you should be all set and ready to deploy 🚀

Just provide the `FileTree` the API it needs, example of which can be found in `demo/` directory, which demonstrates how `react-aspen` would work with `fs-extra`, a beautiful
`Promise` based wrapper around Node.js `fs` module.

Aside from required patching, you'll also need to provide a file watching service service if you want `react-aspen` to stay in sync with actual filesystem's state. We recommend
`@atom/watcher` if you'll be using this in an `electron` app. It is the most "futuristic" watcher out of all we tried.

## License

This repository is licensed under MIT license. You're free to copy, modify, distribute the code without any restriction (crediting is not required, but highly appreciated)
