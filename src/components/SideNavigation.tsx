import { Menu } from "antd";
import { Link } from "@tanstack/react-router";
import {
  ShopOutlined,
  KeyOutlined,
  CodeOutlined,
  CloudUploadOutlined,
  DeploymentUnitOutlined,
  BranchesOutlined,
  PullRequestOutlined,
  SafetyCertificateOutlined,
  SecurityScanOutlined,
  BankOutlined,
  FileDoneOutlined,
  ToolOutlined,
  BellOutlined,
  HistoryOutlined,
  FieldTimeOutlined,
  CloudOutlined,
} from "@ant-design/icons";

export const SideNavigation = () => {
  return (
    <div
      className="menu-container"
      style={{ height: "100%", paddingTop: "16px" }}
    >
      <Menu
        mode="inline"
        theme="dark"
        items={[
          {
            key: "customers",
            icon: <ShopOutlined />,
            label: (
              <Link to="/customers" className="menu-text">
                Customers
              </Link>
            ),
          },
          {
            key: "mfa",
            icon: <KeyOutlined />,
            label: (
              <span className="menu-text">Multi-Factor Authentication</span>
            ),
          },
          {
            key: "logs",
            icon: <CodeOutlined />,
            label: "Logs",
            children: [
              {
                key: "logs-siteprogress",
                icon: <FileDoneOutlined />,
                label: <span className="menu-text">Site Progress</span>,
              },
              {
                key: "logs-framework",
                icon: <ToolOutlined />,
                label: <span className="menu-text">Framework</span>,
              },
              {
                key: "logs-notifications",
                icon: <BellOutlined />,
                label: <span className="menu-text">Notifications</span>,
              },
              {
                key: "logs-revisioning",
                icon: <HistoryOutlined />,
                label: <span className="menu-text">Revisioning</span>,
              },
              {
                key: "logs-timeline",
                icon: <FieldTimeOutlined />,
                label: <span className="menu-text">Timeline</span>,
              },
              {
                key: "logs-connectedworkplace",
                icon: <CloudOutlined />,
                label: <span className="menu-text">Connected Workplace</span>,
              },
            ],
          },
          {
            key: "deployments",
            icon: <CloudUploadOutlined />,
            label: <span className="menu-text">Deployments</span>,
          },
          {
            key: "rings",
            icon: <DeploymentUnitOutlined />,
            label: <span className="menu-text">Rings</span>,
          },
          {
            key: "environments",
            icon: <BranchesOutlined />,
            label: <span className="menu-text">Deployment Environments</span>,
          },
          {
            key: "pull-requests",
            icon: <PullRequestOutlined />,
            label: <span className="menu-text">Pull Requests</span>,
          },
          {
            key: "csr",
            icon: <SafetyCertificateOutlined />,
            label: <span className="menu-text">Nedap Certificate</span>,
          },
          {
            key: "security",
            icon: <SecurityScanOutlined />,
            label: <span className="menu-text">Security</span>,
          },
          {
            key: "knowledgebase",
            icon: <BankOutlined />,
            label: <span className="menu-text">Knowledge Base</span>,
          },
          {
            key: "installer",
            icon: <BankOutlined />,
            label: <span className="menu-text">Installer</span>,
          },
        ]}
      />
    </div>
  );
};
