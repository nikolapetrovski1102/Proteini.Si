// NutritionTableEditor.jsx
import { useState, useEffect } from "react";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";

const NutritionTableEditor = ({ variantId, variantName, onSave }) => {
  const [nutritionData, setNutritionData] = useState({
    columns: [],
    rows: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteData, setPasteData] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const { translate } = useLanguage();

  useEffect(() => {
    if (variantId) {
      loadNutritionData();
    }
  }, [variantId]);

  const loadNutritionData = async () => {
    setLoading(true);
    try {
      const data = await api.getVariantNutrition(variantId);
      if (data && data.columns && data.columns.length > 0) {
        setNutritionData(data);
      } else {
        setNutritionData({
          columns: [
            {
              column_Id: null,
              column_Name: "Nutrient",
              display_Order: 0,
              is_First_Column: true,
            },
          ],
          rows: [],
        });
      }
    } catch (error) {
      console.error("Error loading nutrition data:", error);
      setNutritionData({
        columns: [
          {
            column_Id: null,
            column_Name: "Nutrient",
            display_Order: 0,
            is_First_Column: true,
          },
        ],
        rows: [],
      });
    } finally {
      setLoading(false);
    }
  };

  // Parse Excel/TSV paste data
  const parsePastedData = (text) => {
    // Split by new lines, handle both Windows and Mac line endings
    const lines = text.trim().split(/\r?\n/);

    // Parse each row into cells (tab-separated for Excel)
    const parsedRows = lines.map((line) => line.split(/\t/));

    if (parsedRows.length === 0) return null;

    // First row becomes column headers
    const headers = parsedRows[0];
    const firstColumnHeader = headers[0]?.trim() || "Nutrient";
    const dataHeaders = headers
      .slice(1)
      .map((h) => h.trim())
      .filter((h) => h);

    if (dataHeaders.length === 0) {
      alert("Please include at least one data column in your Excel table");
      return null;
    }

    // Rest of rows become data rows (skip empty rows)
    const dataRows = parsedRows.slice(1).filter((row) => row[0]?.trim());

    if (dataRows.length === 0) {
      alert("Please include at least one row of data");
      return null;
    }

    return {
      firstColumnName: firstColumnHeader,
      columnNames: dataHeaders,
      rows: dataRows
        .map((row) => ({
          rowName: row[0]?.trim() || "",
          values: dataHeaders.reduce((acc, header, idx) => {
            acc[header] = row[idx + 1]?.trim() || "";
            return acc;
          }, {}),
        }))
        .filter((row) => row.rowName !== ""), // Filter out rows with empty row names
    };
  };

  // Import pasted data
  const handlePasteImport = () => {
    if (!pasteData.trim()) {
      alert("Please paste some data first (Ctrl+V)");
      return;
    }

    const parsed = parsePastedData(pasteData);
    if (!parsed || parsed.rows.length === 0) {
      alert(
        "Invalid data format.\n\nPlease copy from Excel including headers.\n\nExpected format:\nNutrient\tPer 100g\tPer Serving\nEnergy (kcal)\t350\t175\nProtein (g)\t25\t12.5",
      );
      return;
    }

    // Check if there's existing data to replace
    const hasExistingData =
      nutritionData.rows.length > 0 || nutritionData.columns.length > 1;

    if (hasExistingData) {
      if (
        !confirm(
          `⚠️ This will REPLACE your current table with:\n\n📊 ${parsed.rows.length} rows\n📋 ${parsed.columnNames.length} columns\n\nCurrent data will be lost. Continue?`,
        )
      ) {
        return;
      }
    }

    // Build columns structure matching your DTO
    const newColumns = [
      {
        column_Id: null,
        column_Name: parsed.firstColumnName,
        display_Order: 0,
        is_First_Column: true,
      },
      ...parsed.columnNames.map((name, idx) => ({
        column_Id: null,
        column_Name: name,
        display_Order: idx + 1,
        is_First_Column: false,
      })),
    ];

    // Build rows structure
    const newRows = parsed.rows.map((row, idx) => ({
      row_Id: null,
      row_Name: row.rowName,
      display_Order: idx,
      values: row.values,
    }));

    setNutritionData({
      columns: newColumns,
      rows: newRows,
    });

    setPasteMode(false);
    setPasteData("");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // Export current table to Excel format (TSV)
  const handleExportToExcel = () => {
    if (nutritionData.rows.length === 0) {
      alert("No data to export");
      return;
    }

    const firstColumn = nutritionData.columns[0];
    const dataColumns = nutritionData.columns.slice(1);

    // Create TSV content (tab-separated for Excel)
    const headers = [
      firstColumn.column_Name,
      ...dataColumns.map((col) => col.column_Name),
    ];
    const rows = nutritionData.rows.map((row) => [
      row.row_Name,
      ...dataColumns.map((col) => row.values[col.column_Name] || ""),
    ]);

    const tsvContent = [
      headers.join("\t"),
      ...rows.map((row) => row.join("\t")),
    ].join("\n");

    // Add BOM for UTF-8 to handle special characters properly
    const blob = new Blob(["\uFEFF" + tsvContent], {
      type: "text/tab-separated-values;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nutrition_${variantName.replace(/[^a-z0-9]/gi, "_")}_${new Date().toISOString().split("T")[0]}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download empty template
  const downloadTemplate = () => {
    const template = [
      "Nutrient\tPer 100g\tPer Serving",
      "Energy (kcal)\t\t",
      "Protein (g)\t\t",
      "Carbohydrates (g)\t\t",
      "Fats (g)\t\t",
      "Fiber (g)\t\t",
      "Sodium (mg)\t\t",
    ].join("\n");

    const blob = new Blob(["\uFEFF" + template], {
      type: "text/tab-separated-values;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nutrition_template_${variantName.replace(/[^a-z0-9]/gi, "_")}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    if (nutritionData.rows.length === 0) {
      alert("No data to save. Please add rows first.");
      return;
    }

    setSaving(true);
    try {
      await api.saveVariantNutrition(variantId, nutritionData);
      alert("✅ Nutrition data saved successfully!");
      if (onSave) onSave();
      await loadNutritionData(); // Reload to get generated IDs
    } catch (error) {
      console.error("Error saving nutrition data:", error);
      alert(
        "❌ Failed to save nutrition data: " +
          (error.message || "Unknown error"),
      );
    } finally {
      setSaving(false);
    }
  };

  const addColumn = () => {
    const newColumnName = prompt("Enter column name:", "New Nutrient");
    if (!newColumnName || !newColumnName.trim()) return;

    const newColumn = {
      column_Id: null,
      column_Name: newColumnName.trim(),
      display_Order: nutritionData.columns.length,
      is_First_Column: false,
    };

    const newRows = nutritionData.rows.map((row) => ({
      ...row,
      values: { ...row.values, [newColumnName.trim()]: "" },
    }));

    setNutritionData({
      columns: [...nutritionData.columns, newColumn],
      rows: newRows,
    });
  };

  const removeColumn = (columnIndex) => {
    const columnToRemove = nutritionData.columns[columnIndex];
    if (columnToRemove.is_First_Column) {
      alert("Cannot remove the first column (Nutrient)");
      return;
    }

    if (!confirm(`Remove column "${columnToRemove.column_Name}"?`)) return;

    const newColumns = nutritionData.columns.filter(
      (_, idx) => idx !== columnIndex,
    );
    const newRows = nutritionData.rows.map((row) => {
      const newValues = { ...row.values };
      delete newValues[columnToRemove.column_Name];
      return { ...row, values: newValues };
    });

    setNutritionData({
      columns: newColumns,
      rows: newRows,
    });
  };

  const updateColumnName = (columnIndex, newName) => {
    if (!newName.trim()) return;
    const oldName = nutritionData.columns[columnIndex].column_Name;
    const newColumns = [...nutritionData.columns];
    newColumns[columnIndex].column_Name = newName.trim();

    const newRows = nutritionData.rows.map((row) => {
      const newValues = { ...row.values };
      if (newValues[oldName] !== undefined) {
        newValues[newName.trim()] = newValues[oldName];
        delete newValues[oldName];
      }
      return { ...row, values: newValues };
    });

    setNutritionData({
      columns: newColumns,
      rows: newRows,
    });
  };

  const addRow = () => {
    const newRowName = prompt("Enter row name:", "New Nutrient");
    if (!newRowName || !newRowName.trim()) return;

    const newRow = {
      row_Id: null,
      row_Name: newRowName.trim(),
      display_Order: nutritionData.rows.length,
      values: {},
    };

    nutritionData.columns.forEach((col) => {
      newRow.values[col.column_Name] = "";
    });

    setNutritionData({
      ...nutritionData,
      rows: [...nutritionData.rows, newRow],
    });
  };

  const removeRow = (rowIndex) => {
    const rowToRemove = nutritionData.rows[rowIndex];
    if (!confirm(`Remove row "${rowToRemove.row_Name}"?`)) return;

    const newRows = nutritionData.rows.filter((_, idx) => idx !== rowIndex);
    setNutritionData({ ...nutritionData, rows: newRows });
  };

  const updateRowName = (rowIndex, newName) => {
    const newRows = [...nutritionData.rows];
    newRows[rowIndex].row_Name = newName;
    setNutritionData({ ...nutritionData, rows: newRows });
  };

  const updateCellValue = (rowIndex, columnName, value) => {
    const newRows = [...nutritionData.rows];
    newRows[rowIndex].values[columnName] = value;
    setNutritionData({ ...nutritionData, rows: newRows });
  };

  if (loading) {
    return (
      <div className="text-center py-4 text-gray-500">
        Loading nutrition data...
      </div>
    );
  }

  const firstColumn = nutritionData.columns[0];
  const dataColumns = nutritionData.columns.slice(1);

  return (
    <div className="mt-6 border-t pt-4">
      {/* Success message */}
      {showSuccess && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          ✅ Data imported successfully! Click "Save" to persist changes.
        </div>
      )}

      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h4 className="text-md font-semibold text-gray-800">
          📊 {translate("dynamicNutritionTable")} - {variantName}
        </h4>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setPasteMode(!pasteMode)}
            className="bg-purple-500 text-white px-3 py-1 text-sm rounded hover:bg-purple-600 flex items-center gap-1"
          >
            📋 {pasteMode ? "Cancel Import" : "Import from Excel"}
          </button>
          <button
            type="button"
            onClick={handleExportToExcel}
            className="bg-green-500 text-white px-3 py-1 text-sm rounded hover:bg-green-600 flex items-center gap-1"
          >
            📊 Export to Excel
          </button>
          <button
            type="button"
            onClick={addColumn}
            className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
          >
            + Add Column
          </button>
          <button
            type="button"
            onClick={addRow}
            className="bg-blue-500 text-white px-3 py-1 text-sm rounded hover:bg-blue-600"
          >
            + Add Row
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2096D8] text-white px-4 py-1 text-sm rounded hover:bg-[#1a7ab9] disabled:opacity-50"
          >
            💾 {saving ? translate("saving") : translate("saveNutritionData")}
          </button>
        </div>
      </div>

      {/* Import UI */}
      {pasteMode && (
        <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
          <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
            <div>
              <h5 className="font-semibold text-yellow-800">
                📋 Import from Excel / Google Sheets
              </h5>
              <p className="text-sm text-yellow-700 mt-1">
                <strong>How to use:</strong>
              </p>
              <ol className="text-sm text-yellow-700 list-decimal list-inside mt-1 space-y-1">
                <li>Open Excel or Google Sheets with your nutrition table</li>
                <li>Select the entire table (including headers)</li>
                <li>
                  Press{" "}
                  <kbd className="px-1 bg-white border rounded">Ctrl+C</kbd> (or{" "}
                  <kbd className="px-1 bg-white border rounded">Cmd+C</kbd>)
                </li>
                <li>
                  Click in the textarea below and press{" "}
                  <kbd className="px-1 bg-white border rounded">Ctrl+V</kbd>
                </li>
                <li>Click "Import Data" to replace the current table</li>
              </ol>
              <p className="text-xs text-yellow-600 mt-2">
                📝 <strong>Expected format:</strong> First row = column headers,
                First column = row names
              </p>
            </div>
            <button
              onClick={downloadTemplate}
              className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 whitespace-nowrap"
            >
              📥 Download Template
            </button>
          </div>
          <textarea
            value={pasteData}
            onChange={(e) => setPasteData(e.target.value)}
            onPaste={(e) => {
              // Optional: auto-capture paste event
              setTimeout(() => {
                setPasteData(e.target.value);
              }, 10);
            }}
            placeholder="Paste your Excel data here (Ctrl+V)"
            className="w-full h-48 border rounded-lg p-3 font-mono text-sm bg-white"
          />
          <div className="flex gap-2 mt-3">
            <button
              onClick={handlePasteImport}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              🔄 Import Data (Replace Current)
            </button>
            <button
              onClick={() => {
                setPasteMode(false);
                setPasteData("");
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Column Management */}
      {dataColumns.length > 0 && (
        <div className="mb-3 p-2 bg-gray-50 rounded flex flex-wrap gap-2 items-center">
          <span className="text-xs font-medium text-gray-600">Columns:</span>
          <div className="flex flex-wrap gap-1">
            <span className="bg-blue-100 px-2 py-1 rounded text-xs font-medium">
              📌 {firstColumn?.column_Name}
            </span>
            {dataColumns.map((col, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 bg-white border rounded px-2 py-1"
              >
                <input
                  type="text"
                  value={col.column_Name}
                  onChange={(e) => updateColumnName(idx + 1, e.target.value)}
                  className="w-24 text-xs border-none outline-none bg-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeColumn(idx + 1)}
                  className="text-red-500 hover:text-red-700 text-sm font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold bg-gray-50 sticky left-0">
                {firstColumn?.column_Name || "Nutrient"}
              </th>
              {dataColumns.map((col, idx) => (
                <th
                  key={idx}
                  className="border border-gray-300 px-3 py-2 text-left font-semibold"
                >
                  {col.column_Name}
                </th>
              ))}
              <th className="border border-gray-300 px-3 py-2 text-center w-12 bg-gray-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {nutritionData.rows.length === 0 ? (
              <tr>
                <td
                  colSpan={dataColumns.length + 2}
                  className="text-center py-8 text-gray-500"
                >
                  {pasteMode
                    ? "Paste your Excel data above and click Import"
                    : "No data yet. Click 'Import from Excel' to get started!"}
                </td>
              </tr>
            ) : (
              nutritionData.rows.map((row, rowIdx) => (
                <tr
                  key={rowIdx}
                  className={rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="border border-gray-300 px-3 py-2 bg-white sticky left-0">
                    <input
                      type="text"
                      value={row.row_Name}
                      onChange={(e) => updateRowName(rowIdx, e.target.value)}
                      className="w-full border-none outline-none bg-transparent font-medium"
                      placeholder="Row name"
                    />
                  </td>
                  {dataColumns.map((col, colIdx) => (
                    <td
                      key={colIdx}
                      className="border border-gray-300 px-3 py-2"
                    >
                      <input
                        type="text"
                        value={row.values[col.column_Name] || ""}
                        onChange={(e) =>
                          updateCellValue(
                            rowIdx,
                            col.column_Name,
                            e.target.value,
                          )
                        }
                        className="w-full border-none outline-none bg-transparent"
                        placeholder="-"
                      />
                    </td>
                  ))}
                  <td className="border border-gray-300 px-3 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(rowIdx)}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-gray-400 mt-2 text-center">
        💡 Tip: You can also select and copy (Ctrl+C) this entire table and
        paste it directly into Excel
      </div>
    </div>
  );
};

export default NutritionTableEditor;
