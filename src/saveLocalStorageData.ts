export const data = {

}

export const saveLocalStorageData = () => {
	localStorage.setItem('dataLocalStorage', JSON.stringify(data))
}