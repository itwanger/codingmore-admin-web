import request from '../utils/request'

// 获取所有角色方法
export function getAllRoles() {
  return request({
    url: '/role/listAll',
    method: 'get'
  })
}

// 获取角色所拥有的菜单列表
export function getRoleOwnedMenuList(params) {
  return request({
    url: `/role/listMenu`,
    method: 'get',
    params
  })
}

// 获取角色所拥有的资源列表
export function getRoleOwnedSourceList(params) {
  return request({
    url: '/role/listResource',
    method: 'get',
    params
  })
}

// 分页查询角色列表
export function getRoleList(params) {
  return request({
    url: '/role/queryPageable',
    method: 'get',
    params
  })
}

// 添加保存角色方法
export function addRole(data) {
  return request({
    url: '/role/create',
    method: 'post',
    data
  })
}

// 修改保存角色方法
export function updateRole(data) {
  return request({
    url: '/role/update',
    method: 'post',
    data
  })
}

// 修改保存角色状态方法
export function setRoleStatus(data) {
  return request({
    url: '/role/updateStatus',
    method: 'post',
    data
  })
}

// 批量删除角色方法
export function deleteRoleBatch(data) {
  return request({
    url: '/role/delete',
    method: 'post',
    data
  })
}

// 给角色分配菜单保存方法
export function setMenuPowerForRole(data) {
  return request({
    url: '/role/allocMenu',
    method: 'post',
    data
  })
}

// 给角色分配资源保存方法
export function setSourcePowerForRole(data) {
  return request({
    url: '/role/allocResource',
    method: 'post',
    data
  })
}
