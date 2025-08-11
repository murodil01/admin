import api from '../base'
import endpoints from '../endpoints'

export const getGroups = () => request({ url: endpoints.group.getAll })
export const getGroupsById = id => request({ url: endpoints.group.getById(id) })
export const createGroups = data =>
	request({ url: endpoints.group.create, method: 'POST', body: data })
export const updateGroups = (id, data) =>
	request({ url: endpoints.group.update(id), method: 'PUT', body: data })
export const deleteGroups = id =>
	request({ url: endpoints.group.delete(id), method: 'DELETE' })

