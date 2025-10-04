# VSCode 設定

VSCode の設定などを書き留めておきます。

## settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.stickyScroll.enabled": false,
  "markdown-preview-enhanced.previewTheme": "atom-dark.css",
  "redhat.telemetry.enabled": false,
  "terminal.integrated.enableMultiLinePasteWarning": "never",
  "terminal.integrated.stickyScroll.enabled": false,
  "workbench.secondarySideBar.defaultVisibility": "hidden",
  "workbench.tree.enableStickyScroll": false,
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

## テーマ設定

### 背景色をネイビーにしたやつ

```json
{
  // for VSCode theme customize
  "workbench.colorCustomizations": {
    "activityBar.background": "#051325",
    "badge.background": "#0063a5",
    "button.background": "#2b3c5d",
    "debugExceptionWidget.background": "#051325",
    "debugExceptionWidget.border": "#ab395b",
    "debugToolBar.background": "#051325",
    "diffEditor.insertedTextBackground": "#31958a55",
    "diffEditor.removedTextBackground": "#892f4688",
    "dropdown.background": "#181f2f",
    "editor.background": "#000c18",
    "editor.findMatchHighlightBackground": "#eeeeee44",
    "editor.lineHighlightBackground": "#082050",
    "editorCursor.foreground": "#ddbb88",
    "editorGroup.border": "#2b2b4a",
    "editorGroup.dropBackground": "#25375daa",
    "editorGroupHeader.tabsBackground": "#051325",
    "editorHoverWidget.background": "#000c38",
    "editorHoverWidget.border": "#004c18",
    "editorIndentGuide.activeBackground1": "#204972",
    "editorIndentGuide.background1": "#002952",
    "editorLineNumber.activeForeground": "#80a2c2",
    "editorLineNumber.foreground": "#406385",
    "editorLink.activeForeground": "#0063a5",
    "editorMarkerNavigation.background": "#060621",
    "editorMarkerNavigationError.background": "#ab395b",
    "editorMarkerNavigationWarning.background": "#5b7e7a",
    "editorWhitespace.foreground": "#103050",
    "editorWidget.background": "#262641",
    "extensionButton.prominentBackground": "#5f8b3b",
    "extensionButton.prominentHoverBackground": "#5f8b3bbb",
    "focusBorder": "#596f99",
    "input.background": "#181f2f",
    "inputOption.activeBorder": "#1d4a87",
    "inputValidation.errorBackground": "#a22d44",
    "inputValidation.errorBorder": "#ab395b",
    "inputValidation.infoBackground": "#051325",
    "inputValidation.infoBorder": "#384078",
    "inputValidation.warningBackground": "#5b7e7a",
    "inputValidation.warningBorder": "#5b7e7a",
    "list.activeSelectionBackground": "#08286b",
    "list.dropBackground": "#041d52",
    "list.highlightForeground": "#0063a5",
    "list.hoverBackground": "#79797933",
    "list.inactiveSelectionBackground": "#79797944",
    "notificationCenterHeader.background": "#000c18",
    "notificationCenterHeader.foreground": "#cccccc",
    "notifications.background": "#000c18",
    "notifications.border": "#79797933",
    "notifications.foreground": "#cccccc",
    "panel.background": "#051325",
    "panel.border": "#2b2b4a",
    "peekView.border": "#2b2b4a",
    "peekViewEditor.background": "#10192c",
    "peekViewEditor.matchHighlightBackground": "#eeeeee33",
    "peekViewResult.background": "#060621",
    "peekViewResult.matchHighlightBackground": "#eeeeee44",
    "peekViewTitle.background": "#10192c",
    "pickerGroup.border": "#596f99",
    "pickerGroup.foreground": "#596f99",
    "ports.iconRunningProcessForeground": "#80a2c2",
    "progressBar.background": "#0063a5",
    "quickInputList.focusBackground": "#08286b",
    "scrollbar.shadow": "#515e91aa",
    "scrollbarSlider.activeBackground": "#3b3f5188",
    "scrollbarSlider.background": "#79797944",
    "scrollbarSlider.hoverBackground": "#3b3f5188",
    "sideBar.background": "#051325",
    "sideBarSectionHeader.background": "#051325",
    "statusBar.background": "#10192c",
    "statusBar.debuggingBackground": "#10192c",
    "statusBar.noFolderBackground": "#10192c",
    "statusBarItem.prominentBackground": "#0063a5",
    "statusBarItem.prominentHoverBackground": "#0063a5dd",
    "statusBarItem.remoteBackground": "#0063a5",
    "tab.activeBackground": "#000c18",
    "tab.border": "#2b2b4a",
    "tab.hoverBackground": "#000c18",
    "tab.inactiveBackground": "#051325",
    "tab.lastPinnedBorder": "#2b3c5d",
    "tab.unfocusedActiveBackground": "#000c18",
    "terminal.ansiBlack": "#111111",
    "terminal.ansiBlue": "#bbdaff",
    "terminal.ansiBrightBlack": "#333333",
    "terminal.ansiBrightBlue": "#80baff",
    "terminal.ansiBrightCyan": "#78ffff",
    "terminal.ansiBrightGreen": "#b8f171",
    "terminal.ansiBrightMagenta": "#d778ff",
    "terminal.ansiBrightRed": "#ff7882",
    "terminal.ansiBrightWhite": "#ffffff",
    "terminal.ansiBrightYellow": "#ffe580",
    "terminal.ansiCyan": "#99ffff",
    "terminal.ansiGreen": "#d1f1a9",
    "terminal.ansiMagenta": "#ebbbff",
    "terminal.ansiRed": "#ff9da4",
    "terminal.ansiWhite": "#cccccc",
    "terminal.ansiYellow": "#ffeead",
    "titleBar.activeBackground": "#051325"
  }
}
```
