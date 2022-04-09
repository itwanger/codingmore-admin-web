<template>
  <div class="app-container">
    <div class="flex-row-ver-center">
      <div class="flex-auto-item">
        <el-input v-model="tableAbout.listQuery.nameKeyword" placeholder="请输入资源名称" clearable></el-input>
      </div>
      <div class="flex-auto-item">
        <el-input v-model="tableAbout.listQuery.urlKeyword" placeholder="请输入资源路径" clearable></el-input>
      </div>
      <div class="flex-fixed-item">
        <el-select v-model="tableAbout.listQuery.categoryId" clearable placeholder="资源分类">
          <el-option v-for="item in categoryList" :label="item.label" :value="item.value" :key="item.value">{{item.label}}</el-option>
        </el-select>
      </div>
      <div class="flex-fixed-item">
        <el-button class="filter-item" style="margin-left: 14px" type="primary" icon="el-icon-search" @click="search">
          搜索
        </el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="gotoCategory">
          资源分类
        </el-button>
        <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">
          新增
        </el-button>
      </div>
    </div>
    <div class="table-container">
      <el-table ref="multipleTable" height="calc(100% - 10px)" :key="tableAbout.tableKey" :data="tableAbout.tableData" border fit highlight-current-row class="normal-table">
        <el-table-column label="编号" prop="resourceId" width="80px" align="center" />
        <el-table-column label="资源名称" prop="name" />
        <el-table-column label="资源路径" prop="url" />
        <el-table-column label="资源分类" align="center">
          <template slot-scope="{ row }">
            {{ categoryFormatter(row.categoryId) }}
          </template>
        </el-table-column>
        <el-table-column label="描述" prop="description" />
        <el-table-column label="添加时间" prop="createTime" align="center" width="180px" />
        <el-table-column label="操作" align="center" width="160px">
          <template slot-scope="{ row }">
            <el-button type="primary" size="mini" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-button size="mini" type="danger" @click="handleDelete(row)">
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

    <el-dialog :title="editDialog.title[editDialog.status]" width="500px" :visible.sync="editDialog.visible">
      <el-form ref="editInfoForm" :model="editDataModel" :rules="editDialog.rules" label-position="right" label-width="80px">
        <el-form-item label="资源名称" prop="name">
          <el-input v-model="editDataModel.name" autocomplete="off" maxlength="20" placeholder="请输入资源名称"></el-input>
        </el-form-item>
        <el-form-item label="资源路径" prop="url">
          <el-input v-model="editDataModel.url" autocomplete="off" maxlength="80" placeholder="请输入资源路径"></el-input>
        </el-form-item>
        <el-form-item label="资源分类" prop="categoryId">
          <el-select v-model="editDataModel.categoryId" filterable placeholder="资源分类">
            <el-option v-for="item in categoryList" :label="item.label" :value="item.value" :key="item.value">{{item.label}}</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input type="textarea" :rows="4" v-model="editDataModel.description" autocomplete="off" maxlength="200" placeholder="请输入描述"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="saveSourceInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getSourceCategoryList } from '@/api/source-categories'
import { getSourceList, deleteSource, addSource, updateSource, getSourceInfo } from '@/api/sources'
import { emptyChecker } from '@/utils/validate'
import qs from 'qs'

export default {
  name: 'SourceManagement',
  data() {
    return {
      // 文章列表相关属性
      tableAbout: {
        listQuery: {
          page: 1,
          pageSize: 15,
          total: 0,
          categoryId: null,
          nameKeyword: '',
          urlKeyword: ''
        },
        tableKey: 0,
        tableData: []
      },

      // 资源分类列表
      categoryList: [],

      // 页面用来编辑的数据模型
      editDataModel: {
        resourceId: '',
        name: '',
        url: '',
        categoryId: null,
        createTime: '',
        description: ''
      },

      // 编辑用户信息弹窗数据模型
      editDialog: {
        title: ['新增资源', '编辑资源'],
        visible: false,
        status: 0,
        rules: {
          name: [{ required: true, validator: emptyChecker, message: '资源名称不能为空', trigger: 'blur' }],
          url: [{ required: true, validator: emptyChecker, message: '资源路径不能为空', trigger: 'blur' }],
          categoryId: [{ required: true, validator: emptyChecker, message: '资源分类不能为空', trigger: 'blur' }]
        }
      }
    }
  },
  mounted() {
    // 先查询资源分类列表
    this.getCategoryList().then(() => {
      // 再查询资源列表
      this.getList()
    })
  },
  methods: {
    // 跳转资源分类页面
    gotoCategory() {
      this.$router.push('/system/source-categories')
    },

    // 处理页码改变事件
    handleSizeChange(val) {
      this.tableAbout.listQuery.pageSize = val
      this.search()
    },

    // 处理页码改变事件
    handleCurrentChange(val) {
      this.tableAbout.listQuery.page = val
      this.getList()
    },

    // 文章搜索方法
    search() {
      this.tableAbout.listQuery.page = 1
      this.getList()
    },

    // 列表查询方法
    getList() {
      getSourceList(this.tableAbout.listQuery).then((res) => {
        this.tableAbout.tableData = res.items
        this.tableAbout.listQuery.total = res.total
      })
    },

    // 查询资源分类列表方法，作为选项
    getCategoryList() {
      return getSourceCategoryList().then((res) => {
        if (res && res.length > 0) {
          this.categoryList = res.map(item => {
            return { label: item.name, value: item.resourceCategoryId }
          })
        }
      })
    },

    // 用来翻译资源分类列
    categoryFormatter(val) {
      let found = this.categoryList.filter(x => x.value == val)
      if (found != null && found.length > 0) {
        return found[0].label
      }
      return ''
    },

    // 保存编辑信息方法
    saveSourceInfo() {
      this.$refs['editInfoForm'].validate((valid) => {
        if (valid) {
          const saveFunc = this.editDialog.status == 0 ? addSource : updateSource
          saveFunc(qs.stringify(this.editDataModel)).then(() => {
            this.$notify({
              title: '成功',
              message: '保存成功',
              type: 'success',
              duration: 2000
            })
            this.getList()
            this.editDialog.visible = false
          })
        }
      })
    },

    // 新增的时候重置编辑数据模型
    getAddUserModel() {
      this.editDataModel = {
        resourceId: '',
        name: '',
        url: '',
        categoryId: null,
        createTime: '',
        description: ''
      }
    },

    openEditDialog(dialogStatus) {
      this.editDialog.status = dialogStatus
      if (this.$refs['editInfoForm']) {
        this.$refs['editInfoForm'].clearValidate()
      }
      this.editDialog.visible = true
    },

    // 新增按钮点击方法
    handleCreate() {
      this.getAddUserModel()
      this.openEditDialog(0)
    },
    // 修改按钮点击方法
    handleUpdate(row) {
      getSourceInfo({ id: row.resourceId }).then(res => {
        this.editDataModel = res
        this.openEditDialog(1)
      })
    },
    // 行删除按钮处理
    handleDelete(row, index) {
      const confirmMes = '是否确认删除该资源？'
      this.$confirm(confirmMes, '系统提示', {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteSource(qs.stringify({ id: row.resourceId })).then(() => {
          this.$notify({
            title: '成功',
            message: '删除成功',
            type: 'success',
            duration: 2000
          })
          this.editDialog.visible = false
          this.getList()
        })
      })
    }
  }
}
</script>
