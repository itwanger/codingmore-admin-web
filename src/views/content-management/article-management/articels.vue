<template>
  <div class="app-container">
    <div class="flex-row-ver-center">
      <div class="flex-auto-item">
        <el-input v-model="tableAbout.listQuery.postTitleKeyword" placeholder="请输入标题"></el-input>
      </div>
      <div class="flex-fixed-item">
        <el-select v-model="tableAbout.listQuery.postStatus" clearable placeholder="文章状态">
          <el-option v-for="item in statusList" :label="item.label" :value="item.value" :key="item.value">{{item.label}}</el-option>
        </el-select>
      </div>
      <div class="flex-fixed-item">
        <el-button class="filter-item" style="margin-left:14px;" type="primary" icon="el-icon-search" @click="search">
          搜索
        </el-button>
        <!-- <el-button class="filter-item" type="primary" @click="setArticleColumns">
          分配文章
        </el-button> -->
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          新增
        </el-button>
      </div>
    </div>
    <div class="table-container">
      <el-table ref="multipleTable" height="calc(100% - 10px)" :key="tableAbout.tableKey" :data="tableAbout.tableData" border fit highlight-current-row class="normal-table" @selection-change="handleSelectionChange">
        <!-- <el-table-column align="center" class-name="recorrect-center" type="selection" width="55px" /> -->
        <el-table-column label="编号" prop="postsId" width="80px" align="center" />
        <el-table-column label="封面图" width="80px" align="center" class-name="article-cover-col">
          <template slot-scope="{row}">
            <el-popover v-if="row.attribute && row.attribute.articleCoverUrl" placement="right" trigger="hover">
              <el-image style="width: 360px; height: 240px" :src="row.attribute.articleCoverUrl" fit="cover"></el-image>
              <el-image slot="reference" style="width: 69px; height: 46px" :src="row.attribute.articleCoverUrl" fit="cover"></el-image>
            </el-popover>
            <el-image v-else :src="defaultArticleCoverSrc" fit="fill"></el-image>
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="postTitle">
          <template slot-scope="{row}">
            <img :src="onTopImageSrc" class="icon-ontop" v-if="row.menuOrder !== 0" />
            <el-link type="primary" @click="handleUpdate(row)">{{row.postTitle}}</el-link>
          </template>
        </el-table-column>
        <!-- <el-table-column label="摘要" prop="postExcerpt" width="200px" show-overflow-tooltip /> -->
        <el-table-column label="作者" prop="userNiceName" width="100px" align="center" />
        <el-table-column label="操作/发布时间" prop="postDate" width="155px" align="center">
          <template slot-scope="{row}">
            {{row.postDate ? row.postDate.substr(0,16) : row.postModified.substr(0,16) }}
          </template>
        </el-table-column>
        <el-table-column label="状态" prop="postStatus" width="80px" :formatter="statusFilter" align="center">
          <template slot-scope="{row}">
            <el-tag :type="row.postStatus == 'DRAFT' ? 'info': 'success'">
              {{ statusFilter(row) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="置顶" prop="menuOrder" width="80px" align="center">
          <template slot-scope="{row}">
            <el-switch v-model="row.menuOrder" :active-value="1" :inactive-value="0" @change="handleSettingOnTop($event, row)">
            </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="180px">
          <template slot-scope="{row,$index}">
            <!-- <el-button type="primary" size="mini" @click="handleSettingOnTop(row)">
              {{ row.menuOrder === 0 ? '置顶' : '取消置顶'}}
            </el-button> -->
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
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="tableAbout.listQuery.page" background :page-size="tableAbout.listQuery.pageSize" layout="total, sizes, prev, pager, next, jumper" :page-sizes="[15, 30, 50, 100]" :total="tableAbout.listQuery.total">
      </el-pagination>
    </div>

    <el-dialog title="分配文章到专栏" width="400px" :visible.sync="assignArticlesDialogShow">
      <div class="filter-container">
        <el-input v-model="searchTreeText" placeholder="专栏名称" @keyup.enter.native="searchTree">
          <el-button slot="append" icon="el-icon-search" @click="searchTree" />
        </el-input>
      </div>
      <div class="tree-area">
        <el-tree ref="columnTree" :filter-node-method="filterNode" :auto-expand-parent="true" :highlight-current="true" :data="treeData" node-key="termTaxonomyId" :expand-on-click-node="false" :props="treeDefaultProps" show-checkbox :check-strictly="true" @current-change="handleTreeNodeChange" />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assignArticlesDialogShow = false">取 消</el-button>
        <el-button type="primary" @click="confirmArticleToColumns">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getArticlePagedList, deleteArticle, bindArticleToColumns, setArticleOnTop, cancelArticleOnTop } from '@/api/articles'
import { loopExpendTree } from '@/utils/common'
import { getAllColumns } from '@/api/columns'
import qs from 'qs'
import './page.css'

export default {
  name: 'ArticlesManagement',
  data() {
    return {
      // 默认文章图片路径
      defaultArticleCoverSrc: require('@/assets/default-article-cover.png'),

      statusList: [{ value: 'DRAFT', label: '草稿' }, { value: 'PUBLISHED', label: '发布' }], // { value: 'DELETED', label: '删除' },

      // 文章列表相关属性
      tableAbout: {
        listQuery: {
          page: 1,
          pageSize: 15,
          total: 0,
          orderBy: 'menu_order,post_modified',
          asc: false,
          postTitleKeyword: '',
          postStatus: ''
        },
        tableKey: 0,
        tableData: [],
        selectedRowList: [] // 被选中行集合
      },

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
      },
      // 分配文章到专栏对话框的可见度
      assignArticlesDialogShow: false,

      // 置顶图标路径
      onTopImageSrc: require('@/assets/icon-ontop.png')
    }
  },
  mounted() {
    // 获取文章列表
    this.getList()
    // 获取专栏树数据
    // this.getTreeData()

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
    // 保存分配文章到专栏的方法
    confirmArticleToColumns() {
      const checkedNodes = this.$refs.columnTree.getCheckedNodes()
      if (checkedNodes.length == 0) {
        this.$message.info('请选择文章要分配到的栏目')
        return false
      }
      const termTaxonomyIds = checkedNodes.map(item => item.termTaxonomyId)
      const postsIds = this.tableAbout.selectedRowList.map(item => item.postsId)
      bindArticleToColumns({ postsIds, termTaxonomyIds }).then(() => {
        this.assignArticlesDialogShow = false
        this.$notify({
          title: '成功',
          message: '分配文章成功',
          type: 'success',
          duration: 2000
        })
      })
      // console.log('checkedNodes=', checkedNodes, bindArticleToColumns)
    },

    // 获得树数据方法
    getTreeData() {
      getAllColumns().then(res => {
        const columns = res
        this.treeData = columns
        if (this.treeSelectedNode === null) {
          this.treeSelectedNode = this.treeData[0]
        }
      })
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
    // 处理当前选中节点改变方法
    handleTreeNodeChange(data, node) {
      if (this.treeSelectedNode !== data) {
        console.log('handleCurrentChange:重新赋值', data, node)
        this.treeSelectedNode = data
      }
      if (node.expanded === false) {
        node.expanded = true
      }
    },

    // 分配文章到栏目的点击方法
    setArticleColumns() {
      if (this.tableAbout.selectedRowList.length == 0) {
        this.$message.info('请先选择一篇或者多篇文章进行操作')
        return false
      }
      this.assignArticlesDialogShow = true
      this.searchTreeText = ''
      this.$nextTick(() => {
        this.$refs.columnTree.setCurrentKey(this.treeSelectedNode.termTaxonomyId)
        const theNode = this.$refs.columnTree.getNode(this.treeSelectedNode.termTaxonomyId)
        this.handleTreeNodeChange(theNode.data, theNode)
        console.log('获得当前选中节点：：：', theNode)
        console.log('当前treeSelectedNode', this.treeSelectedNode, theNode.data)
        loopExpendTree(this.$refs.columnTree, theNode, 0)
        if (this.searchTreeText !== '') {
          this.searchTree()
        }
      })
    },

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

    // 处理table选中行改变方法
    handleSelectionChange(val) {
      this.tableAbout.selectedRowList = val
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
      // this.openEditPage(null)
      this.$router.push('/content/article-editing')
    },
    // 修改按钮点击方法
    handleUpdate(row) {
      // this.openEditPage(row.postsId)
      // this.$router.push(`/content/article-editing?aid=${row.postsId}`)
      this.$router.push(`/content/article-modify?aid=${row.postsId}`)
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

    // 置顶/取消置顶方法
    handleSettingOnTop(status, row) {
      const reqFunc = status === 0 ? cancelArticleOnTop : setArticleOnTop
      let reqData = qs.stringify({ postsId: row.postsId })
      reqFunc(reqData).then(() => {
        this.$notify({
          title: '成功',
          message: '操作成功',
          type: 'success',
          duration: 2000
        })
        this.getList()
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
