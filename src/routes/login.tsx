import { createFileRoute } from "@tanstack/react-router";
import { SignInButton } from "../components/AuthButtons";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return <SignInButton />;
}
