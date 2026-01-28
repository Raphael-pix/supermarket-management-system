import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Store, MapPin } from "lucide-react";
import posAPI from "../../utils/pos.service";

const BranchSelection = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBranches();

    // Auto-select branch from URL parameter
    const branchParam = searchParams.get("branch");
    if (branchParam) {
      // Find branch by name and navigate
      setTimeout(() => {
        const branch = branches.find(
          (b) =>
            b.name.toLowerCase().replace(/\s+/g, "-") ===
            branchParam.toLowerCase(),
        );
        if (branch) {
          handleSelectBranch(branch.id);
        }
      }, 500);
    }
  }, []);

  const fetchBranches = async () => {
    try {
      const response = await posAPI.getBranches();
      setBranches(response.data);
    } catch (err) {
      setError("Failed to load branches. Please refresh the page.");
      console.error("Fetch branches error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBranch = (branchId) => {
    navigate(`/pos/products?branchId=${branchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading branches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-red-50 via-white to-red-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-3xl mb-6 shadow-lg">
            <Store className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold  mb-3">SoftSpree</h1>
          <p className="text-lg text-muted-foreground">
            Select your branch to start selling
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Branch Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => handleSelectBranch(branch.id)}
              className="bg-white rounded-2xl p-8 shadow-lg border-2 border-transparent hover:border-accent-foreground hover:shadow-xl transition-all duration-200 text-left group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-accent rounded-xl flex items-center justify-center group-hover:bg-accent-foreground transition-colors">
                  <Store className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-accent">
                  <svg
                    className="w-5 h-5 text-slate-400 group-hover:text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>

              <h3 className="text-2xl font-bold mb-2">{branch.name}</h3>

              <div className="flex items-center text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                <p className="text-sm">{branch.location}</p>
              </div>
            </button>
          ))}
        </div>

        {branches.length === 0 && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No branches available</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            Powered by SoftSpree Distribution System
          </p>
        </div>
      </div>
    </div>
  );
};

export default BranchSelection;
