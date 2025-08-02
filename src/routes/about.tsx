import { createFileRoute } from "@tanstack/react-router";
import { ProtectedLayout } from "../components/ProtectedLayout";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <ProtectedLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">About Debble Portal</h1>
        <div className="prose max-w-none">
          <p className="text-lg mb-4">
            This is a secure portal that requires Microsoft/Azure AD
            authentication.
          </p>
          <p className="mb-4">
            All content in this application is protected and requires you to be
            signed in with a valid Microsoft account.
          </p>
          <h2 className="text-xl font-semibold mb-2">Features:</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Secure Microsoft Authentication</li>
            <li>User Profile Integration</li>
            <li>Protected Routes</li>
            <li>Session Management</li>
          </ul>
        </div>
      </div>
    </ProtectedLayout>
  );
}
