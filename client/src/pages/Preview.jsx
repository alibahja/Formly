import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import FormPreview from "../components/FormPreview";

const Preview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeForm, loadingActiveForm, loadForm } = useAppContext();

  useEffect(() => {
    if (id) loadForm(id);
  }, [id, loadForm]);

  if (loadingActiveForm || !activeForm) return <Loading />;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-4 border-b bg-white shrink-0 border-zinc-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/builder/${activeForm._id}`)}
            aria-label="Back to builder"
            className="flex items-center justify-center transition rounded-md size-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <ArrowLeftIcon size={16} />
          </button>
          <span className="text-sm font-medium text-zinc-900">
            Preview — {activeForm.name}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] font-medium text-zinc-500 rounded bg-zinc-100 border border-zinc-200">
            v{activeForm.version}
          </span>
        </div>
        {activeForm.published && (
          <span className="px-2 py-0.5 text-[10px] font-medium rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            Published
          </span>
        )}
      </header>

      {/* Body */}
      <div className="flex-1 min-h-0">
        <FormPreview form={activeForm} />
      </div>
    </div>
  );
};

export default Preview;