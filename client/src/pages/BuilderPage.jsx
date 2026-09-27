import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlusIcon } from "lucide-react";

import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import BuilderHeader from "../components/BuilderHeader";
import ChatPanel from "../components/ChatPanel";
import FieldCard from "../components/FieldCard";
import FieldInspector from "../components/FieldInspector";
import FormPreview from "../components/FormPreview";
import PublishModal from "../components/PublishModal";

const BuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    activeForm,
    loadingActiveForm,
    chatLoading,
    savingFields,
    loadForm,
    handleChat,
    handleUpdateFields,
    handlePublish,
    logout,
  } = useAppContext();

  const [selectedFieldId, setSelectedFieldId] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [publishUrl, setPublishUrl] = useState(null);

  // Load form on mount / id change
  useEffect(() => {
    if (!id) return;
    loadForm(id);
  }, [id, loadForm]);

  // Clear selection when switching forms
  useEffect(() => {
    setSelectedFieldId(null);
  }, [id]);

  const selectedField = useMemo(
    () => activeForm?.fields.find((f) => f.id === selectedFieldId) || null,
    [activeForm, selectedFieldId]
  );

  // ---------- Field actions ----------

  const handleAddField = () => {
    if (!activeForm) return;
    const newField = {
      id: `field_new_${Date.now()}`,
      type: "text",
      label: "New field",
      placeholder: "",
      helperText: "",
      required: false,
      options: [],
      validation: {},
    };
    const next = [...activeForm.fields, newField];
    handleUpdateFields(next);
    setSelectedFieldId(newField.id);
  };

  const handleUpdateField = (updated) => {
    if (!activeForm) return;
    const next = activeForm.fields.map((f) =>
      f.id === updated.id ? updated : f
    );
    handleUpdateFields(next);
  };

  const handleDeleteField = (fieldId) => {
    if (!activeForm) return;
    const next = activeForm.fields.filter((f) => f.id !== fieldId);
    handleUpdateFields(next);
    setSelectedFieldId(null);
  };

  const handleDuplicateField = (field) => {
    if (!activeForm) return;
    const clone = {
      ...field,
      id: `field_${field.id.replace(/^field_/, "")}_${Date.now()}`,
      label: `${field.label} (copy)`,
    };
    const index = activeForm.fields.findIndex((f) => f.id === field.id);
    const next = [...activeForm.fields];
    next.splice(index + 1, 0, clone);
    handleUpdateFields(next);
    setSelectedFieldId(clone.id);
  };

  // ---------- Publish ----------

  const handlePublishClick = async () => {
    setPublishing(true);
    const url = await handlePublish();
    setPublishing(false);
    if (url) setPublishUrl(url);
  };

  // ---------- Render ----------

  if (loadingActiveForm || !activeForm) {
    return <Loading />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-zinc-50">
      <BuilderHeader
        formName={activeForm.name}
        version={activeForm.version}
        published={activeForm.published}
        publishing={publishing}
        savingFields={savingFields}
        onBack={() => navigate("/")}
        onPreview={() => navigate(`/preview/${activeForm._id}`)}
        onPublish={handlePublishClick}
        onOpenSubmissions={() =>
          navigate(`/forms/${activeForm._id}/submissions`)
        }
        onLogout={logout}
      />

      <div className="flex flex-1 min-h-0">
        {/* Chat column */}
        <div className="hidden w-80 shrink-0 border-r border-zinc-200 bg-white md:flex md:flex-col">
          <ChatPanel
            messages={activeForm.messages || []}
            onSend={handleChat}
            loading={chatLoading}
          />
        </div>

        {/* Fields column */}
        <div className="flex flex-col flex-1 min-w-0 border-r border-zinc-200 bg-white">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
            <div>
              <p className="text-xs font-semibold tracking-wider uppercase text-zinc-500">
                Fields
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-400">
                {activeForm.fields.length}{" "}
                {activeForm.fields.length === 1 ? "field" : "fields"}
              </p>
            </div>
            <button
              onClick={handleAddField}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-white transition rounded-md bg-zinc-900 hover:bg-zinc-800"
            >
              <PlusIcon size={13} /> Add field
            </button>
          </div>

          <div className="flex-1 p-3 space-y-2 overflow-y-auto">
            {activeForm.fields.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-sm text-zinc-400">No fields yet</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Add a field manually or ask the AI to generate one.
                </p>
              </div>
            )}

            {activeForm.fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                isSelected={field.id === selectedFieldId}
                onSelect={() => setSelectedFieldId(field.id)}
                onDelete={() => handleDeleteField(field.id)}
                onDuplicate={() => handleDuplicateField(field)}
              />
            ))}
          </div>
        </div>

        {/* Preview / Inspector column */}
        <div className="hidden w-[420px] shrink-0 lg:block">
          {selectedField ? (
            <FieldInspector
              field={selectedField}
              onUpdate={handleUpdateField}
              onClose={() => setSelectedFieldId(null)}
              onDelete={() => handleDeleteField(selectedField.id)}
            />
          ) : (
            <FormPreview form={activeForm} />
          )}
        </div>
      </div>

      {publishUrl && (
        <PublishModal
          publishUrl={publishUrl}
          onClose={() => setPublishUrl(null)}
        />
      )}
    </div>
  );
};

export default BuilderPage;