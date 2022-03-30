import request from '../utils/request'
// 查询资源分类列表方法
export function getSourceCategoryList(params) {
  return request({
    url: '/resourceCategory/listAll',
    method: 'get',
    params
  })
}

// 添加资源分类方法
export function addSourceCatagory(data) {
  return request({
    url: '/resourceCategory/insert',
    method: 'post',
    data
  })
}

// 更新资源分类方法
export function updateSourceCatagory(data) {
  return request({
    url: '/resourceCategory/update',
    method: 'post',
    data
  })
}

// 删除资源分类方法
export function deleteSourceCatagory(data) {
  return request({
    url: '/resourceCategory/delete',
    method: 'post',
    data
  })
}
