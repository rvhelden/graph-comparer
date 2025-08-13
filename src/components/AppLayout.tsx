import { Layout, Spin, Alert } from "antd";
import { useState } from "react";
import { TitleBar } from "./TitleBar";
import { PermissionsList } from "./PermissionsList";
import { PermissionDetails } from "./PermissionDetails";
import { PermissionComparison } from "./PermissionComparison";
import { usePermissions } from "../hooks/usePermissions";

const { Header, Sider, Content } = Layout;

export const AppLayout = () => {
  const { permissions, descriptions, isLoading, error } = usePermissions();
  const [selectedPermission, setSelectedPermission] = useState<string | null>(null);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [urlFilter, setUrlFilter] = useState<string | undefined>(undefined);
  const [apiVersion, setApiVersion] = useState<'v1.0' | 'beta'>('v1.0');
  const [hideDisabled, setHideDisabled] = useState(true);

  const selectedPermissionData = selectedPermission 
    ? permissions.find(p => p.name === selectedPermission) || null
    : null;

  const selectedPermissionsData = selectedForComparison
    .map(name => permissions.find(p => p.name === name))
    .filter(Boolean) as typeof permissions;

  const handleComparisonToggle = (permissionName: string) => {
    setSelectedForComparison(prev => 
      prev.includes(permissionName)
        ? prev.filter(name => name !== permissionName)
        : [...prev, permissionName]
    );
  };

  const handleComparisonModeToggle = () => {
    setComparisonMode(!comparisonMode);
    if (!comparisonMode) {
      setSelectedPermission(null); // Clear single selection when entering comparison mode
    } else {
      setSelectedForComparison([]); // Clear comparison selection when leaving comparison mode
    }
  };

  const handleClearComparison = () => {
    setSelectedForComparison([]);
  };

  const handleRemoveFromComparison = (permissionName: string) => {
    setSelectedForComparison(prev => prev.filter(name => name !== permissionName));
  };

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
        <TitleBar 
          apiVersion={apiVersion}
          onApiVersionChange={setApiVersion}
          hideDisabled={hideDisabled}
          onHideDisabledChange={setHideDisabled}
        />
      </Header>
      <Layout style={{ backgroundColor: '#1B1A19FF' }}>
        <Sider 
          width={400} 
          style={{ 
            backgroundColor: '#252423FF',
            borderRight: '1px solid #303030',
            height: 'calc(100vh - 64px)',
            overflow: 'hidden'
          }}
        >
          <PermissionsList
            permissions={permissions}
            descriptions={descriptions}
            selectedPermission={selectedPermission}
            onPermissionSelect={setSelectedPermission}
            isLoading={isLoading}
            comparisonMode={comparisonMode}
            selectedForComparison={selectedForComparison}
            onComparisonToggle={handleComparisonToggle}
            onComparisonModeToggle={handleComparisonModeToggle}
            onClearComparison={handleClearComparison}
            urlFilter={urlFilter}
            onUrlFilterChange={setUrlFilter}
            hideDisabled={hideDisabled}
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
          ) : comparisonMode ? (
            <PermissionComparison
              selectedPermissions={selectedPermissionsData}
              descriptions={descriptions}
              onRemovePermission={handleRemoveFromComparison}
            />
          ) : (
            <PermissionDetails 
              permission={selectedPermissionData}
              descriptions={descriptions}
              onUrlFilter={setUrlFilter}
              apiVersion={apiVersion}
            />
          )}
        </Content>
      </Layout>
    </Layout>
  );
};
