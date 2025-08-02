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
      <Sider width={280} style={{ backgroundColor: "rgb(37, 36, 35)" }}>
        <SideNavigation />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, backgroundColor: "rgb(37, 36, 35)" }}>
          <TitleBar />
        </Header>
        <Content style={{ margin: "16px", backgroundColor: "rgb(27, 26, 25)" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};