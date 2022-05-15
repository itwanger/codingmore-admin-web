<template>
  <!-- 当图标开头是el-icon-的时候，是elementUI自带图标 -->
  <i :class="(iconClass && iconClass.startsWith('el-icon-') ? iconClass : 'custom-icon') + ' more-icon'">
    <!-- 当图标开头是iconpark-的时候，是字节图标库的图标 -->
    <template v-if="iconClass.startsWith('iconpark-')">
      <list-two v-if="iconClass === 'iconpark-list-two'" theme="outline" size="18" />
      <setting-two v-if="iconClass === 'iconpark-setting-two'" theme="outline" size="18" />
      <config v-if="iconClass === 'iconpark-config'" theme="outline" size="18" />
    </template>
    <!-- 当图标开头是iconpark-的时候，是阿里矢量图标库的图标 -->
    <span v-else-if="iconClass.startsWith('iconfont-')" v-html="getSvg(iconClass, iconWidth, iconHeight, iconColor)"></span>
  </i>
</template>
<script>
import '@icon-park/vue/styles/index.css'
import getSvg from './svg-code'
// 使用字节图标的时候需要引入这里，这是[必要步骤1]
import { ListTwo, SettingTwo, SettingConfig, Config } from '@icon-park/vue'
export default {
  name: 'MoreIcon',
  components: {
    // 使用字节图标的时候需要引入这里，这是[必要步骤2]
    ListTwo, SettingTwo, SettingConfig, Config
  },
  props: {
    iconClass: {
      type: String,
      default: ''
    },
    iconWidth: {
      type: Number,
      default: 18
    },
    iconHeight: {
      type: Number,
      default: 18
    },
    iconColor: {
      type: String,
      default: 'currentColor'
    }
  },
  methods: {
    getSvg
  }
}
</script>
<style scoped>
.custom-icon {
  display: inline-block;
  width: 24px;
  height: 18px;
  text-align: center;
  margin-right: 5px;
  line-height: 1;
  position: relative;
  top: -1px;
  vertical-align: middle;
}
</style>
