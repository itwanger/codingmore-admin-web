<template>
  <div class="app-container">
    <div class="filter-container">
      <div class="text-right">
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          新增
        </el-button>
        <!-- <el-button class="filter-item" style="margin-left: 10px;" type="danger" icon="el-icon-delete" @click="">
              删除
            </el-button> -->
      </div>
    </div>
    <div class="table-container">
      <el-table ref="multipleTable" height="calc(100% - 10px)" :key="tableAbout.tableKey" :data="tableAbout.tableData" border fit stripe highlight-current-row class="normal-table" @selection-change="handleSelectionChange">
        <!-- <el-table-column align="center" class-name="recorrect-center" type="selection" width="55px" /> -->
        <el-table-column label="编号" prop="postsId" width="80px" align="center" />
        <el-table-column label="标题" prop="postTitle" min-width="450px" show-overflow-tooltip />
        <el-table-column label="摘要" prop="postExcerpt" width="200px" show-overflow-tooltip />
        <el-table-column label="作者" prop="userNiceName" width="100px" align="center" />
        <el-table-column label="发布时间" prop="postDate" width="155px" align="center" />
        <el-table-column label="状态" prop="postStatus" width="80px" :formatter="statusFilter" align="center" />
        <el-table-column label="排序号" prop="menuOrder" width="80px" align="center" />
        <el-table-column label="操作" align="center" width="180px" fixed="right">
          <template slot-scope="{row,$index}">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-button v-if="row.status!='deleted'" size="mini" type="danger" @click="handleDelete(row,$index)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="text-right">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="tableAbout.listQuery.page" :page-size="tableAbout.listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :page-sizes="[15, 30, 50, 100]" :total="tableAbout.listQuery.total">
      </el-pagination>
    </div>
  </div>
</template>

<script>
import { getArticlePagedList, deleteArticle } from '@/api/articles'

export default {
  name: 'ArticlesManagement',
  data() {
    return {
      statusList: [{ value: 'PUBLISHED', label: '发布' }, { value: 'DELETED', label: '删除' }, { value: 'DRAFT', label: '草稿' }],

      // 文章列表相关属性
      tableAbout: {
        listQuery: {
          page: 1,
          pageSize: 15,
          total: 0
        },
        tableKey: 0,
        tableData: []
      },

      // 拼接的栏目树的根节点，也就是当前站点
      siteNodeOnTree: null,

      // 页面用来编辑的数据模型
      editDataModel: {
        postsId: undefined,
        postTitle: '', // 标题
        postDate: '', // 发布时间
        postContent: '', // 正文
        postExcerpt: '', // 摘要
        menuOrder: '', // 排序号
        postType: 'POST', // 文章类型
        postStatus: 'DRAFT', // 文章状态
        termTaxonomyId: '', // 所属栏目id
        attribute: '', // 属性
        tags: '' // 标签
      },

      // 树形栏目数据
      treeData: null,
      // 当前选中树节点的数据
      treeSelectedNode: null,
      // 当前树节点过滤条件
      searchTreeText: '',
      treeDefaultProps: {
        children: 'children',
        label: 'name'
      }
    }
  },
  mounted() {
    // console.log('mounted中，当前站点变量：', this.currentSite)
    // 初始化站点节点
    this.getList()

    let _this = this
    window.refleshTable = (requestColumnId) => {
      if (_this.$route.name === 'article-management') {
        if (_this.tableAbout.listQuery.termTaxonomyId == requestColumnId ||
          _this.tableAbout.listQuery.termTaxonomyId == '') {
          _this.search()
        }
      }
    }
  },
  methods: {
    // 处理页码改变事件
    handleSizeChange(val) {
      this.tableAbout.listQuery.pageSize = val
      this.search()
    },

    // 处理页码改变事件
    handleCurrentChange(val) {
      console.log('handleCurrentChangec传入参数', val)
      this.tableAbout.listQuery.page = val
      this.getList()
    },

    // 状态翻译
    statusFilter(row) {
      let statusText = ''
      const filterArr = this.statusList.filter(item => item.value === row.postStatus)
      if (filterArr.length > 0) {
        statusText = filterArr[0].label
      }
      return statusText
    },

    // 文章搜索方法
    search() {
      this.tableAbout.listQuery.page = 1
      this.getList()
    },

    // 文章列表查询方法
    getList() {
      // this.tableAbout.listQuery.total = 0
      getArticlePagedList(this.tableAbout.listQuery).then(res => {
        this.tableAbout.tableData = res.items
        this.tableAbout.listQuery.total = res.total
        console.log('查询列表后表格变量', this.tableAbout)
      })
    },

    // 处理当前选中节点改变方法
    handleCurrentNodeChange(data, node) {
      if (this.treeSelectedNode !== data) {
        this.treeSelectedNode = data
        if (this.treeSelectedNode.termTaxonomyId !== 0) {
          this.tableAbout.listQuery.termTaxonomyId = this.treeSelectedNode.termTaxonomyId
        } else {
          this.tableAbout.listQuery.termTaxonomyId = ''
        }

        this.getList()
      }
      if (node.expanded === false) {
        node.expanded = true
      }
    },

    // 触发搜索树方法
    searchTree() {
      this.$refs.columnTree.filter(this.searchTreeText)
    },

    // 按名称搜索树节点方法
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    // 处理table选中行改变方法
    handleSelectionChange(val) {
      console.log('table选中行改变', val)
    },
    // 获得站点树节点——即根节点
    getTreeNodeOfSite() {
      return {
        termTaxonomyId: 0,
        name: '全部',
        // tplPath: this.currentSite.telName,
        // tplDetailPath: '',
        description: '',
        parentId: -1,
        children: null
      }
    },
    // 新增按钮点击方法
    handleCreate() {
      this.openEditPage(null)
    },
    // 修改按钮点击方法
    handleUpdate(row) {
      this.openEditPage(row.postsId)
    },
    // 行删除按钮处理
    handleDelete(row, index) {
      const confirmMes = '是否确认删除该文章？'
      this.$confirm(confirmMes, '系统提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteArticle({ postsId: row.postsId }).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.getList()
        })
      })
    },

    // 打开文章编辑页面
    openEditPage(aid) {
      let url = '/#/content/article-editing'
      if (aid) {
        url = `${url}?aid=${aid}`
      }
      window.open(url)
    }
  }
}
</script>
<style scoped>
.left-part {
  width: 35%;
  padding-right: 10px;
}
.right-part {
  width: 65%;
  padding-left: 10px;
}
.tree-area {
  margin-top: 10px;
}

.table-container {
  height: calc(100% - 32px - 41px);
  box-sizing: border-box;
  padding-top: 8px;
}
</style>
