import request from '../utils/request'

// 获得所有专栏
export function getAllColumns(params) {
  return request({
    url: `/termTaxonomy/getPyParentId`,
    method: 'get',
    params
  })
}

// 根据id查询专栏详情
export function getOneColumn(params) {
  return request({
    url: `/termTaxonomy/getById`,
    method: 'get',
    params
  })
}

// 更新专栏保存方法
export function updateColumn(data) {
  return request({
    url: '/termTaxonomy/update',
    method: 'post',
    data
  })
}

// 添加专栏保存方法
export function addColumn(data) {
  return request({
    url: '/termTaxonomy/insert',
    method: 'post',
    data
  })
}

// 删除专栏方法
export function deleteColumn(id) {
  return request({
    url: `/termTaxonomy/delete?_=${Math.random()}`,
    method: 'get',
    params: {
      termTaxonomyId: id
    }
  })
}
