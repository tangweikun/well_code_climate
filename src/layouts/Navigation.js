import { Layout, Menu } from 'antd';
import React, { useState, useEffect, useContext } from 'react';
import { isEmpty } from 'lodash';
import { _get } from 'utils';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import styles from './Navigation.module.css';
import { PUBLIC_URL } from 'constants/env';
import {
  HomeOutlined,
  TeamOutlined,
  PayCircleOutlined,
  FileDoneOutlined,
  ContainerOutlined,
  PieChartOutlined,
  FundProjectionScreenOutlined,
  ContactsOutlined,
  HighlightOutlined,
  MessageOutlined,
  CarOutlined,
  UserOutlined,
  ReconciliationOutlined,
  UserAddOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  LikeOutlined,
  MoneyCollectOutlined,
  ClusterOutlined,
  SolutionOutlined,
  ReadOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import GlobalContext from 'globalContext';
import { Loading, IF } from 'components';

const { Sider } = Layout;
const { SubMenu } = Menu;

const ICONS = {
  ReconciliationOutlined: <ReconciliationOutlined />,
  UserOutlined: <UserOutlined />,
  CarOutlined: <CarOutlined />,
  MessageOutlined: <MessageOutlined />,
  HighlightOutlined: <HighlightOutlined />,
  HomeOutlined: <HomeOutlined />,
  TeamOutlined: <TeamOutlined />,
  PayCircleOutlined: <PayCircleOutlined />,
  FileDoneOutlined: <FileDoneOutlined />,
  ContainerOutlined: <ContainerOutlined />,
  PieChartOutlined: <PieChartOutlined />,
  FundProjectionScreenOutlined: <FundProjectionScreenOutlined />,
  ContactsOutlined: <ContactsOutlined />,
  UserAddOutlined: <UserAddOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  ScheduleOutlined: <ScheduleOutlined />,
  LikeOutlined: <LikeOutlined />,
  MoneyCollectOutlined: <MoneyCollectOutlined />,
  ClusterOutlined: <ClusterOutlined />,
  SolutionOutlined: <SolutionOutlined />,
  ReadOutlined: <ReadOutlined />,
  RobotOutlined: <RobotOutlined />,
};

function Navigation(props) {
  const { collapsed, setCollapsed, menus } = props;
  const currentPath = _get(props, 'location.pathname').slice(1);
  const [openKeys, setOpenKeys] = useState([]);
  const { $menuAuthTable, isLoading } = useContext(GlobalContext);

  useEffect(() => {
    _findDefaultOpenKeys();

    function _findDefaultOpenKeys() {
      const defaultOpenKeys = [];
      helper(menus, []);
      setOpenKeys(defaultOpenKeys);

      function helper(arr, parentKey) {
        for (let item of arr) {
          if (item.code === currentPath) {
            Object.assign(defaultOpenKeys, parentKey);
            return;
          }
          helper(_get(item, 'children', []), [...parentKey, item.key]);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menus]);

  function _onOpenChange(currentOpenKeys) {
    setOpenKeys(currentOpenKeys.slice(-1));
  }

  function _generateSubMenus({ icon, title, code, children, type }) {
    if (!$menuAuthTable[code]) return null;

    if (isEmpty(children)) {
      return (
        <Menu.Item key={code}>
          <Link to={`${PUBLIC_URL}${code}`}>
            {icon && ICONS[icon]}
            <span>{title}</span>
          </Link>
        </Menu.Item>
      );
    }

    if (type === 'LABEL') {
      return (
        <Menu.ItemGroup
          key={code}
          title={
            <span>
              {/* {icon && ICONS[icon]} */}
              <span style={{ fontSize: 12 }}>{title}</span>
            </span>
          }
        >
          {children.map(_generateSubMenus)}
        </Menu.ItemGroup>
      );
    }

    return (
      <SubMenu
        key={code}
        title={
          <span>
            {icon && ICONS[icon]}
            <span>{title}</span>
          </span>
        }
      >
        {children.map(_generateSubMenus)}
      </SubMenu>
    );
  }

  return (
    <Sider
      breakpoint="md"
      onBreakpoint={(broken) => {
        setCollapsed(broken);
      }}
      width={220}
      collapsedWidth={0}
      zeroWidthTriggerStyle
      collapsible
      trigger={null}
      collapsed={collapsed}
      style={{ overflow: 'auto' }}
      className={styles.menuBox}
    >
      <IF
        condition={isLoading}
        then={<Loading />}
        else={
          <Menu
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={_onOpenChange}
            theme="dark"
            defaultSelectedKeys={[currentPath]}
            mode="inline"
          >
            {menus.map(_generateSubMenus)}
          </Menu>
        }
      />
    </Sider>
  );
}

export default withRouter(Navigation);
