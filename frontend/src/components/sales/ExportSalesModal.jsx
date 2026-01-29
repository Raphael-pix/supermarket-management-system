import { Calendar } from "lucide-react";

const ExportSalesModal = ({
  today,
  exportFilters,
  setExportFilters,
  setShowExportModal,
  handleExport,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setShowExportModal(false)}
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10 mx-4">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Export Sales Report
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Start Date</label>
            <input
              type="date"
              className="input"
              max={today}
              value={exportFilters.startDate}
              onChange={(e) => {
                const startDate = e.target.value;

                setExportFilters((prev) => {
                  let endDate = prev.endDate;
                  if (!prev.endDate) {
                    endDate = today;
                  }

                  if (endDate && endDate < startDate) {
                    endDate = today;
                  }

                  return { ...prev, startDate, endDate };
                });
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">End Date</label>
            <input
              type="date"
              className="input"
              min={exportFilters.startDate || undefined}
              max={today}
              value={exportFilters.endDate}
              onChange={(e) => {
                let selectedEndDate = e.target.value;

                if (
                  selectedEndDate > today ||
                  selectedEndDate < exportFilters.startDate
                ) {
                  selectedEndDate = today;
                }

                setExportFilters((prev) => ({
                  ...prev,
                  endDate: selectedEndDate,
                }));
              }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="btn btn-ghost"
            onClick={() => {
              setShowExportModal(false);
              setExportFilters({
                startDate: "",
                endDate: "",
              });
            }}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            disabled={!exportFilters.startDate || !exportFilters.endDate}
            onClick={handleExport}
          >
            Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportSalesModal;
