import { Layout, Spin, Alert } from "antd";
import { useState } from "react";
import { TitleBar } from "./TitleBar";
import { PermissionsList } from "./PermissionsList";
import { PermissionDetails } from "./PermissionDetails";
import { usePermissions } from "../hooks/usePermissions";

const { Header, Sider, Content } = Layout;

export const AppLayout = () => {
  const { permissions, descriptions, isLoading, error } = usePermissions();
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);

  const selectedPermissionData = selectedPermission 
    ? permissions.find(p => p.name === selectedPermission) || null
    : null;

  if (error) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <Header style={{ padding: 0 }}>
          <TitleBar />
        </Header>
        <Content style={{ padding: "24px" }}>
          <Alert
            message="Error Loading Permissions"
            description={error}
            type="error"
            showIcon
          />
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ padding: 0 }}>
        <TitleBar />
      </Header>
      <Layout style={{ backgroundColor: '#1B1A19FF' }}>
        <Sider 
          width={400} 
          style={{ 
            backgroundColor: '#252423FF',
            borderRight: '1px solid #303030'
          }}
        >
          <PermissionsList
            permissions={permissions}
            selectedPermission={selectedPermission}
            onPermissionSelect={setSelectedPermission}
            isLoading={isLoading}
          />
        </Sider>
        
        <Content style={{ backgroundColor: '#1B1A19FF' }}>
          {isLoading ? (
            <div style={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Spin size="large" />
            </div>
          ) : (
            <PermissionDetails 
              permission={selectedPermissionData}
              descriptions={descriptions}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};
