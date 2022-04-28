import mainFrame from '@/layout'
import articles from '../views/content-management/article-management'
// import columns from '../views/content-management/column-management'
import tags from '../views/content-management/tag-management'
import articleEdit from '../views/content-management/article-editing'
import users from '../views/system-management/users-management'
import roles from '../views/system-management/roles-management'
import menus from '../views/system-management/menu-management'
import sourceCategories from '../views/system-management/source-category-management'
import sources from '../views/system-management/source-management'
import siteConfig from '../views/system-management/site-configuration'

// 要展示在导航栏上的菜单数组
const pageRouters = [
  {
    path: '/content',
    redirect: '/content/articles',
    name: 'content-management',
    component: mainFrame,
    icon: 'el-icon-s-help', // el-icon-s-help
    meta: {
      title: '内容管理'
    },
    children: [
      {
        path: 'article-editing',
        name: 'article-editing',
        icon: 'el-icon-edit-outline',
        component: articleEdit,
        meta: {
          title: '创建文章'
        }
      },
      {
        path: 'articles',
        name: 'article-management',
        icon: 'iconpark-list-two',
        component: articles,
        meta: {
          title: '文章列表'
        }
      },
      {
        path: 'tags',
        name: 'tag-management',
        icon: 'iconfont-tag-management',
        component: tags,
        meta: {
          title: '标签管理'
        }
      }
      // {
      //   path: 'columns',
      //   name: 'column-management',
      //   icon: 'el-icon-s-grid',
      //   component: columns,
      //   meta: {
      //     title: '专栏管理'
      //   }
      // }
    ]
  },
  {
    path: '/system',
    redirect: '/system/site',
    name: 'system-management',
    component: mainFrame,
    icon: 'el-icon-s-operation',
    meta: {
      title: '系统管理'
    },
    children: [
      {
        path: 'site',
        name: 'site-configuration',
        component: siteConfig,
        icon: 'iconpark-config',
        meta: {
          title: '站点配置'
        }
      },
      {
        path: 'users',
        name: 'users-management',
        component: users,
        icon: 'el-icon-user',
        meta: {
          title: '用户管理'
        }
      },
      {
        path: 'roles',
        name: 'roles-management',
        component: roles,
        icon: 'iconfont-role-management',
        meta: {
          title: '角色管理'
        }
      },
      {
        path: 'menus',
        name: 'menus',
        component: menus,
        icon: 'iconfont-menu-management',
        meta: {
          title: '菜单管理'
        }
      },
      {
        path: 'sources',
        name: 'sources',
        component: sources,
        icon: 'iconfont-source-management',
        meta: {
          title: '资源管理'
        }
      },
      {
        path: 'source-categories',
        name: 'source-categories-management',
        component: sourceCategories,
        icon: 'el-icon-coin',
        meta: {
          title: '资源分类管理'
        }
      }
      // {
      //   path: 'log',
      //   name: 'log-management',
      //   component: log,
      //   meta: {
      //     title: '日志管理'
      //   }
      // }
    ]
  }
]

export default pageRouters
