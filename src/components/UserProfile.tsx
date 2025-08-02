import { useEffect, useState } from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest, graphConfig } from "../authConfig";

interface UserProfile {
  displayName?: string;
  mail?: string;
  userPrincipalName?: string;
  id?: string;
}

export const UserProfile = () => {
  const { instance, accounts } = useMsal();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (accounts.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // Get access token for Microsoft Graph
      const response = await instance.acquireTokenSilent({
        ...loginRequest,
        account: accounts[0],
      });

      // Call Microsoft Graph API
      const graphResponse = await fetch(graphConfig.graphMeEndpoint, {
        headers: {
          Authorization: `Bearer ${response.accessToken}`,
        },
      });

      if (!graphResponse.ok) {
        throw new Error("Failed to fetch profile");
      }

      const profileData = await graphResponse.json();
      setProfile(profileData);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accounts.length > 0) {
      fetchProfile();
    }
  }, [accounts]);

  if (loading) {
    return <div className="text-center py-4">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>{error}</p>
        <button
          onClick={fetchProfile}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-lg p-6 mt-4">
      <h2 className="text-xl font-bold mb-4">User Profile</h2>
      <div className="space-y-2">
        <p>
          <strong>Name:</strong> {profile.displayName}
        </p>
        <p>
          <strong>Email:</strong> {profile.mail || profile.userPrincipalName}
        </p>
        <p>
          <strong>ID:</strong> {profile.id}
        </p>
      </div>
    </div>
  );
};
