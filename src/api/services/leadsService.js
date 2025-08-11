import api from '../base'
import endpoints from '../endpoints'

export const getLeads = () => request({ url: endpoints.leads.getAll })
export const getLeadsById = id => request({ url: endpoints.leads.getById(id) })
export const createLeads = data =>
	request({ url: endpoints.leads.create, method: 'POST', body: data })
export const updateLeads = (id, data) =>
	request({ url: endpoints.leads.update(id), method: 'PUT', body: data })
export const deleteLeads = id =>
	request({ url: endpoints.leads.delete(id), method: 'DELETE' })