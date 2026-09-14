import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

/**
 * Composable untuk mendapatkan hak akses CRUD menu saat ini secara reaktif
 * berdasarkan detail role akun yang sedang login di sistem.
 * 
 * @param {string|null} customPath - Opsional: path menu khusus jika berbeda dari current route
 * @returns {object} { permissions, canRead, canCreate, canShow, canUpdate, canDelete, canPrint }
 */
export function usePermissions(customPath = null) {
  const route = useRoute()
  const authStore = useAuthStore()

  const activePath = computed(() => {
    if (customPath) return customPath
    return route?.path || ''
  })

  const permissions = computed(() => {
    return authStore.getPermissionsByPath(activePath.value)
  })

  const canRead = computed(() => Boolean(permissions.value?.can_read))
  const canCreate = computed(() => Boolean(permissions.value?.can_create))
  const canShow = computed(() => Boolean(permissions.value?.can_show))
  const canUpdate = computed(() => Boolean(permissions.value?.can_update))
  const canDelete = computed(() => Boolean(permissions.value?.can_delete))
  const canPrint = computed(() => Boolean(permissions.value?.can_print))

  return {
    permissions,
    canRead,
    canCreate,
    canShow,
    canUpdate,
    canDelete,
    canPrint
  }
}
