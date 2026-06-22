import { useEffect, useMemo, useState } from 'react';

function compareValues(a, b) {
  if (a === null || a === undefined) return -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  return String(a).localeCompare(String(b), 'fr', { sensitivity: 'base', numeric: true });
}

/**
 * Tableau générique avec recherche, tri par colonne et pagination, sans
 * dépendance externe.
 *
 * columns: [{
 *   key: string,                 // identifiant unique de la colonne
 *   label: string,                // en-tête affiché
 *   accessor?: (row) => any,      // valeur utilisée pour le tri/la recherche (défaut: row[key])
 *   render?: (row) => ReactNode,  // affichage personnalisé de la cellule (défaut: row[key])
 *   sortable?: boolean,           // défaut: true
 *   searchable?: boolean,         // défaut: true
 * }]
 */
function DataTable({
  columns,
  data,
  rowKey,
  searchPlaceholder = 'Rechercher...',
  pageSize = 10,
  emptyMessage = 'Aucun résultat.',
  rowClassName,
  onRowClick,
}) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: null, direction: null });
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const term = search.trim().toLowerCase();

    return data.filter((row) =>
      columns.some((col) => {
        if (col.searchable === false) return false;
        const value = col.accessor ? col.accessor(row) : row[col.key];
        return String(value ?? '').toLowerCase().includes(term);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sort.key || !sort.direction) return filtered;
    const column = columns.find((c) => c.key === sort.key);
    if (!column) return filtered;

    return [...filtered].sort((rowA, rowB) => {
      const valueA = column.accessor ? column.accessor(rowA) : rowA[column.key];
      const valueB = column.accessor ? column.accessor(rowB) : rowB[column.key];
      const result = compareValues(valueA, valueB);
      return sort.direction === 'asc' ? result : -result;
    });
  }, [filtered, sort, columns]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, currentPage, pageSize]);

  function toggleSort(column) {
    if (column.sortable === false) return;

    setSort((current) => {
      if (current.key !== column.key) {
        return { key: column.key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key: column.key, direction: 'desc' };
      }
      return { key: null, direction: null };
    });
  }

  function sortIndicator(column) {
    if (column.sortable === false) return null;
    if (sort.key !== column.key) return <span className="sort-icon">↕</span>;
    return <span className="sort-icon active">{sort.direction === 'asc' ? '↑' : '↓'}</span>;
  }

  return (
    <div className="datatable">
      <div className="datatable-toolbar">
        <input
          type="search"
          className="datatable-search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="datatable-count">
          {sorted.length} résultat{sorted.length > 1 ? 's' : ''}
        </span>
      </div>

      {sorted.length === 0 ? (
        <div className="empty-state">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <>
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => toggleSort(column)}
                    className={column.sortable === false ? '' : 'sortable'}
                  >
                    {column.label} {sortIndicator(column)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row) => (
                <tr
                  key={rowKey(row)}
                  className={[rowClassName ? rowClassName(row) : '', onRowClick ? 'clickable-row' : '']
                    .filter(Boolean)
                    .join(' ') || undefined}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((column) => (
                    <td key={column.key}>
                      {column.render ? column.render(row) : row[column.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="datatable-pagination">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ← Précédent
              </button>

              <span>
                Page {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default DataTable;
