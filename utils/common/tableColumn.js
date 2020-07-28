import * as R from 'ramda'
import _ from 'lodash'
import moment from 'moment'
import BrandIcon from '@/sections/BrandIcon'
import TagTableColumn from '@/sections/TagTableColumn'
import IpSupplement from '@/sections/IpSupplement'
import store from '@/store'
import i18n from '@/locales'
import { hasPermission } from '@/utils/auth'
import { typeClouds } from '@/utils/common/hypervisor'

export const getProjectTableColumn = ({ field = 'tenant', title = i18n.t('dictionary.project'), projectsItem = 'tenant', sortable = true, hidden = false, minWidth = 100 } = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth,
    slots: {
      default: ({ row }, h) => {
        const ret = []
        const project = row[field]
        if (R.is(Array, project)) {
          for (let i = 0, len = project.length; i < len; i++) {
            const row = project[i]
            ret.push(<list-body-cell-wrap copy row={row} field={projectsItem} />)
          }
        } else {
          ret.push(<list-body-cell-wrap copy field={field} row={{ [field]: project }} />)
        }
        const domain = row.project_domain || row.domain
        if (domain) {
          ret.push(
            <list-body-cell-wrap hide-field copy field="domain" row={{ domain }}>
              <span class='text-weak'>{ domain }</span>
            </list-body-cell-wrap>,
          )
        }
        return ret
      },
    },
    hidden,
  }
}

export const getRegionTableColumn = ({ field = 'region', title = '区域' } = {}) => {
  return {
    field,
    title,
    showOverflow: 'ellipsis',
    minWidth: 120,
    slots: {
      default: ({ row }, h) => {
        const val = _.get(row, field)
        const ret = []
        ret.push(
          <list-body-cell-wrap hide-field copy field={field} row={row}>
            <span style={{ color: '#0A1F44' }}>{ val }</span>
          </list-body-cell-wrap>,
        )
        if (row.zone) {
          ret.push(
            <list-body-cell-wrap hide-field copy field="zone" row={row}>
              <span style={{ color: '#53627C' }}>{ row.zone }</span>
            </list-body-cell-wrap>,
          )
        }
        return ret
      },
    },
  }
}

export const getBrandTableColumn = ({ field = 'brand', title = '平台', hidden = false, width = 70 } = {}) => {
  return {
    field,
    title,
    width,
    sortable: true,
    slots: {
      default: ({ row }, h) => {
        const val = _.get(row, field)
        if (!val) return '-'
        return [
          <BrandIcon name={ val } />,
        ]
      },
    },
    hidden,
  }
}

export const getStatusTableColumn = ({ field = 'status', title = '状态', statusModule, sortable = true, minWidth = 80, slotCallback } = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth,
    slots: {
      default: ({ row }, h) => {
        if (slotCallback && R.type(slotCallback) === 'Function') {
          const slot = slotCallback(row)
          if (slot || slot === 0) return slot
        }
        if (!statusModule) return 'status module undefined'
        const val = _.get(row, field)
        if (R.isNil(val)) return ''
        return [
          <div class='text-truncate'>
            <status status={ val } statusModule={ statusModule } />
          </div>,
        ]
      },
    },
  }
}

export const getEnabledTableColumn = ({ field = 'enabled', title = '启用状态', minWidth = 90 } = {}) => {
  return getStatusTableColumn({
    field,
    title,
    statusModule: 'enabled',
    minWidth,
  })
}

export const getPublicTableColumn = ({ field = 'share_mode', title = '共享模式' } = {}) => {
  const shareMode = {
    account_domain: '私有',
    system: '共享云账号',
    provider_domain: '共享订阅',
  }
  return {
    field,
    title,
    width: 100,
    slots: {
      default: ({ row }, h) => {
        return shareMode[row[field]]
      },
    },
  }
}

export const getNameDescriptionTableColumn = ({
  title = '名称',
  field = 'name',
  slotCallback,
  onManager,
  addLock,
  hideField,
  showDesc = true,
  sortable = true,
  addBackup,
  formRules,
  descriptionRules = [],
  cellWrapSlots,
  edit = true,
  editDesc = true,
  minWidth = 100,
} = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth,
    slots: {
      default: ({ row }, h) => {
        const ret = [
          h('list-body-cell-wrap', {
            props: {
              copy: true,
              edit: (R.type(edit) === 'Function' && edit(row)) || edit === true,
              field,
              row,
              onManager,
              hideField,
              addLock,
              addBackup,
              formRules,
            },
            scopedSlots: {
              default: () => slotCallback ? slotCallback(row, h) : null,
              ...(cellWrapSlots && R.is(Function, cellWrapSlots) ? cellWrapSlots(row) : {}),
            },
          }),
        ]
        if ((R.type(showDesc) === 'Function' && showDesc(row)) || showDesc === true) {
          ret.push(h('list-body-cell-wrap', {
            props: {
              edit: (R.is(Function, editDesc) && editDesc(row)) || editDesc === true,
              field: 'description',
              row,
              onManager,
              formRules: descriptionRules,
            },
          }))
        }
        return ret
      },
    },
  }
}

export const getCopyWithContentTableColumn = ({
  field = 'name',
  title = '名称',
  hideField,
  message,
  sortable,
  slotCallback,
  hidden,
  minWidth = 100,
} = {}) => {
  return {
    field,
    title,
    sortable,
    showOverflow: 'ellipsis',
    minWidth,
    slots: {
      default: ({ row }, h) => {
        const text = (message && R.type(message) === 'Function') ? message(row) : (message || (row[field] && row[field].toString()) || '-')
        return [
          <list-body-cell-wrap copy field={field} row={row} hideField={hideField} message={text}>
            { slotCallback ? slotCallback(row) : null }
          </list-body-cell-wrap>,
        ]
      },
    },
    hidden,
  }
}

export const getIpsTableColumn = ({ field = 'ips', title = 'IP', vm } = {}) => {
  return {
    field,
    title,
    showOverflow: 'ellipsis',
    width: '180px',
    slots: {
      default: ({ row }, h) => {
        if (!row.eip && !row.ips) {
          if (row.hypervisor === typeClouds.hypervisorMap.esxi.key && ['ready', 'running'].includes(row.status)) {
            return [
              h(IpSupplement, {
                props: {
                  row,
                  field,
                  vm,
                },
              }),
            ]
          }
        }
        let ret = []
        if (row.eip) {
          ret.push(
            <list-body-cell-wrap row={row} field="eip" copy><span class="text-color-help">({ row.eip_mode === 'elastic_ip' ? '弹性' : '公有' })</span></list-body-cell-wrap>,
          )
        }
        if (row.ips) {
          const ips = row.ips.split(',').map(ip => {
            return <list-body-cell-wrap copy row={{ ip }} hide-field field="ip">{ ip }<span class="text-color-help">(私有)</span></list-body-cell-wrap>
          })
          ret = ret.concat(ips)
        }
        return ret
      },
    },
  }
}

export const getSwitchTableColumn = ({ field, title, change }) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        let checked = row[field]
        if (R.is(String, checked)) {
          if (checked === 'true') checked = true
          if (checked === 'false') checked = false
        }
        return [
          <a-switch checked={ checked } checkedChildren='开' unCheckedChildren='关' onChange={ change } />,
        ]
      },
    },
  }
}

export const getTagTableColumn = ({
  field = 'metadata',
  title = '标签',
  ignoreKeys,
  needExt,
  resource,
  onManager,
  columns,
  tipName,
} = {}) => {
  return {
    field,
    title,
    width: 50,
    slots: {
      default: ({ row }, h) => {
        return [
          h(TagTableColumn, {
            props: {
              row,
              onManager,
              metadata: _.get(row, field) || {},
              ignoreKeys,
              needExt,
              resource,
              columns,
              tipName,
            },
          }),
        ]
      },
    },
  }
}

export const isPublicTableColumn = ({ field = 'is_public', title = '共享范围' } = {}) => {
  return {
    field,
    title,
    minWidth: 70,
    visible: store.getters.isAdminMode || store.getters.isDomainMode,
    formatter: ({ row }) => {
      let text = ''
      if (row.is_public === false || row.is_public === 'false') {
        text = '私有'
        if (row.shared_projects) {
          text = i18n.t('shareScope.project')
        }
      } else {
        const scopeText = i18n.t(`shareScope.${row.public_scope}`)
        if (row.public_scope) {
          text = scopeText
        } else {
          text = i18n.t('shareScope.system')
        }
      }
      return text
    },
  }
}
export const getTimeTableColumn = ({
  field = 'created_at',
  title = '创建时间',
  sortable = false,
  fromNow = false,
} = {}) => {
  return {
    field,
    title,
    width: 160,
    sortable,
    formatter: ({ cellValue }) => {
      if (fromNow) return cellValue ? moment(cellValue).fromNow() : '-'
      return cellValue ? moment(cellValue).format() : '-'
    },
  }
}

export const getAccountTableColumn = ({
  field = 'account',
  title = '云账号',
} = {}) => {
  return {
    field,
    title,
    width: 150,
    formatter: ({ cellValue }) => {
      return cellValue || '-'
    },
  }
}

export const getBillingTypeTableColumn = ({ field = 'billing_type', title = '计费方式', width = '120px' } = {}) => {
  return {
    field,
    title,
    showOverflow: 'ellipsis',
    width,
    slots: {
      default: ({ row }, h) => {
        const ret = []
        if (row[field] === 'postpaid') {
          ret.push(<div style={{ color: '#0A1F44' }}>按量付费</div>)
        } else if (row[field] === 'prepaid') {
          ret.push(<div style={{ color: '#0A1F44' }}>包年包月</div>)
        }
        if (row.expired_at) {
          const dateArr = moment(row.expired_at).fromNow().split(' ')
          const date = dateArr.join('')
          const seconds = moment(row.expired_at).diff(new Date()) / 1000
          const textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
          const text = seconds < 0 ? '已过期' : `${date.substring(0, date.length - 1)}后到期`
          ret.push(<div style={{ color: textColor }}>{ text }</div>)
        }
        return ret
      },
    },
  }
}

export const getPublicScopeTableColumn = ({
  field = 'public_scope',
  title = '共享范围',
  vm,
  resource,
  width = '110px',
} = {}) => {
  return {
    title,
    field,
    showOverflow: 'title',
    width,
    hidden: () => {
      return !store.getters.l3PermissionEnable && (store.getters.scopeResource && store.getters.scopeResource.domain.includes(resource))
    },
    slots: {
      default: ({ row }, h) => {
        const i18nPrefix = store.getters.l3PermissionEnable ? 'shareDesc' : 'shareDescPrimary'
        if (row.is_public === false || row.is_public === 'false') return i18n.t(`${i18nPrefix}.none`)
        const { public_scope: publicScope, shared_projects: sharedProjects, shared_domains: sharedDomains } = row
        if (publicScope === 'project' && sharedProjects && sharedProjects.length > 0) {
          return [
            <a onClick={() => {
              vm.createDialog('CommonDialog', {
                hiddenCancel: true,
                header: '共享范围',
                body: () => {
                  return [
                    <a-alert class='mb-2' message={ `该资源已共享给以下${sharedProjects.length}个项目` } />,
                    <dialog-table
                      vxeGridProps={{ showOverflow: 'title' }}
                      data={ sharedProjects }
                      columns={
                        [
                          getCopyWithContentTableColumn({
                            field: 'id',
                            title: 'ID',
                            minWidth: 140,
                          }),
                          getCopyWithContentTableColumn({
                            field: 'name',
                            title: '名称',
                          }),
                          getCopyWithContentTableColumn({
                            field: 'domain',
                            title: `所属${i18n.t('dictionary.domain')}`,
                          }),
                        ]
                      } />,
                  ]
                },
              })
            }}>{ i18n.t(`${i18nPrefix}.project`) }</a>,
          ]
        }
        if (publicScope === 'domain') {
          if (sharedDomains && sharedDomains.length > 0) {
            return [
              <a onClick={() => {
                vm.createDialog('CommonDialog', {
                  hiddenCancel: true,
                  header: '共享范围',
                  body: () => {
                    return [
                      <a-alert class='mb-2' message={ `该资源已共享给以下${sharedDomains.length}个域` } />,
                      <dialog-table
                        vxeGridProps={{ showOverflow: 'title' }}
                        data={ sharedDomains }
                        columns={
                          [
                            getCopyWithContentTableColumn({
                              field: 'id',
                              title: 'ID',
                              minWidth: 140,
                            }),
                            getCopyWithContentTableColumn({
                              field: 'name',
                              title: '名称',
                            }),
                          ]
                        } />,
                    ]
                  },
                })
              }}>{ i18n.t(`${i18nPrefix}.domain`) }</a>,
            ]
          }
          return i18n.t(`${i18nPrefix}.projectAll`)
        }
        if (publicScope === 'system') {
          return i18n.t(`${i18nPrefix}.domainAll`)
        }
        return '-'
      },
    },
  }
}

export const getProjectDomainTableColumn = ({
  field = 'project_domain',
  title = `所属${i18n.t('dictionary.domain')}`,
  sortable = true,
} = {}) => {
  return getCopyWithContentTableColumn({
    title,
    field,
    sortable,
    hidden: !(store.getters.isAdminMode || store.getters.isDomainMode),
  })
}

export const getBillingTableColumn = ({
  vm,
  field = 'billing_type',
  title = '计费方式',
  width = 120,
  showOverflow = 'ellipsis',
} = {}) => {
  return {
    title,
    field,
    width,
    showOverflow,
    slots: {
      default: ({ row }, h) => {
        const billingType = row[field]
        const ret = []
        const openVmSetDurationDialog = () => {
          if (!vm) return null
          vm.createDialog('SetDurationDialog', {
            data: [row],
            columns: vm.columns,
            onManager: vm.onManager,
            refresh: vm.refresh,
          })
        }
        if (billingType === 'postpaid') {
          ret.push(<div style={{ color: '#0A1F44' }}>按量付费</div>)
        } else if (billingType === 'prepaid') {
          ret.push(<div style={{ color: '#0A1F44' }}>包年包月</div>)
        }
        if (row.expired_at) {
          const time = vm.$moment(row.expired_at).format()
          let tooltipCon = <div slot="help"></div>
          if (billingType === 'postpaid') {
            if (hasPermission({ key: 'server_perform_cancel_expire' })) {
              tooltipCon = <div slot="help">虚拟机会在 { time } 释放，<span class="link-color" style="cursor: pointer" onClick={ openVmSetDurationDialog }>去设置</span></div>
            } else {
              tooltipCon = <div slot="help">虚拟机会在 { time } 释放</div>
            }
          } else if (billingType === 'prepaid') {
            if (row.auto_renew) {
              tooltipCon = <div slot="help">虚拟机会在 { time } 释放，到期自动续费</div>
            } else {
              tooltipCon = <div slot="help">虚拟机会在 { time } 释放，到期不续费</div>
            }
          }
          const help = <a-tooltip>
            <template slot="title">
              { tooltipCon }
            </template>
            <a-icon type="question-circle-o" />
          </a-tooltip>
          const dateArr = vm.$moment(row.expired_at).fromNow().split(' ')
          const date = dateArr.join('')
          const seconds = vm.$moment(row.expired_at).diff(new Date()) / 1000
          const textColor = seconds / 24 / 60 / 60 < 7 ? '#DD2727' : '#53627C'
          const text = seconds < 0 ? '已过期' : `${date.substring(0, date.length - 1)}后到期`
          ret.push(<div style={{ color: textColor }}>{ text } { help }</div>)
        }
        return ret
      },
    },
  }
}
