import request from '../utils/request'

export function getArticlePagedList(params) {
  return request({
    url: `/posts/queryPageable?_=${Math.random()}`,
    method: 'get',
    params
  })
}

export function getArticleById(params) {
  return request({
    url: `/posts/getById?_=${Math.random()}`,
    method: 'get',
    params
  })
}

export function deleteArticle(params) {
  return request({
    url: `/posts/delete?_=${Math.random()}`,
    method: 'get',
    params
  })
}

export function createArticle(data) {
  return request({
    url: '/posts/insert',
    method: 'post',
    data
  })
}

export function updateArticle(data) {
  return request({
    url: '/posts/update',
    method: 'post',
    data
  })
}

// 对接后台上传接口的方法
export function mdEditorUploadImage(data) {
  return request({
    url: '/ossController/upload',
    method: 'post',
    data,
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const uploadUrl = process.env.VUE_APP_BASE_API + '/ossController/upload'
