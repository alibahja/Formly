import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";

import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import SubmissionsTable from "../components/SubmissionsTable";
import SubmissionDrawer from "../components/SubmissionDrawer";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "read", label: "Read" },
  { key: "archived", label: "Archived" },
];

const SubmissionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    activeForm,
    loadingActiveForm,
    loadForm,
    submissions,
    loadingSubmissions,
    loadSubmissions,
    handleUpdateSubmissionStatus,
    handleDeleteSubmission,
  } = useAppContext();

  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);

  // Load form + submissions
  useEffect(() => {
    if (!id) return;
    if (!activeForm || activeForm._id !== id) loadForm(id);
    loadSubmissions(id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reload when filter changes
  useEffect(() => {
    if (!id) return;
    loadSubmissions(id, filter === "all" ? undefined : filter);
  }, [filter, id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep drawer selection in sync with the latest submissions array
  useEffect(() => {
    if (!selected) return;
    const fresh = submissions.find((s) => s._id === selected._id);
    if (fresh) setSelected(fresh);
  }, [submissions]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = useMemo(() => {
    const c = { all: submissions.length, new: 0, read: 0, archived: 0 };
    for (const s of submissions) {
      if (c[s.status] !== undefined) c[s.status]++;
    }
    return c;
  }, [submissions]);

  const handleStatusChange = (subId, status) => {
    handleUpdateSubmissionStatus(id, subId, status);
  };

  const handleDelete = (subId) => {
    if (selected?._id === subId) setSelected(null);
    handleDeleteSubmission(id, subId);
  };

  if (loadingActiveForm || !activeForm) return <Loading />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b bg-white shrink-0 border-zinc-200">
        <div className="flex items-center min-w-0 gap-3">
          <button
            onClick={() => navigate(`/builder/${id}`)}
            aria-label="Back to builder"
            className="flex items-center justify-center transition rounded-md size-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <ArrowLeftIcon size={16} />
          </button>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate text-zinc-900">
              {activeForm.name}
            </p>
            <p className="text-[11px] text-zinc-400">Responses</p>
          </div>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="border-b bg-white border-zinc-200">
        <div className="flex items-center gap-1 px-4 py-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                filter === f.key
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
              }`}
            >
              {f.label}
              {counts[f.key] !== undefined && (
                <span
                  className={`ml-1.5 text-[10px] ${
                    filter === f.key ? "text-white/70" : "text-zinc-400"
                  }`}
                >
                  {counts[f.key]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 p-4 overflow-y-auto sm:p-6">
        <div className="max-w-5xl mx-auto">
          {loadingSubmissions ? (
            <div className="flex items-center justify-center py-20">
              <Loading />
            </div>
          ) : (
            <SubmissionsTable
              submissions={submissions}
              onSelect={setSelected}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <SubmissionDrawer
          submission={selected}
          fields={activeForm.fields}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default SubmissionsPage;