import request from '../utils/request'

// 查询标签分页列表方法
export function getTagList(params) {
  return request({
    url: '/postTag/queryPageable',
    method: 'get',
    params
  })
}

// 添加保存标签方法
export function addTag(data) {
  return request({
    url: '/postTag/insert',
    method: 'post',
    data
  })
}

// 修改保存标签方法
export function updateTag(data) {
  return request({
    url: '/postTag/update',
    method: 'post',
    data
  })
}

// 删除标签方法
export function deleteTag(params) {
  return request({
    url: '/postTag/delete',
    method: 'get',
    params
  })
}
