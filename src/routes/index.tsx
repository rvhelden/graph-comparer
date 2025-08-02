import { createFileRoute } from "@tanstack/react-router";
import { UserProfile } from "../components/UserProfile";
import { ProtectedLayout } from "../components/ProtectedLayout";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <ProtectedLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Welcome to Debble Portal!</h1>
        <div>
          <p className="text-lg mb-4">You are successfully signed in.</p>
          <UserProfile />
        </div>
      </div>
    </ProtectedLayout>
  );
}
