import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/api";

const AppContext = createContext(undefined);

export function AppContextProvider({ children }) {
  const navigate = useNavigate();

  // ---------- AUTH STATE ----------
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ---------- HOME STATE ----------
  const [forms, setForms] = useState([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [generatingForm, setGeneratingForm] = useState(false);

  // ---------- BUILDER STATE ----------
  const [activeForm, setActiveForm] = useState(null);
  const [loadingActiveForm, setLoadingActiveForm] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [savingFields, setSavingFields] = useState(false);

  // ---------- SUBMISSIONS STATE ----------
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // ---------- PUBLIC FORM STATE ----------
  const [publicForm, setPublicForm] = useState(null);
  const [loadingPublicForm, setLoadingPublicForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ================================================================
  // AUTH ACTIONS
  // ================================================================

  const checkSession = useCallback(async () => {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const register = async (name, email, password) => {
    try {
      const { data } = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });
      setUser(data.user);
      toast.success("Account created");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.error || "Registration failed";
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setUser(data.user);
      toast.success("Welcome back");
      navigate("/");
    } catch (err) {
      const msg = err?.response?.data?.error || "Invalid email or password";
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      toast.success("Logged out");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setForms([]);
      setActiveForm(null);
      navigate("/login");
    }
  };

  // ================================================================
  // HOME ACTIONS
  // ================================================================

  const loadForms = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get("/api/forms");
      setForms(data);
    } catch (err) {
      console.error("Load forms error:", err);
      toast.error("Failed to load forms");
    } finally {
      setLoadingForms(false);
    }
  }, [user]);

  const handleGenerate = useCallback(
    async (prompt) => {
      if (!user) return;
      setGeneratingForm(true);
      try {
        const { data } = await api.post("/api/forms", { prompt });
        toast.success(`Generated "${data.name}"`);
        navigate(`/builder/${data._id}`);
      } catch (err) {
        const msg =
          err?.response?.data?.error || "Failed to generate form. Please try again.";
        toast.error(msg);
      } finally {
        setGeneratingForm(false);
      }
    },
    [user, navigate]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!user) return;
      try {
        await api.delete(`/api/forms/${id}`);
        setForms((prev) => prev.filter((f) => f._id !== id));
        toast.success("Form deleted");
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Failed to delete form");
      }
    },
    [user]
  );

  // ================================================================
  // BUILDER ACTIONS
  // ================================================================

  const loadForm = useCallback(
    async (id) => {
      if (!user) return;
      setLoadingActiveForm(true);
      try {
        const { data } = await api.get(`/api/forms/${id}`);
        setActiveForm(data);
      } catch (err) {
        console.error("Load form error:", err);
        toast.error("Failed to load form");
        navigate("/");
      } finally {
        setLoadingActiveForm(false);
      }
    },
    [user, navigate]
  );

  const handleChat = useCallback(
    async (prompt) => {
      if (!activeForm || !user) return;
      setChatLoading(true);
      try {
        const { data } = await api.post(`/api/forms/${activeForm._id}/chat`, {
          prompt,
        });
        setActiveForm(data);

        if (data.errors?.length > 0) {
          toast.error(`${data.errors.length} operation(s) failed`);
        } else {
          toast.success(data.aiDescription || "Form updated");
        }
      } catch (err) {
        console.error("Chat error:", err);
        toast.error(err?.response?.data?.error || "Revision failed");
      } finally {
        setChatLoading(false);
      }
    },
    [activeForm, user]
  );

  // Manual field edits — replaces the whole fields array
  const handleUpdateFields = useCallback(
    async (nextFields) => {
      if (!activeForm || !user) return;

      // Optimistic — update the UI immediately
      const previous = activeForm.fields;
      setActiveForm((prev) => ({ ...prev, fields: nextFields }));
      setSavingFields(true);

      try {
        const { data } = await api.put(`/api/forms/${activeForm._id}`, {
          fields: nextFields,
        });
        // Server returns the updated form with new version — sync state
        setActiveForm((prev) => ({
          ...prev,
          fields: data.fields,
          version: data.version,
          name: data.name,
          description: data.description,
        }));
      } catch (err) {
        // Revert on failure
        setActiveForm((prev) => ({ ...prev, fields: previous }));
        console.error("Save fields error:", err);
        toast.error(
          err?.response?.data?.error || "Failed to save changes"
        );
      } finally {
        setSavingFields(false);
      }
    },
    [activeForm, user]
  );

  const handlePublish = useCallback(async () => {
    if (!activeForm || !user) return null;
    try {
      await api.post(`/api/forms/${activeForm._id}/publish`);
      const url = `${window.location.origin}/f/${activeForm._id}`;
      setActiveForm((prev) => ({ ...prev, published: true }));
      toast.success("Form published");
      return url;
    } catch (err) {
      console.error("Publish error:", err);
      toast.error(err?.response?.data?.error || "Publish failed");
      return null;
    }
  }, [activeForm, user]);

  // ================================================================
  // SUBMISSIONS ACTIONS
  // ================================================================

  const loadSubmissions = useCallback(
    async (formId, statusFilter) => {
      if (!user) return;
      setLoadingSubmissions(true);
      try {
        const params = statusFilter ? { status: statusFilter } : {};
        const { data } = await api.get(`/api/forms/${formId}/submissions`, {
          params,
        });
        setSubmissions(data.submissions);
      } catch (err) {
        console.error("Load submissions error:", err);
        toast.error("Failed to load submissions");
      } finally {
        setLoadingSubmissions(false);
      }
    },
    [user]
  );

  const handleUpdateSubmissionStatus = useCallback(
    async (formId, subId, status) => {
      // Optimistic
      const previous = submissions;
      setSubmissions((prev) =>
        prev.map((s) => (s._id === subId ? { ...s, status } : s))
      );
      try {
        await api.patch(`/api/forms/${formId}/submissions/${subId}`, {
          status,
        });
      } catch (err) {
        setSubmissions(previous);
        console.error("Update status error:", err);
        toast.error("Failed to update status");
      }
    },
    [submissions]
  );

  const handleDeleteSubmission = useCallback(
    async (formId, subId) => {
      const previous = submissions;
      setSubmissions((prev) => prev.filter((s) => s._id !== subId));
      try {
        await api.delete(`/api/forms/${formId}/submissions/${subId}`);
        toast.success("Submission deleted");
      } catch (err) {
        setSubmissions(previous);
        console.error("Delete submission error:", err);
        toast.error("Failed to delete submission");
      }
    },
    [submissions]
  );

  // ================================================================
  // PUBLIC ACTIONS
  // ================================================================

  const loadPublicForm = useCallback(async (id) => {
    setLoadingPublicForm(true);
    try {
      const { data } = await api.get(`/api/forms/public/${id}`);
      setPublicForm(data);
    } catch (err) {
      console.error("Load public form error:", err);
      setPublicForm(null);
    } finally {
      setLoadingPublicForm(false);
    }
  }, []);

  const submitFormResponse = useCallback(
    async (formId, values) => {
      setSubmitting(true);
      try {
        const { data } = await api.post(
          `/api/forms/public/${formId}/submit`,
          { values, __hp: "" }
        );
        return data;
      } catch (err) {
        const msg =
          err?.response?.data?.error || "Failed to submit your response";
        const details = err?.response?.data?.details;
        // Re-throw with details so the form can highlight specific fields
        const wrapped = new Error(msg);
        wrapped.details = details;
        throw wrapped;
      } finally {
        setSubmitting(false);
      }
    },
    []
  );

  // ================================================================
  // CONTEXT VALUE
  // ================================================================

  const value = useMemo(
    () => ({
      // Auth
      user,
      loadingUser,
      login,
      register,
      logout,

      // Home
      forms,
      loadingForms,
      generatingForm,
      loadForms,
      handleGenerate,
      handleDelete,

      // Builder
      activeForm,
      loadingActiveForm,
      chatLoading,
      savingFields,
      loadForm,
      handleChat,
      handleUpdateFields,
      handlePublish,

      // Submissions
      submissions,
      loadingSubmissions,
      loadSubmissions,
      handleUpdateSubmissionStatus,
      handleDeleteSubmission,

      // Public
      publicForm,
      loadingPublicForm,
      submitting,
      loadPublicForm,
      submitFormResponse,
    }),
    [
      user,
      loadingUser,
      login,
      register,
      logout,
      forms,
      loadingForms,
      generatingForm,
      loadForms,
      handleGenerate,
      handleDelete,
      activeForm,
      loadingActiveForm,
      chatLoading,
      savingFields,
      loadForm,
      handleChat,
      handleUpdateFields,
      handlePublish,
      submissions,
      loadingSubmissions,
      loadSubmissions,
      handleUpdateSubmissionStatus,
      handleDeleteSubmission,
      publicForm,
      loadingPublicForm,
      submitting,
      loadPublicForm,
      submitFormResponse,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }
  return context;
}