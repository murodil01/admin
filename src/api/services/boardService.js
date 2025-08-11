import api from '../base'
import endpoints from '../endpoints'

export const getBoards = () => request({ url: endpoints.boards.getAll })
export const getBoardById = id => request({ url: endpoints.boards.getById(id) })
export const createBoard = data =>
	request({ url: endpoints.boards.create, method: 'POST', body: data })
export const updateBoard = (id, data) =>
	request({ url: endpoints.boards.update(id), method: 'PUT', body: data })
export const deleteBoard = id =>
	request({ url: endpoints.boards.delete(id), method: 'DELETE' })

