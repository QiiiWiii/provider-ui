import assert from 'node:assert/strict'
import test from 'node:test'

import {
  clampSidebarWidth,
  resolveSidebarDrag,
  sidebarCollapseThreshold,
  sidebarMaxWidth,
  sidebarMinWidth,
  sidebarResizeDirections,
} from '../src/lib/sidebar-width.ts'

test('sidebar width is clamped to the range the layout can render', () => {
  assert.equal(clampSidebarWidth(10), sidebarMinWidth)
  assert.equal(clampSidebarWidth(9_000), sidebarMaxWidth)
  assert.equal(clampSidebarWidth(300.6), 301)
})

test('dragging past the collapse threshold snaps the sidebar shut', () => {
  assert.deepEqual(resolveSidebarDrag(sidebarCollapseThreshold - 1), {
    collapsed: true,
  })
  assert.deepEqual(resolveSidebarDrag(0), { collapsed: true })
})

test('widths between the threshold and the minimum open at the minimum', () => {
  assert.deepEqual(resolveSidebarDrag(sidebarCollapseThreshold), {
    collapsed: false,
    width: sidebarMinWidth,
  })
  assert.deepEqual(resolveSidebarDrag(sidebarMinWidth - 1), {
    collapsed: false,
    width: sidebarMinWidth,
  })
})

test('the edge reports both directions until it runs out of one', () => {
  assert.equal(sidebarResizeDirections(false, 300), 'both')
  assert.equal(sidebarResizeDirections(false, sidebarMaxWidth), 'left')
  assert.equal(sidebarResizeDirections(true, 0), 'right')
})

test('the minimum width is not a dead end, because narrower means collapsed', () => {
  assert.equal(sidebarResizeDirections(false, sidebarMinWidth), 'both')
})

test('a drag inside the range keeps the width it asked for', () => {
  assert.deepEqual(resolveSidebarDrag(300), { collapsed: false, width: 300 })
  assert.deepEqual(resolveSidebarDrag(sidebarMaxWidth + 50), {
    collapsed: false,
    width: sidebarMaxWidth,
  })
})
