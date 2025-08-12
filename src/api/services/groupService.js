import api from '../base'
import endpoints from '../endpoint'

export const getGroups = () => api.get(endpoints.group.getAll)
export const getGroupById = (id) => api.get(endpoints.group.getById(id))
export const createGroup = (data) => api.post(endpoints.group.create, data)
export const updateGroup = (id, data) => api.put(endpoints.group.update(id), data)
export const deleteGroup = (id) => api.delete(endpoints.group.delete(id))
