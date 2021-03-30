// uwc-debug-below
import React, { useState, useMemo, useEffect, useContext, ReactNode } from 'react';
import { useHistory } from 'react-router-dom';
import { Layout, Divider, Dropdown, Menu } from 'antd';
import { MenuOutlined, MenuFoldOutlined, DownOutlined } from '@ant-design/icons';
import Navigation from './Navigation';
import styles from './BasicLayout.module.css';
import { Auth, handleLogout, generateMenuMap, _get } from 'utils';
import { PRIMARY_COLOR, FONT_SIZE_BASE } from 'constants/styleVariables';
import { PUBLIC_URL } from 'constants/env';
import GlobalContext from 'globalContext';
import { useVisible } from 'hooks';
import ChangePassword from './ChangePassword';
import ChangeSchool from './ChangeSchool';
import { ErrorBoundary } from 'components';
import { clear } from 'services';
const { Header, Content } = Layout;

type IProps = {
  children: ReactNode;
};

export default function BasicLayout(props: IProps) {
  const history = useHistory();
  const [collapsed, setCollapsed] = useState(false);
  const [visible, _switchVisible] = useVisible();
  const [changeSchoolVisible, _switchChangeSchoolVisible] = useVisible();

  const { $menuTree, $token } = useContext(GlobalContext);
  const MENU_MAP: any = useMemo(() => generateMenuMap($menuTree), [$menuTree]);

  useEffect(() => {
    if (!Auth.isAuthenticated()) {
      history.push(`${PUBLIC_URL}login`);
    }
  }, [$token, history]);

  const menu = (
    <Menu>
      <Menu.Item onClick={clear}>修改密码</Menu.Item>
      <Menu.Item onClick={handleLogout}>退出</Menu.Item>
    </Menu>
  );

  return (
    <>
      {visible && <ChangePassword onCancel={_switchVisible} onOk={_switchVisible} title="修改密码" />}
      {changeSchoolVisible && (
        <ChangeSchool onCancel={_switchChangeSchoolVisible} onOk={_switchChangeSchoolVisible} title="切换驾校" />
      )}
      <Layout className="ie-basic-layout-wrapper" style={{ height: '100vh', background: 'red' }}>
        <Layout>
          <Header style={{ background: PRIMARY_COLOR, padding: 0, color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: 30 }}>
              <div>
                {collapsed ? (
                  <MenuOutlined className={styles.trigger} onClick={() => setCollapsed(!collapsed)} />
                ) : (
                  <MenuFoldOutlined className={styles.trigger} onClick={() => setCollapsed(!collapsed)} />
                )}
                <div style={{ display: 'inline-block', fontWeight: 'bold', fontSize: 20 }}>维尔驾服驾校管理系统</div>
              </div>

              <div style={{ fontSize: FONT_SIZE_BASE }}>
                <span onClick={_switchChangeSchoolVisible}>
                  <span className="pointer">
                    {Auth.get('schoolName')} <DownOutlined />
                  </span>
                </span>
                <Divider type="vertical" style={{ margin: '0 18px', background: '#fff' }} />
                <Dropdown overlay={menu}>
                  <span className="pointer">
                    {Auth.get('operatorName')} <DownOutlined />
                  </span>
                </Dropdown>
                <Divider type="vertical" style={{ margin: '0 18px', background: '#fff' }} />
                <span
                  style={{ color: '#fff' }}
                  className="pointer"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = `${PUBLIC_URL}package.zip`;
                    link.download = 'package.zip';
                    link.click();
                  }}
                >
                  下载插件
                </span>
              </div>
            </div>
          </Header>

          <Layout style={{ background: '#fff' }}>
            <Navigation
              style={{
                margin: 0,
                maxHeight: 'calc(100vh - 64px)',
                height: 'calc(100vh - 64px)',
                overflow: 'auto',
              }}
              menus={$menuTree}
              collapsed={collapsed}
              setCollapsed={setCollapsed}
            />
            <Content
              style={{
                margin: 0,
                maxHeight: 'calc(100vh - 64px)',
                height: 'calc(100vh - 64px)',
                overflow: 'auto',
              }}
            >
              {
                <>
                  <div
                    style={{
                      height: 60,
                      lineHeight: '60px',
                      background: '#fff',
                      paddingLeft: 20,
                      fontSize: 18,
                      fontWeight: 'bolder',
                    }}
                  >
                    {/* <img src={HEADER_ICON} alt="" style={{ marginRight: 8 }} /> */}

                    {/* TODO:如果上下文路径修改，需要更新下面这行代码 */}
                    <span>
                      {
                        MENU_MAP[
                          _get(history, 'location.pathname')
                            .replace(/^\/school/, '')
                            .slice(1)
                        ]
                      }
                    </span>
                  </div>
                  <div style={{ background: 'rgba(248,248,248,1)', height: 10 }}></div>
                </>
              }

              <div style={{ padding: 20 }}>
                <ErrorBoundary>{props.children}</ErrorBoundary>
              </div>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </>
  );
}
