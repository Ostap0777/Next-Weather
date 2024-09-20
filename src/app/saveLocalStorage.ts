export const countries = [
   "Sydney",
	"São Paulo",
	"Toronto",
	"Beijing",
	"Paris",
	"Berlin",
	"New Delhi",
	"Rome",
	"Tokyo",
	"Mexico City",
	"Auckland",
	"Cape Town",
	"London",
	"New York",
	"Buenos Aires",
	"Madrid",
	"Istanbul",
	"Seoul",
	"Amsterdam"
 ];
 

 export const saveToLocalStorage = (countries: string[]) => {
	localStorage.setItem('availableCountries', JSON.stringify(countries));
 };
