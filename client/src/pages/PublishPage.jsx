import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CheckCircle2Icon, Loader2Icon, AlertCircleIcon } from "lucide-react";
import { useAppContext } from "../context/AppContext";
import Loading from "../components/Loading";
import FormRenderer from "../components/FormRenderer";

const PublishPage = () => {
  const { id } = useParams();
  const {
    publicForm,
    loadingPublicForm,
    submitting,
    loadPublicForm,
    submitFormResponse,
  } = useAppContext();

  const [values, setValues] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [topError, setTopError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (id) loadPublicForm(id);
  }, [id, loadPublicForm]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTopError("");
    setFieldErrors({});

    try {
      await submitFormResponse(id, values);
      setSubmitted(true);
      setValues({});
    } catch (err) {
      // Field-level errors from the backend (validation failures)
      if (Array.isArray(err.details)) {
        const map = {};
        for (const d of err.details) map[d.field] = d.message;
        setFieldErrors(map);
      }
      setTopError(err.message || "Submission failed");
    }
  };

  if (loadingPublicForm) return <Loading />;

  if (!publicForm) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-zinc-50">
        <div className="w-full max-w-md text-center">
          <div className="flex items-center justify-center mx-auto mb-5 rounded-full size-12 bg-zinc-100 text-zinc-500">
            <AlertCircleIcon size={22} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Form unavailable
          </h1>
          <p className="max-w-sm mx-auto mt-2 text-sm leading-relaxed text-zinc-500">
            This form is not available or is not published yet.
          </p>
          <p className="mt-10 text-xs text-zinc-400">
            © {new Date().getFullYear()} Formly
          </p>
        </div>
      </div>
    );
  }

  // Success screen
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 bg-zinc-50">
        <div className="w-full max-w-md text-center">
          <div className="flex items-center justify-center mx-auto mb-5 rounded-full size-12 bg-emerald-50 text-emerald-600">
            <CheckCircle2Icon size={24} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
            Thanks — your response was submitted
          </h1>
          <p className="max-w-sm mx-auto mt-2 text-sm leading-relaxed text-zinc-500">
            You can close this tab.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setValues({});
            }}
            className="mt-6 text-xs font-medium text-zinc-500 underline-offset-4 hover:underline"
          >
            Submit another response
          </button>
        </div>
      </div>
    );
  }

  // Form
  return (
    <div className="min-h-screen py-10 bg-zinc-50 sm:py-16">
      <div className="w-full max-w-xl px-6 mx-auto">
        <div className="p-6 bg-white border shadow-sm sm:p-8 rounded-2xl border-zinc-200">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              {publicForm.name}
            </h1>
            {publicForm.description && (
              <p className="mt-1.5 text-sm text-zinc-500">
                {publicForm.description}
              </p>
            )}
          </div>

          {topError && (
            <div
              role="alert"
              className="px-4 py-3 mb-5 text-sm border rounded-lg bg-red-50 border-red-100 text-red-700"
            >
              {topError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FormRenderer
              fields={publicForm.fields}
              values={values}
              onChange={setValues}
              errors={fieldErrors}
              disabled={submitting}
            />

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center w-full gap-2 px-4 py-2.5 mt-8 text-sm font-medium text-white transition rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2Icon size={16} className="animate-spin" />}
              {submitting ? "Submitting…" : "Submit"}
            </button>
          </form>
        </div>

        <p className="mt-8 text-xs text-center text-zinc-400">
          Built with Formly
        </p>
      </div>
    </div>
  );
};

export default PublishPage;