import {
  MessageBox
} from 'element-ui'

/**
 * 创建uuid方法
 */
export const createUuid = () => {
  var s = []
  var hexDigits = '0123456789abcdef'
  for (var i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
  }
  s[14] = '4'
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1)
  s[8] = s[13] = s[18] = s[23] = '-'

  var uuid = s.join('')
  return uuid
}

// 逐层展开当前节点
export function loopExpendTree(treeObject, currentNode, rootId) {
  currentNode.expanded = true
  while (currentNode.data.parentId !== rootId) {
    currentNode = treeObject.getNode(currentNode.data.parentId)
    if (!currentNode.expanded) {
      currentNode.expanded = true
    }
  }
}

// 合并相同对象相同key值的方法
export function assignSameProperty(targetObject, otherObject) {
  if (targetObject && otherObject) {
    let tempArr = []
    Object.keys(otherObject).forEach(key => {
      if (!targetObject.hasOwnProperty(key)) {
        tempArr.push(key)
      }
    })
    tempArr.forEach(key => {
      Reflect.deleteProperty(otherObject, key)
    })
    return Object.assign(targetObject, otherObject)
  } else {
    return targetObject || otherObject
  }
}

/**
 * 从elementUI表单验证回调参数当中获取错误信息数组的方法
 * @param {object} formValidErrObject elementUI表单验证失败后回调的第二个参数
 */
export function getFormValidErrorMessageArray(formValidErrObject) {
  const retArr = []
  Object.keys(formValidErrObject).forEach(key => {
    formValidErrObject[key].forEach(errObj => {
      retArr.push(errObj.message)
    })
  })
  return retArr
}

/**
 * 在禁用elementUI自带的表单提示的前提下，统一处理表单验证失败的方法
 * @param {object} formValidErrObject elementUI表单验证失败后回调的第二个参数
 */
export function handleFormValidError(formValidErrObject) {
  let errMsgArr = getFormValidErrorMessageArray(formValidErrObject)
  MessageBox({
    dangerouslyUseHTMLString: true,
    message: errMsgArr.join('<br />'),
    type: 'error',
    title: '操作失败'
  })
}

/**
 * html转纯文本方法
 * @param {string} html 传入html，返回纯文本
 */
export function getTextFormHtml(html) {
  return html.replace(/<(style|script|iframe)[^>]*?>[\s\S]+?<\/\1\s*>/gi, '').replace(/<[^>]+?>/g, '').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/>/g, ' ')
}

/**
 * json对象深拷贝方法
 * @param {*} obj 要拷贝的json对象
 */
export function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj))
}
