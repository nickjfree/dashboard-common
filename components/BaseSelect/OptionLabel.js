const resourceMode = {
  networks: {
    vnode: (vm, h) => {
      const text = vm.getLabel()
      return ( // IP子网
        <div class='d-flex'>
          <span class='text-truncate flex-fill mr-2' title={ text }>{ text }</span>
          <span style="color: #8492a6; font-size: 13px">可用: { vm.data.ports - vm.data.ports_used }</span>
        </div>
      )
    },
    labelFormat: item => `${item.name}（${item.guest_ip_start} - ${item.guest_ip_end}, vlan=${item.vlan_id}）`,
  },
  vpcs: {
    vnode: (vm, h) => {
      const text = vm.getLabel()
      return (
        <div class="d-flex">
          <span class='text-truncate flex-fill' title={ text }>{ text }</span>
        </div>
      )
    },
    labelFormat: item => {
      if (!item.cidr_block) return item.name
      return `${item.name}（${item.cidr_block}）`
    },
  },
  servers: {
    labelFormat: item => {
      let label = item.name
      if (item.ips) label += ` (${item.ips})`
      return label
    },
  },
  // repos: {
  //   vnode: (vm, h) => {
  //     const text = vm.getLabel()
  //     let type = '-'
  //     if (vm.data.type === 'internal') type = `${vm.$t('dictionary.server')}类型`
  //     if (vm.data.type === 'external') type = `${vm.$t('dictionary.container')}类型`
  //     return (
  //       <div class='d-flex'>
  //         <span class='text-truncate flex-fill mr-2' title={ text }>{ text }</span>
  //         <span style="color: #8492a6; font-size: 13px">{ type }</span>
  //       </div>
  //     )
  //   },
  // },
}

export default {
  name: 'OptionLabel',
  props: {
    nameKey: {
      type: String,
      required: true,
    },
    labelFormat: {
      type: Function,
    },
    data: {
      type: Object,
      required: true,
    },
    resource: {
      type: String,
    },
  },
  data () {
    return {
      text: this.data[this.nameKey],
    }
  },
  methods: {
    getLabel () {
      let text = this.data[this.nameKey]
      const resourceItem = resourceMode[this.resource]
      if (this.labelFormat) {
        text = this.labelFormat(this.data)
      } else if (resourceItem && resourceItem.labelFormat) {
        text = resourceItem.labelFormat(this.data)
      }
      return text
    },
  },
  render (h) {
    const resourceItem = resourceMode[this.resource]
    if (this.resource) { // 兼容外传 options 的情况
      if (resourceItem && resourceItem.vnode) {
        return resourceItem.vnode(this, h)
      }
    }
    const text = this.getLabel()
    return (<div title={text}>{ text }</div>)
  },
}
