import { useCallback } from 'react';

import {
  ensurePluginOrder,
} from '../publicUtils'

export const useRowSpan = hooks => {
  hooks.useInstance.push(useInstance)
  hooks.visibleColumns.push(visibleColumns)
}

useRowSpan.pluginName = 'useRowSpan'

function useInstance(instance) {
  const {
    plugins,
    rows,
    rowSpanEnabled = true,
    rowSpanHierarchy = true
  } = instance;

  ensurePluginOrder(plugins, ['useFilters', 'useSortBy'], 'useRowSpan')

  const spanRow = useCallback((row, i) => {
    let numCells = row.allCells.length;
    
    let parentBoundary = false;
    for (let j = 0; j < numCells; j++) {
      let cell = row.allCells[j];
      let column = cell.column;
      
      if (rowSpanEnabled && column.enableRowSpan) {
        if (
          column.topCellValue !== cell.value // we have a non-duplicate cell
            || cell.value === ""             // or we have a blank cell
            || (rowSpanHierarchy && parentBoundary) // or boundary crossed
            || column.topCellValue === null // or we are on the first row
        ) { // this is a top cell.
          column.topCellValue = cell.value;
          column.topCellIndex = i;
          parentBoundary = true;
          cell.spannedRows = [row];
          cell.rowSpan = 1;
          cell.isRowSpanned = false;
        } else { // cell is a duplicate and should be row-spanned.
          cell.isRowSpanned = true;
          // update the top cell. need to reach back in the array.
          rows[column.topCellIndex].allCells[j].rowSpan++;
          rows[column.topCellIndex].allCells[j].spannedRows.push(row)
        }
      } // else rowspan disabled for this cell - do nothing.
    }
    return row;
  })

  Object.assign(instance, {
    spanRow
  })
}

function visibleColumns(columns) {
  columns.forEach(column => {
    if (column.enableRowSpan) {
      column.topCellValue = null;
      column.topCellIndex = 0;
    }
  })

  return columns;
}
