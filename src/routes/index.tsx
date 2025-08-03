import { createFileRoute } from "@tanstack/react-router";
import { Typography, Card } from "antd";

const { Title, Paragraph } = Typography;

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Welcome to Debble Portal</Title>
      <Card>
        <Paragraph>
          This is the main dashboard of the Debble Portal. Use the navigation menu on the left to access different sections of the application.
        </Paragraph>
      </Card>
    </div>
  );
}
