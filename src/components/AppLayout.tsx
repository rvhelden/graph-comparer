import { Layout } from "antd";
import { SideNavigation } from "./SideNavigation";
import { TitleBar } from "./TitleBar";

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ padding: 0 }}>
        <TitleBar />
      </Header>
      <Layout>
        <Sider width={280}>
          <SideNavigation />
        </Sider>
        <Content style={{ margin: "16px" }}>{children}</Content>
      </Layout>
    </Layout>
  );
};
