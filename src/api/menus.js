import request from '../utils/request'

// 分页查询菜单列表方法
export function getMenuList(params) {
  return request({
    url: `/menu/queryPageable`,
    method: 'get',
    params
  })
}

// 查询全部菜单，按照树形结构返回的方法
export function getAllMenusTree(params) {
  return request({
    url: `/menu/treeList`,
    method: 'get',
    params
  })
}

// 根据id查询菜单详细信息的方法
export function getMenuInfo(params) {
  return request({
    url: `/menu`,
    method: 'get',
    params
  })
}

// 新增保存菜单方法
export function addMenu(data) {
  return request({
    url: `/menu/create`,
    method: 'post',
    data
  })
}

// 更新保存菜单方法
export function updateMenu(data) {
  return request({
    url: `/menu/update`,
    method: 'post',
    data
  })
}

// 删除菜单方法
export function deleteMenu(data) {
  return request({
    url: `/menu/delete`,
    method: 'post',
    data
  })
}

// 设置菜单显示状态方法
export function setMenuVisible(data) {
  return request({
    url: `/menu/updateHidden`,
    method: 'post',
    data
  })
}
